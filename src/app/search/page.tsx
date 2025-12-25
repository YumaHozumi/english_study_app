'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/Search/SearchInput';
import { FlashcardStack } from '@/components/Flashcard/FlashcardStack';
import { Toast } from '@/components/Toast';
import { LLMService } from '@/services/llm';
import { VocabularyStorage } from '@/services/vocabulary';
import { saveVocabularyEntry } from '@/actions/vocabulary';
import type { SearchResult } from '@/types';
import { AnimatePresence } from 'framer-motion';

export default function SearchPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isPending, startTransition] = useTransition();
    const [showToast, setShowToast] = useState(false);
    const [savedCount, setSavedCount] = useState(0);

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

            // Show toast for sync promotion after every 3 saves
            const newCount = savedCount + 1;
            setSavedCount(newCount);
            if (newCount % 3 === 0) {
                setShowToast(true);
            }
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

            {/* Toast for sync promotion */}
            <AnimatePresence>
                {showToast && (
                    <Toast
                        message="Saved locally! Sign in to sync."
                        action={{
                            label: 'Sign in',
                            onClick: () => {
                                setShowToast(false);
                                router.push('/settings');
                            },
                        }}
                        onClose={() => setShowToast(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
