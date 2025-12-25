'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getVocabularyEntries, deleteVocabularyEntry } from '@/actions/vocabulary';
import { VocabularyStorage } from '@/services/vocabulary';
import type { WordEntry, SearchResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, BookOpen } from 'lucide-react';
import '@/components/Search/SearchInput.css';
import { WordDetailModal } from '@/components/Vocabulary/WordDetailModal';

// Convert DB entry to WordEntry type
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

export default function VocabularyPage() {
    const { data: session, status } = useSession();
    const [words, setWords] = useState<WordEntry[]>([]);
    const [deletedWord, setDeletedWord] = useState<WordEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (session?.user) {
            // Fetch from database for logged-in users
            startTransition(async () => {
                try {
                    const entries = await getVocabularyEntries();
                    setWords(entries.map(toWordEntry));
                } catch (error) {
                    console.error('Failed to fetch vocabulary:', error);
                }
            });
        } else {
            // Use localStorage for anonymous users
            setWords(VocabularyStorage.getAll());
        }
    }, [session, status]);

    const handleDelete = async (id: string) => {
        if (session?.user) {
            // Delete from database
            startTransition(async () => {
                try {
                    const deleted = await deleteVocabularyEntry(id);
                    setDeletedWord(toWordEntry(deleted as DbEntry));
                    const entries = await getVocabularyEntries();
                    setWords(entries.map(toWordEntry));
                } catch (error) {
                    console.error('Failed to delete:', error);
                }
            });
        } else {
            // Delete from localStorage
            const deleted = VocabularyStorage.delete(id);
            if (deleted) {
                setDeletedWord(deleted);
                setWords(VocabularyStorage.getAll());
            }
        }
    };

    const handleUndo = () => {
        if (deletedWord && !session?.user) {
            VocabularyStorage.restore(deletedWord);
            setWords(VocabularyStorage.getAll());
            setDeletedWord(null);
        }
        // Note: Undo for DB is more complex (would need to re-insert)
        // For now, just clear the undo state
        setDeletedWord(null);
    };

    const filteredWords = words.filter(w =>
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === 'loading') {
        return (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📚 My Vocabulary
                </h1>
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>
                    Total: {words.length} words
                    {session?.user && <span style={{ marginLeft: '0.5rem', color: '#48bb78' }}>✓ Synced</span>}
                    {!session?.user && words.length > 0 && <span style={{ marginLeft: '0.5rem', color: '#ed8936' }}>⚡ Local only</span>}
                </p>
            </header>

            {/* Login promotion banner for non-logged-in users */}
            {!session?.user && words.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    <div style={{ fontSize: '1.5rem' }}>💡</div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-color)' }}>
                            Sync across devices
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Sign in to access your vocabulary from any device
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/settings')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Sign in
                    </button>
                </div>
            )}

            {/* Search Filter */}
            <input
                type="text"
                className="search-input"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginBottom: '1rem', width: '100%' }}
            />

            {/* Loading indicator */}
            {isPending && (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#718096' }}>
                    Processing...
                </div>
            )}

            {/* Undo Banner */}
            <AnimatePresence>
                {deletedWord && !session?.user && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            background: '#2d3748',
                            color: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span>Deleted &quot;{deletedWord.word}&quot;</span>
                        <button
                            onClick={handleUndo}
                            style={{
                                background: 'none',
                                border: '1px solid white',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                            }}
                        >
                            <RotateCcw size={14} /> Undo
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Word List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence>
                    {filteredWords.map((entry) => (
                        <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            onClick={() => setSelectedWord(entry)}
                            style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                cursor: 'pointer',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                WebkitTapHighlightColor: 'transparent',
                                outline: 'none',
                                userSelect: 'none',
                            }}
                            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#2d3748' }}>
                                    {entry.word}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>
                                    {entry.phonetic}
                                </p>
                                <p style={{
                                    fontSize: '0.9rem',
                                    color: '#4a5568',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '280px',
                                }}>
                                    {entry.meaning}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#e53e3e',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {words.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                    <p>No words saved yet.</p>
                    <p style={{ fontSize: '0.9rem' }}>Search and swipe right to save words!</p>
                </div>
            )}

            {/* Study Mode Button */}
            {words.length > 0 && (
                <button
                    onClick={() => router.push('/study')}
                    style={{
                        width: '100%',
                        marginTop: '2rem',
                        padding: '1rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <BookOpen size={20} /> Start Study Mode
                </button>
            )}

            {/* Word Detail Modal */}
            <AnimatePresence>
                {selectedWord && (
                    <WordDetailModal
                        word={selectedWord}
                        onClose={() => setSelectedWord(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
