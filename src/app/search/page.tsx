'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/Search/SearchInput';
import { TranslationSection } from '@/components/Search/TranslationSection';
import { FlashcardStack } from '@/components/Flashcard/FlashcardStack';
import { CardSkeleton } from '@/components/Flashcard/CardSkeleton';
import { Toast } from '@/components/Toast';
import { LLMService } from '@/services/llm';
import { VocabularyStorage } from '@/services/vocabulary';
import { saveVocabularyEntry } from '@/actions/vocabulary';
import type { SearchResult } from '@/types';
import { AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import type { SwipeConfig } from '@/components/Flashcard/SwipeableCard';

// Search画面用のスワイプ設定
const searchSwipeConfig: SwipeConfig = {
    rightIcon: Plus,
    rightLabel: '追加',
    rightColor: '#3b82f6',  // blue-500
    leftIcon: Trash2,
    leftLabel: 'スキップ',
    leftColor: '#6b7280',   // gray-500
};

export default function SearchPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [fullTranslation, setFullTranslation] = useState<string | null>(null);
    const [originalText, setOriginalText] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [showToast, setShowToast] = useState(false);
    const [savedCount, setSavedCount] = useState(0);

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setResults([]);
        setFullTranslation(null);
        setOriginalText(null);

        try {
            const llm = new LLMService();
            const data = await llm.searchWord(query);
            setResults(data.results);
            if (data.fullTranslation && data.originalText) {
                setFullTranslation(data.fullTranslation);
                setOriginalText(data.originalText);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to fetch data. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = (result: SearchResult) => {
        if (session?.user) {
            startTransition(async () => {
                try {
                    await saveVocabularyEntry(result);
                    console.log('Saved to DB:', result.word);
                } catch (error) {
                    console.error('Failed to save:', error);
                }
            });
        } else {
            VocabularyStorage.save(result);
            console.log('Saved to localStorage:', result.word);

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

            {/* Translation Section - shown only for sentences */}
            {fullTranslation && originalText && (
                <TranslationSection
                    originalText={originalText}
                    translation={fullTranslation}
                />
            )}

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <CardSkeleton />
                ) : results.length > 0 ? (
                    <FlashcardStack
                        results={results}
                        onSave={handleSave}
                        onDiscard={(result) => {
                            console.log('Discarded:', result.word);
                        }}
                        swipeConfig={searchSwipeConfig}
                    />
                ) : null}
            </div>

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

