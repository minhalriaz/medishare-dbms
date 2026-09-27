export type RagEntity =
  | 'medicine'
  | 'inventory'
  | 'donations'
  | 'donation-items'
  | 'organizations'
  | 'users'
  | 'verification'
  | 'requests'
  | 'request-items'
  | 'distributions'
  | 'distribution-items'
  | 'medicine-audit'
  | 'reports';

export type RagMode = 'knowledge' | 'database' | 'mixed';
export type RagAction = 'count' | 'list' | 'detail' | 'summary' | 'unknown';

export interface RagConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface RagQuestionPlan {
  mode: RagMode;
  entity?: RagEntity;
  action: RagAction;
  recordId?: number;
  searchTerm?: string;
  status?: string;
  unsupportedField?: string;
  contextualQuestion: string;
}

const knowledgeProcessPattern =
  /\b(explain|describe|process|workflow|business rule|how can|how do|how does|how to|what is medishare|what is a distribution)\b/i;
const liveDataPattern =
  /\b(how many|count|number of|list|show|recent|latest|currently|current|status|which|who|price|cost|find|search|record|available|low stock|in stock|pending|verified|submitted|requested|distributed|statistics|report|insights|summary|total)\b/i;
const countPattern = /\b(how many|count|number of|total number)\b/i;
const listPattern = /\b(list|show|recent|latest|which|who|all)\b/i;
const detailPattern = /\b(tell me about|details? about|status of|record|with id|id\s*#?\d+)\b/i;

function detectEntity(text: string): RagEntity | undefined {
  if (/\breports?\b|\binsights?\b|\bstatistics\s+(?:available|in|on|for)\b|high[ -]?volume donations|above[ -]?average donations|medicine contribution|organization activity|donation summary/i.test(text)) return 'reports';
  if (/\bmedicine\s+audit|audit\s+history\b/i.test(text)) return 'medicine-audit';
  if (/\bdistribution[ -]+items?\b/i.test(text) || /\bmedicines?\b.*\bdistributed\b/i.test(text)) return 'distribution-items';
  if (/\brequest[ -]+items?\b/i.test(text) || /\bmedicines?\b.*\brequested\b/i.test(text)) return 'request-items';
  if (/\bdonation[ -]+items?\b/i.test(text)) return 'donation-items';
  if (/\bmedicine\s+requests?\b/i.test(text)) return 'requests';
  if (/\b(?:how many|count|number of|pending|approved|rejected|recent|list|show|submitted|status of)\b/i.test(text) && /\brequests?\b/i.test(text)) return 'requests';
  if (/\bverifications?\b|\bverified\b/i.test(text)) return 'verification';
  if (/\binventory\b|\bstock\b|\blow stock\b|\bin stock\b/i.test(text)) return 'inventory';
  if (/\bmedicines?\b/i.test(text) && /\bavailable\b/i.test(text)) return 'inventory';
  if (/\borganizations?\b|\borgs?\b/i.test(text)) return 'organizations';
  if (/\busers?\b|\buser accounts?\b/i.test(text)) return 'users';
  if (/\bdonations?\b/i.test(text)) return 'donations';
  if (/\bdistributions?\b/i.test(text)) return 'distributions';
  if (/\brequests?\b/i.test(text)) return 'requests';
  if (/\bmedicines?\b|\bmedications?\b/i.test(text)) return 'medicine';
  if (/\breports?\b|\bstatistics\b/i.test(text)) return 'reports';
  return undefined;
}

function extractRecordId(text: string): number | undefined {
  const match =
    text.match(/\b(?:id|number)\s*#?\s*(\d+)\b/i) ??
    text.match(/#(\d+)\b/) ??
    text.match(/\b(?:donation|request|distribution|medicine|organization|user|inventory|verification)\s+#?(\d+)\b/i);
  const value = Number(match?.[1]);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function extractSearchTerm(text: string): string | undefined {
  const match = text.match(
    /\b(?:about|named|called)\s+(?:(?:the\s+)?(?:medicine|organization|donation|request|distribution)\s+)?["']?([^"'?.!,]+)["']?/i,
  );
  const fallback = text.match(
    /\b(?:medicine|organization|donation|request|distribution)\s+([a-z0-9][a-z0-9-]*)\b/i,
  )?.[1];
  const candidate = match?.[1]?.trim() ?? fallback;
  const term = candidate && !/^(is|are|was|were|available|pending|approved|rejected|requested|distributed|item|items|in|from|the)$/i.test(candidate)
    ? candidate
    : undefined;
  return term ? term.slice(0, 100) : undefined;
}

function extractStatus(text: string): string | undefined {
  const status = text.match(/\b(pending|approved|rejected|completed|cancelled|in transit|verified|available|low stock|out of stock)\b/i)?.[1];
  if (!status) return undefined;
  return status.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function analyzeQuestion(
  query: string,
  history: RagConversationTurn[] = [],
): RagQuestionPlan {
  const boundedHistory = history
    .filter((turn) => turn && (turn.role === 'user' || turn.role === 'assistant'))
    .slice(-8)
    .map((turn) => turn.content.slice(0, 1000));
  const contextualQuestion = [...boundedHistory, query.trim()].join('\n');
  const currentHasReferent = /\b(it|they|them|those|these|that|their)\b/i.test(query);
  const analysisText = currentHasReferent ? contextualQuestion : query;
  const entity = detectEntity(analysisText);
  const wantsKnowledge = knowledgeProcessPattern.test(query) || !liveDataPattern.test(query);
  const wantsLiveData =
    liveDataPattern.test(query) ||
    (currentHasReferent && liveDataPattern.test(contextualQuestion));
  const mode: RagMode =
    wantsKnowledge && wantsLiveData
      ? 'mixed'
      : wantsLiveData
        ? 'database'
        : 'knowledge';

  let action: RagAction = 'unknown';
  if (countPattern.test(query)) action = 'count';
  else if (detailPattern.test(query) || extractRecordId(query) || extractSearchTerm(query)) action = 'detail';
  else if (listPattern.test(query) || /\bwhat .* (?:requested|distributed)\b/i.test(query)) action = 'list';
  else if (/\b(summary|overview|statistics|report)\b/i.test(query)) action = 'summary';

  const unsupportedField = /\b(price|cost)\b/i.test(query) ? 'price' : undefined;
  let resolvedEntity = entity;

  if (/\borganizations?\b.*\bverified\b/i.test(query)) {
    resolvedEntity = 'organizations';
  }

  if (
    currentHasReferent &&
    /\borganizations?\b/i.test(query) &&
    /\bsubmitted\b/i.test(query) &&
    /\brequests?\b/i.test(contextualQuestion)
  ) {
    resolvedEntity = 'requests';
  }

  return {
    mode,
    entity: resolvedEntity,
    action,
    recordId: extractRecordId(query),
    searchTerm: extractSearchTerm(query),
    status: extractStatus(analysisText),
    unsupportedField,
    contextualQuestion,
  };
}