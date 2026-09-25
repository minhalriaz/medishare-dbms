import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class RagService {
  private readonly ai: GoogleGenAI;

  constructor(private readonly dataSource: DataSource) {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async testDatabase() {
    const documents = await this.dataSource.query(`
      SELECT
        document_id,
        document_name,
        document_type,
        source,
        created_at
      FROM rag_documents
      ORDER BY document_id DESC
    `);

    return {
      message: 'RAG database connection is working',
      documents,
    };
  }

  async ingestKnowledgeDocument() {
    const filePath = path.join(
      process.cwd(),
      'src',
      'rag',
      'knowledge',
      'medishare-guide.txt',
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`Knowledge file not found: ${filePath}`);
    }

    const text = fs.readFileSync(filePath, 'utf-8').trim();

    if (!text) {
      throw new Error('Knowledge file is empty');
    }

    const documentResult = await this.dataSource.query(
      `
      INSERT INTO rag_documents
        (document_name, document_type, source)
      OUTPUT INSERTED.document_id
      VALUES (@0, @1, @2)
      `,
      ['medishare-guide.txt', 'TXT', 'local knowledge file'],
    );

    const documentId = documentResult[0].document_id;

    const chunks = text
      .split(/\n\s*\n/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0);

    for (let i = 0; i < chunks.length; i++) {
      await this.dataSource.query(
        `
        INSERT INTO rag_chunks
          (document_id, chunk_text, chunk_order)
        VALUES (@0, @1, @2)
        `,
        [documentId, chunks[i], i + 1],
      );
    }

    return {
      message: 'Knowledge document ingested successfully',
      document_id: documentId,
      chunks_created: chunks.length,
    };
  }

  async testEmbedding() {
    const result = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: 'MediShare is a medicine donation platform.',
    });

    return {
      message: 'Gemini embedding is working',
      dimensions: result.embeddings?.[0]?.values?.length ?? 0,
      embedding_preview: result.embeddings?.[0]?.values?.slice(0, 5) ?? [],
    };
  }

  async generateChunkEmbeddings() {
    const chunks = await this.dataSource.query(`
      SELECT
        chunk_id,
        chunk_text
      FROM rag_chunks
      WHERE embedding IS NULL
      ORDER BY chunk_id
    `);

    if (chunks.length === 0) {
      return {
        message: 'No chunks need embeddings',
        processed: 0,
      };
    }

    let processed = 0;

    for (const chunk of chunks) {
      const result = await this.ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: chunk.chunk_text,
      });

      const embedding = result.embeddings?.[0]?.values;

      if (!embedding) {
        throw new Error(
          `Failed to generate embedding for chunk ${chunk.chunk_id}`,
        );
      }

      await this.dataSource.query(
        `
        UPDATE rag_chunks
        SET embedding = @0
        WHERE chunk_id = @1
        `,
        [JSON.stringify(embedding), chunk.chunk_id],
      );

      processed++;
    }

    return {
      message: 'Chunk embeddings generated successfully',
      processed,
    };
  }

  async search(query: string) {
    if (!query || !query.trim()) {
      throw new Error('Search query is required');
    }

    // Generate embedding for the user's question
    const result = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: query.trim(),
    });

    const queryEmbedding = result.embeddings?.[0]?.values;

    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding');
    }

    // Get all chunks that have embeddings
    const chunks = await this.dataSource.query(`
      SELECT
        chunk_id,
        document_id,
        chunk_order,
        chunk_text,
        embedding
      FROM rag_chunks
      WHERE embedding IS NOT NULL
    `);

    if (chunks.length === 0) {
      return {
        message: 'No embedded chunks found',
        results: [],
      };
    }

    // Calculate cosine similarity
    const results = chunks
      .map((chunk) => {
        const chunkEmbedding = JSON.parse(chunk.embedding);

        const similarity = this.cosineSimilarity(
          queryEmbedding,
          chunkEmbedding,
        );

        return {
          chunk_id: chunk.chunk_id,
          document_id: chunk.document_id,
          chunk_order: chunk.chunk_order,
          chunk_text: chunk.chunk_text,
          similarity,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);

    return {
      message: 'Semantic search completed',
      query,
      results: results.slice(0, 3),
    };
  }
  async ask(query: string) {
    if (!query || !query.trim()) {
      throw new Error('Question is required');
    }

    // Step 1: Generate embedding for the question
    const embeddingResult = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: query.trim(),
    });

    const queryEmbedding = embeddingResult.embeddings?.[0]?.values;

    if (!queryEmbedding) {
      throw new Error('Failed to generate question embedding');
    }

    // Step 2: Get all embedded chunks
    const chunks = await this.dataSource.query(`
    SELECT
      chunk_id,
      document_id,
      chunk_order,
      chunk_text,
      embedding
    FROM rag_chunks
    WHERE embedding IS NOT NULL
  `);

    if (chunks.length === 0) {
      return {
        message: 'No knowledge available',
        answer: 'I do not have any MediShare knowledge available yet.',
        sources: [],
      };
    }

    // Step 3: Calculate similarity
    const rankedChunks = chunks
      .map((chunk) => {
        const chunkEmbedding = JSON.parse(chunk.embedding);

        const similarity = this.cosineSimilarity(
          queryEmbedding,
          chunkEmbedding,
        );

        return {
          chunk_id: chunk.chunk_id,
          document_id: chunk.document_id,
          chunk_order: chunk.chunk_order,
          chunk_text: chunk.chunk_text,
          similarity,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);

    // Step 4: Take the top 3 relevant chunks
    const topChunks = rankedChunks.slice(0, 3);

    // Step 5: Build knowledge context
    const context = topChunks
      .map((chunk, index) => `SOURCE ${index + 1}:\n${chunk.chunk_text}`)
      .join('\n\n');

    // Step 6: Ask Gemini to answer using only the retrieved knowledge
    const prompt = `
You are the MediShare knowledge assistant.

Answer the user's question using ONLY the knowledge provided below.

If the answer is not contained in the provided knowledge, clearly say:
"I don't have enough information in the MediShare knowledge base to answer that."

Do not invent facts.
Do not use outside knowledge.
Keep the answer clear, natural, and helpful.

KNOWLEDGE:
${context}

USER QUESTION:
${query.trim()}
`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    const answer = response.text?.trim();

    if (!answer) {
      throw new Error('Gemini returned an empty answer');
    }

    return {
      message: 'RAG answer generated successfully',
      query: query.trim(),
      answer,
      sources: topChunks.map((chunk) => ({
        chunk_id: chunk.chunk_id,
        similarity: chunk.similarity,
      })),
    };
  }
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embedding dimensions do not match');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  }
}
