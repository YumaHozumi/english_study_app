'use client';

import { useState, useMemo, useTransition, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { VocabularyStorage } from '@/services/vocabulary';
import {
    getTodayReviewWords,
    getVocabularyEntries,
    getMasteredWords,
    updateReviewResult
} from '@/actions/vocabulary';
import type { WordEntry, SearchResult } from '@/types';
import { FlashcardStack } from '@/components/Flashcard/FlashcardStack';
import { ArrowLeft, Calendar, BookOpen, CheckCircle, PartyPopper, Search, Check, RotateCcw } from 'lucide-react';
import type { SwipeConfig } from '@/components/Flashcard/SwipeableCard';

// Study画面用のスワイプ設定
const studySwipeConfig: SwipeConfig = {
    rightIcon: Check,
    rightLabel: '覚えた',
    rightColor: '#22c55e',  // green-500
    leftIcon: RotateCcw,
    leftLabel: '忘れた',
    leftColor: '#f97316',   // orange-500
};

// Study mode types
type StudyMode = 'today' | 'all' | 'mastered';

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
    srsLevel: number | null;
    nextReviewAt: number | null;
    lastReviewedAt: number | null;
    reviewCount: number | null;
    isMastered: boolean | null;
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
        srsLevel: entry.srsLevel,
        nextReviewAt: entry.nextReviewAt,
        lastReviewedAt: entry.lastReviewedAt,
        reviewCount: entry.reviewCount,
        isMastered: entry.isMastered,
    };
}

interface StudyViewProps {
    initialWords: WordEntry[];
    isAuthenticated: boolean;
}

