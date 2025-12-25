import type { SearchResult } from "../types";

export class LLMService {
    private apiUrl: string;

    constructor() {
        // Next.js API routes - use relative path
        this.apiUrl = '/api';
    }

    async searchWord(query: string): Promise<SearchResult[]> {
        try {
            const response = await fetch(`${this.apiUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(error.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Backend returns { results: [...] }
            return data.results.map((item: {
                word: string;
                phonetic: string;
                meaning: string;
                example: string;
                exampleJp: string;
            }) => ({
                word: item.word,
                phonetic: item.phonetic,
                meaning: item.meaning,
                example: item.example,
                exampleJp: item.exampleJp
            }));
        } catch (error) {
            console.error("API Error:", error);
            throw new Error(error instanceof Error ? error.message : "Failed to search word");
        }
    }
}
