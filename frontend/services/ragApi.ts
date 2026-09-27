const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type RagSource =
  | {
      kind: 'knowledge';
      label: string;
      chunk_id: number;
      similarity: number;
    }
  | { kind: 'database'; label: string; table: string }
  | { kind: 'application'; label: string; section: string };

export interface RagConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface RagAskResponse {
  message: string;
  query: string;
  answer: string;
  sources: RagSource[];
}

export const ragApi = {
  async ask(
    query: string,
    history: RagConversationTurn[] = [],
  ): Promise<RagAskResponse> {
    const res = await fetch(`${BASE_URL}/rag/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        history: history.slice(-8).map((turn) => ({
          ...turn,
          content: turn.content.slice(-1000),
        })),
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`RAG API ${res.status}: ${error}`);
    }

    return res.json();
  },
};