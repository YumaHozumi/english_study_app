'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { VocabularyStorage } from '@/services/vocabulary';
import { getVocabularyEntries } from '@/actions/vocabulary';
import type { WordEntry, SearchResult } from '@/types';
import { FlashcardStack } from '@/components/Flashcard/FlashcardStack';
import { ArrowLeft } from 'lucide-react';

type DbEntry = {
    id: string;
    userId: string;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    exampleJp: string;
    timestamp: number;
    createdAt: Date | null;
};

function toWordEntry(entry: DbEntry): WordEntry {
    return {
        id: entry.id,
        word: entry.word,
        phonetic: entry.phonetic,
        meaning: entry.meaning,
        example: entry.example,
        exampleJp: entry.exampleJp,
        timestamp: entry.timestamp,
    };
}

export default function StudyPage() {
    const { data: session, status } = useSession();
    const [words, setWords] = useState<WordEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (session?.user) {
            startTransition(async () => {
                try {
                    const entries = await getVocabularyEntries();
                    const shuffled = [...entries.map(toWordEntry)].sort(() => Math.random() - 0.5);
                    setWords(shuffled);
                } catch (error) {
                    console.error('Failed to fetch vocabulary:', error);
                } finally {
                    setIsLoading(false);
                }
            });
        } else {
            const allWords = VocabularyStorage.getAll();
            const shuffled = [...allWords].sort(() => Math.random() - 0.5);
            setWords(shuffled);
            setIsLoading(false);
        }
    }, [session, status]);

    const results: SearchResult[] = useMemo(() =>
        words.map(({ word, phonetic, meaning, example, exampleJp }) => ({
            word, phonetic, meaning, example, exampleJp
        })), [words]);

    if (status === 'loading' || isLoading || isPending) {
        return (
            <div className="p-8 text-center text-[var(--text-secondary)]">
                <p>Loading...</p>
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="p-8 text-center text-[var(--text-secondary)]">
                <h2>No words to study</h2>
                <p>Add some words first!</p>
                <button
                    onClick={() => router.push('/search')}
                    className="mt-4 px-6 py-3 bg-indigo-500 text-white border-none rounded-lg cursor-pointer"
                >
                    Go to Search
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-[600px] mx-auto">
            <header className="mb-4 flex items-center gap-4">
                <button
                    onClick={() => router.push('/vocabulary')}
                    className="bg-transparent border-none cursor-pointer p-2 flex items-center"
                >
                    <ArrowLeft size={24} className="text-[var(--text-secondary)]" />
                </button>
                <div>
                    <h1 className="text-xl m-0">📖 Study Mode</h1>
                    <p className="text-[var(--text-secondary)] text-sm m-0">
                        {words.length} words to review
                        {session?.user && <span className="ml-2 text-green-500">✓ Synced</span>}
                    </p>
                </div>
            </header>

            <FlashcardStack
                results={results}
                onSave={(result) => {
                    console.log('Remembered:', result.word);
                }}
                onDiscard={(result) => {
                    console.log('Forgot:', result.word);
                }}
            />
        </div>
    );
}
