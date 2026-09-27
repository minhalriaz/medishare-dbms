export type RagSource =
  | {
      kind: 'knowledge';
      label: string;
      chunk_id: number;
      similarity: number;
    }
  | {
      kind: 'database';
      label: string;
      table: string;
    }
  | {
      kind: 'application';
      label: string;
      section: string;
    };