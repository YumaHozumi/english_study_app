export interface WordEntry {
    id: string;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    exampleJp: string;
    timestamp: number;
    // SRS fields (optional for backward compatibility)
    srsLevel?: number | null;
    nextReviewAt?: number | null;
    lastReviewedAt?: number | null;
    reviewCount?: number | null;
    isMastered?: boolean | null;
}

export type SearchResult = Omit<WordEntry, 'id' | 'timestamp'>;

export interface SentencePair {
    en: string;
    ja: string;
    structure?: SentenceStructure;
}

export interface Chunk {
    id: number;
    text: string;
    label: string;
    jp_label: string;
    modifies_id: number | null;
    ja_text: string;
    grammar_note?: string;
}

export interface SentenceStructure {
    chunks: Chunk[];
}

export interface SearchResponse {
    results: SearchResult[];
    sentencePairs?: SentencePair[];
}
