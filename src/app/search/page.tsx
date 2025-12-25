'use client';

import { useState } from 'react';
import { SearchInput } from '@/components/Search/SearchInput';
import { FlashcardStack } from '@/components/Flashcard/FlashcardStack';
import { LLMService } from '@/services/llm';
import { VocabularyStorage } from '@/services/vocabulary';
import type { SearchResult } from '@/types';

export default function SearchPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setResults([]);

        try {
            const llm = new LLMService();
            const data = await llm.searchWord(query);
            setResults(data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch data. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <SearchInput onSearch={handleSearch} isLoading={isLoading} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.length > 0 && (
                    <FlashcardStack
                        results={results}
                        onSave={(result) => {
                            VocabularyStorage.save(result);
                            console.log('Saved:', result.word);
                        }}
                        onDiscard={(result) => {
                            console.log('Discarded:', result.word);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
