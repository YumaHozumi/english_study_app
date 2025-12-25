'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { SearchInput } from '@/components/Search/SearchInput';
import { FlashcardStack } from '@/components/Flashcard/FlashcardStack';
import { LLMService } from '@/services/llm';
import { VocabularyStorage } from '@/services/vocabulary';
import { saveVocabularyEntry } from '@/actions/vocabulary';
import type { SearchResult } from '@/types';

export default function SearchPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isPending, startTransition] = useTransition();

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

    const handleSave = (result: SearchResult) => {
        if (session?.user) {
            // Save to database for logged-in users
            startTransition(async () => {
                try {
                    await saveVocabularyEntry(result);
                    console.log('Saved to DB:', result.word);
                } catch (error) {
                    console.error('Failed to save:', error);
                }
            });
        } else {
            // Save to localStorage for anonymous users
            VocabularyStorage.save(result);
            console.log('Saved to localStorage:', result.word);
        }
    };

    return (
        <div>
            <SearchInput onSearch={handleSearch} isLoading={isLoading || isPending} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.length > 0 && (
                    <FlashcardStack
                        results={results}
                        onSave={handleSave}
                        onDiscard={(result) => {
                            console.log('Discarded:', result.word);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