export function StudyView({ initialWords, isAuthenticated }: StudyViewProps) {
    const { data: session } = useSession();
    const [words, setWords] = useState<WordEntry[]>(initialWords);
    const [mode, setMode] = useState<StudyMode>('today');
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [reviewCompleted, setReviewCompleted] = useState(false);
    const [totalReviewed, setTotalReviewed] = useState(0);
    const router = useRouter();

    // ゲストユーザーの場合はLocalStorageから読み込み
    useEffect(() => {
        if (!isAuthenticated) {
            const allWords = VocabularyStorage.getAll();
            const shuffled = [...allWords].sort(() => Math.random() - 0.5);
            setWords(shuffled);
        }
    }, [isAuthenticated]);

    // Fetch words when mode changes (only for authenticated users)
    const fetchWords = useCallback(async (newMode: StudyMode) => {
        if (!session?.user) return;

        setIsLoading(true);
        setReviewCompleted(false);

        startTransition(async () => {
            try {
                let entries: DbEntry[];

                switch (newMode) {
                    case 'today':
                        entries = await getTodayReviewWords() as DbEntry[];
                        break;
                    case 'mastered':
                        entries = await getMasteredWords() as DbEntry[];
                        break;
                    case 'all':
                    default:
                        entries = (await getVocabularyEntries() as DbEntry[])
                            .filter(e => !e.isMastered);
                        break;
                }

                const shuffled = [...entries.map(toWordEntry)].sort(() => Math.random() - 0.5);
                setWords(shuffled);
            } catch (error) {
                console.error('Failed to fetch vocabulary:', error);
            } finally {
                setIsLoading(false);
            }
        });
    }, [session]);

    // Handle mode change
    const handleModeChange = (newMode: StudyMode) => {
        setMode(newMode);
        if (newMode !== 'today') {
            fetchWords(newMode);
        } else {
            // 'today'モードに戻る場合はinitialWordsを使用（シャッフル）
            const shuffled = [...initialWords].sort(() => Math.random() - 0.5);
            setWords(shuffled);
            setReviewCompleted(false);
        }
    };

    // Handle review result (remembered or forgot)
    const handleReview = useCallback(async (wordId: string, remembered: boolean) => {
        if (!session?.user) return;

        try {
            await updateReviewResult(wordId, remembered);
            setTotalReviewed(prev => prev + 1);
        } catch (error) {
            console.error('Failed to update review result:', error);
        }
    }, [session]);

    // Convert to SearchResult for FlashcardStack
    const results: SearchResult[] = useMemo(() =>
        words.map(({ word, phonetic, meaning, example, exampleJp }) => ({
            word, phonetic, meaning, example, exampleJp
        })), [words]);

    // Mode tab component
    const ModeTab = ({ modeValue, icon: Icon, label }: {
        modeValue: StudyMode;
        icon: typeof Calendar;
        label: string;
    }) => (
        <button
            onClick={() => handleModeChange(modeValue)}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-none cursor-pointer
                transition-all duration-200
                ${mode === modeValue
                    ? 'bg-indigo-500 text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }
            `}
        >
            <Icon size={16} />
            <span className="text-sm">{label}</span>
        </button>
    );

    // Loading state
    if (isLoading || isPending) {
        return (
            <div className="p-8 text-center text-[var(--text-secondary)]">
                <p>Loading...</p>
            </div>
        );
    }

    // Review completed state
    if (reviewCompleted || (mode === 'today' && words.length === 0 && !isLoading)) {
        return (
            <div className="p-8 max-w-[600px] mx-auto text-center">
                <div className="mb-8">
                    <PartyPopper size={64} className="mx-auto text-yellow-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">
                        🎉 {mode === 'today' ? '今日の復習完了！' : '復習完了！'}
                    </h1>
                    {totalReviewed > 0 && (
                        <p className="text-[var(--text-secondary)]">
                            {totalReviewed}語を復習しました
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleModeChange('all')}
                        className="w-full px-6 py-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-none rounded-lg cursor-pointer flex items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        <BookOpen size={20} />
                        すべての単語を復習する
                    </button>
                    <button
                        onClick={() => router.push('/search')}
                        className="w-full px-6 py-4 bg-indigo-500 text-white border-none rounded-lg cursor-pointer flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors"
                    >
                        <Search size={20} />
                        新しい単語を追加する
                    </button>
                </div>
            </div>
        );
    }

    // Empty state for non-today modes
    if (words.length === 0) {
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
                    </div>
                </header>

                {/* Mode Tabs - always visible */}
                {isAuthenticated && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <ModeTab modeValue="today" icon={Calendar} label="今日の復習" />
                        <ModeTab modeValue="all" icon={BookOpen} label="すべて" />
                        <ModeTab modeValue="mastered" icon={CheckCircle} label="習得済み" />
                    </div>
                )}

                <div className="text-center py-8 text-[var(--text-secondary)]">
                    {mode === 'mastered' ? (
                        <>
                            <CheckCircle size={48} className="mx-auto mb-4 text-gray-400" />
                            <h2 className="text-lg mb-2">習得済みの単語はまだありません</h2>
                            <p className="mb-6 text-sm">単語を復習して習得していきましょう！</p>
                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <button
                                    onClick={() => handleModeChange('today')}
                                    className="w-full px-6 py-3 bg-indigo-500 text-white border-none rounded-lg cursor-pointer flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors"
                                >
                                    <Calendar size={18} />
                                    今日の復習へ
                                </button>
                                <button
                                    onClick={() => handleModeChange('all')}
                                    className="w-full px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-none rounded-lg cursor-pointer flex items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)] transition-colors"
                                >
                                    <BookOpen size={18} />
                                    すべての単語を復習
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg mb-2">復習する単語がありません</h2>
                            <p className="mb-6">単語を追加してください！</p>
                            <button
                                onClick={() => router.push('/search')}
                                className="px-6 py-3 bg-indigo-500 text-white border-none rounded-lg cursor-pointer"
                            >
                                検索へ
                            </button>
                        </>
                    )}
                </div>
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
                        {words.length}語を復習
                        {isAuthenticated && <span className="ml-2 text-green-500">✓ Synced</span>}
                    </p>
                </div>
            </header>

            {/* Mode Tabs (only for logged-in users) */}
            {isAuthenticated && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <ModeTab modeValue="today" icon={Calendar} label="今日の復習" />
                    <ModeTab modeValue="all" icon={BookOpen} label="すべて" />
                    <ModeTab modeValue="mastered" icon={CheckCircle} label="習得済み" />
                </div>
            )}

            <FlashcardStack
                results={results}
                onSave={(result) => {
                    // Find the word ID and update review
                    const word = words.find(w => w.word === result.word);
                    if (word) {
                        handleReview(word.id, true);
                    }
                }}
                onDiscard={(result) => {
                    // Find the word ID and update review
                    const word = words.find(w => w.word === result.word);
                    if (word) {
                        handleReview(word.id, false);
                    }
                }}
                onComplete={() => setReviewCompleted(true)}
                swipeConfig={studySwipeConfig}
                quizMode={true}
            />
        </div>
    );
}
