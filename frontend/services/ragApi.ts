const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface RagSource {
  chunk_id: number;
  similarity: number;
}

export interface RagAskResponse {
  message: string;
  query: string;
  answer: string;
  sources: RagSource[];
}

export const ragApi = {
  async ask(query: string): Promise<RagAskResponse> {
    const res = await fetch(`${BASE_URL}/rag/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`RAG API ${res.status}: ${error}`);
    }

    return res.json();
  },
};