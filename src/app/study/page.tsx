'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { VocabularyStorage } from '@/services/vocabulary';
import type { WordEntry, SearchResult } from '@/types';
import { FlashcardStack } from '@/components/Flashcard/FlashcardStack';
import { ArrowLeft } from 'lucide-react';

export default function StudyPage() {
    const [words, setWords] = useState<WordEntry[]>([]);
    const router = useRouter();

    useEffect(() => {
        const allWords = VocabularyStorage.getAll();
        // Shuffle for random order
        const shuffled = [...allWords].sort(() => Math.random() - 0.5);
        setWords(shuffled);
    }, []);

    // Convert WordEntry to SearchResult for FlashcardStack compatibility
    const results: SearchResult[] = useMemo(() =>
        words.map(({ word, phonetic, meaning, example, exampleJp }) => ({
            word, phonetic, meaning, example, exampleJp
        })), [words]);

    if (words.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
                <h2>No words to study</h2>
                <p>Add some words first!</p>
                <button
                    onClick={() => router.push('/search')}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    Go to Search
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => router.push('/vocabulary')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <ArrowLeft size={24} color="#4a5568" />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.25rem', margin: 0 }}>📖 Study Mode</h1>
                    <p style={{ color: '#718096', fontSize: '0.85rem', margin: 0 }}>
                        {words.length} words to review
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
