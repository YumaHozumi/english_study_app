export interface WordEntry {
    id: string;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    exampleJp: string;
    timestamp: number;
}

export type SearchResult = Omit<WordEntry, 'id' | 'timestamp'>;

export interface SearchResponse {
    results: SearchResult[];
    fullTranslation?: string;
    originalText?: string;
}
