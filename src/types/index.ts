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

export interface SearchResponse {
    results: SearchResult[];
    fullTranslation?: string;
    originalText?: string;
}
