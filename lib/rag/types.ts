/** Shared types for the RAG engine. */

export interface IngestDocument {
  doc_type: string; // faq | service | pricing | rag | company | blog | <your own>
  external_id?: string | null; // stable id from source data
  title?: string | null;
  content: string; // the text that gets embedded
  metadata?: Record<string, unknown>;
}

export interface RetrievedDoc {
  doc_type: string;
  title: string | null;
  external_id: string | null;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

export interface SourceDoc {
  doc_type: string;
  title: string | null;
  external_id: string | null;
  similarity: number;
}

/** Lightweight page identity the widget sends so replies can be page-aware. */
export interface PageInfo {
  path?: string | null;
  title?: string | null;
  topic?: string | null;
}

export interface ChatRequestBody {
  message: string;
  session_id: string;
  page_url?: string | null;
  page?: PageInfo | null;
}

export interface ChatResponseBody {
  reply: string;
  conversation_id: string | null;
  sources: SourceDoc[];
}
