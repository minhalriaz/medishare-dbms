import { DataSource } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { RagDataService } from './rag-data.service';
import { RagService } from './rag.service';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      embedContent: jest.fn().mockResolvedValue({
        embeddings: [{ values: [1, 0] }],
      }),
      generateContent: jest.fn().mockResolvedValue({ text: 'Grounded answer.' }),
    },
  })),
}));

describe('RagService hybrid routing', () => {
  let service: RagService;
  let dataSource: { query: jest.Mock };
  let ragDataService: { retrieve: jest.Mock };
  let ai: { models: { embedContent: jest.Mock; generateContent: jest.Mock } };

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource = { query: jest.fn().mockResolvedValue([]) };
    ragDataService = { retrieve: jest.fn() };
    service = new RagService(
      dataSource as unknown as DataSource,
      ragDataService as unknown as RagDataService,
    );
    ai = (GoogleGenAI as jest.Mock).mock.results[0].value;
  });

  it('answers database-only questions from structured live rows without Gemini', async () => {
    ragDataService.retrieve.mockResolvedValue({
      context: 'medicine_count: 4',
      rows: [{ medicine_count: 4 }],
      tables: ['medicine'],
    });

    const result = await service.ask('How many medicines are there?');

    expect(result.answer).toContain('medicine count: 4');
    expect(result.sources.map((source) => source.kind)).toEqual(['application', 'database']);
    expect(dataSource.query).not.toHaveBeenCalled();
    expect(ai.models.generateContent).not.toHaveBeenCalled();
  });

  it('re-resolves pending request context for a follow-up', async () => {
    ragDataService.retrieve.mockResolvedValue({
      context: 'organization_name: Example Clinic',
      rows: [{ organization_name: 'Example Clinic' }],
      tables: ['medicine_request', 'organization'],
    });

    await service.ask('Which organizations submitted them?', [
      { role: 'user', content: 'How many medicine requests are pending?' },
      { role: 'assistant', content: 'There are pending requests.' },
    ]);

    expect(ragDataService.retrieve).toHaveBeenCalledWith(
      expect.objectContaining({ entity: 'requests', status: 'Pending' }),
    );
  });

  it('combines knowledge, database and application sources for mixed questions', async () => {
    dataSource.query.mockResolvedValue([
      {
        chunk_id: 3,
        document_id: 1,
        chunk_order: 1,
        chunk_text: 'Distribution records track fulfillment of a medicine request.',
        embedding: '[1,0]',
      },
    ]);
    ragDataService.retrieve.mockResolvedValue({
      context: 'distribution_count: 2',
      rows: [{ distribution_count: 2 }],
      tables: ['distribution'],
    });

    const result = await service.ask(
      'Explain the distribution process and tell me how many distributions currently exist.',
    );

    expect(result.sources.map((source) => source.kind)).toEqual([
      'application',
      'knowledge',
      'database',
    ]);
    expect(ai.models.generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: expect.stringContaining('distribution_count: 2'),
      }),
    );
  });

  it('falls back when the RAG knowledge tables are missing', async () => {
    dataSource.query.mockImplementation((sql: string) => {
      if (sql.includes('FROM rag_chunks')) {
        return Promise.reject(new Error("Invalid object name 'rag_chunks'."));
      }
      return Promise.resolve([]);
    });

    ragDataService.retrieve.mockResolvedValue({
      context: 'distribution_count: 2',
      rows: [{ distribution_count: 2 }],
      tables: ['distribution'],
    });

    const result = await service.ask(
      'Explain the distribution process and tell me how many distributions exist.',
    );

    expect(result.answer).toContain('Grounded answer.');
    expect(ai.models.generateContent).toHaveBeenCalled();
  });

  it('does not query or ask Gemini to answer unsupported prices', async () => {
    const result = await service.ask('What is the price of medicine Paracetamol?');

    expect(result.answer).toContain("I don't have enough information");
    expect(ragDataService.retrieve).not.toHaveBeenCalled();
    expect(dataSource.query).not.toHaveBeenCalled();
    expect(ai.models.generateContent).not.toHaveBeenCalled();
  });
});