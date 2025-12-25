import type { WordEntry, SearchResult } from '../types';

const STORAGE_KEY = 'vocabulary_words';

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

export const VocabularyStorage = {
    getAll(): WordEntry[] {
        if (!isClient) {
            return []; // Empty array for SSR
        }
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    save(result: SearchResult): WordEntry {
        const entries = this.getAll();
        const newEntry: WordEntry = {
            ...result,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        entries.unshift(newEntry); // Add to beginning
        if (isClient) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        }
        return newEntry;
    },

    delete(id: string): WordEntry | null {
        const entries = this.getAll();
        const index = entries.findIndex(e => e.id === id);
        if (index === -1) return null;

        const [deleted] = entries.splice(index, 1);
        if (isClient) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        }
        return deleted;
    },

    restore(entry: WordEntry): void {
        const entries = this.getAll();
        // Restore at original position based on timestamp
        const insertIndex = entries.findIndex(e => e.timestamp < entry.timestamp);
        if (insertIndex === -1) {
            entries.push(entry);
        } else {
            entries.splice(insertIndex, 0, entry);
        }
        if (isClient) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        }
    },

    count(): number {
        return this.getAll().length;
    }
};
