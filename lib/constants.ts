import { LLM_MODEL } from './llm_model';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['application/pdf'];

export const DEFAULT_LLM_MODEL_NAME = 'gemini-2.5-flash-lite' as LLM_MODEL;
export const DEFAULT_EMBEDDING_MODEL_NAME = 'gemini-embedding-001';

// Vector search configuration
export const TOP_K_RETRIEVAL = 200; // Number of profiles to retrieve from vector search
export const TOP_N_RESULTS = 9; // Number of profiles to return after reranking

// Reranking configuration
export const MIN_SCORE_THRESHOLD = 0.3; // Minimum final score to include in results

// Legacy - kept for backwards compatibility
export const SIMILARITY_THRESHOLD = 0.65;
