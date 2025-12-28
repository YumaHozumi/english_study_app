'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getVocabularyEntries, deleteVocabularyEntry } from '@/actions/vocabulary';
import { VocabularyStorage } from '@/services/vocabulary';
import type { WordEntry, SearchResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, BookOpen } from 'lucide-react';
import { WordDetailModal } from '@/components/Vocabulary/WordDetailModal';

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
            startTransition(async () => {
                try {
                    const entries = await getVocabularyEntries();
                    setWords(entries.map(toWordEntry));
                } catch (error) {
                    console.error('Failed to fetch vocabulary:', error);
                }
            });
        } else {
            setWords(VocabularyStorage.getAll());
        }
    }, [session, status]);

    const handleDelete = async (id: string) => {
        if (session?.user) {
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
        setDeletedWord(null);
    };

    const filteredWords = words.filter(w =>
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === 'loading') {
        return (
            <div className="p-4 text-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-[600px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl mb-2 flex items-center gap-2">
                    📚 My Vocabulary
                </h1>
                <p className="text-[var(--text-secondary)] text-sm">
                    Total: {words.length} words
                    {session?.user && <span className="ml-2 text-green-500">✓ Synced</span>}
                    {!session?.user && words.length > 0 && <span className="ml-2 text-orange-500">⚡ Local only</span>}
                </p>
            </header>

            {/* Login promotion banner */}
            {!session?.user && words.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4 mb-4 flex items-center gap-4">
                    <div className="text-2xl">💡</div>
                    <div className="flex-1">
                        <p className="m-0 font-medium text-[var(--text-color)]">
                            Sync across devices
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Sign in to access your vocabulary from any device
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/settings')}
                        className="px-4 py-2 bg-[var(--primary-color)] text-white border-none rounded-lg cursor-pointer text-sm font-medium whitespace-nowrap"
                    >
                        Sign in
                    </button>
                </div>
            )}

            {/* Search Filter */}
            <input
                type="text"
                className="w-full mb-4 px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Study Mode Button */}
            {words.length > 0 && (
                <button
                    onClick={() => router.push('/study')}
                    className="w-full mb-4 p-4 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-xl cursor-pointer flex items-center justify-center gap-2"
                >
                    <BookOpen size={20} /> Start Study Mode
                </button>
            )}

            {/* Loading indicator */}
            {isPending && (
                <div className="text-center p-4 text-[var(--text-secondary)]">
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
                        className="bg-gray-800 text-white px-4 py-3 rounded-lg mb-4 flex justify-between items-center"
                    >
                        <span>Deleted &quot;{deletedWord.word}&quot;</span>
                        <button
                            onClick={handleUndo}
                            className="bg-transparent border border-white text-white px-3 py-1 rounded cursor-pointer flex items-center gap-1"
                        >
                            <RotateCcw size={14} /> Undo
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Word List */}
            <div className="flex flex-col gap-3">
                <AnimatePresence>
                    {filteredWords.map((entry) => (
                        <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            onClick={() => setSelectedWord(entry)}
                            className="bg-[var(--card-bg)] p-4 rounded-xl shadow-md flex justify-between items-start cursor-pointer select-none transition-transform duration-150 outline-none"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg mb-1 text-[var(--text-color)] truncate">
                                    {entry.word}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-2 truncate">
                                    {entry.phonetic}
                                </p>
                                <p className="text-sm text-[var(--text-color)] truncate">
                                    {entry.meaning}
                                </p>
                            </div>
                            <div className="flex gap-2 items-center flex-shrink-0 ml-2">
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                    className="bg-transparent border-none text-red-500 cursor-pointer p-1"
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
                <div className="text-center py-12 text-[var(--text-secondary)]">
                    <p>No words saved yet.</p>
                    <p className="text-sm">Search and swipe right to save words!</p>
                </div>
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
