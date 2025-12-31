import { useState, useEffect } from 'react';
import type { SearchResult } from '../../types';
import { SwipeableCard, type SwipeConfig } from './SwipeableCard';
import { AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface FlashcardStackProps {
    results: SearchResult[];
    onSave: (result: SearchResult) => void;
    onDiscard?: (result: SearchResult) => void;
    onComplete?: () => void;
    swipeConfig: SwipeConfig;
    quizMode?: boolean;
}

export const FlashcardStack = ({ results, onSave, onDiscard, onComplete, swipeConfig, quizMode = false }: FlashcardStackProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [history, setHistory] = useState<number[]>([]);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

    const activeResult = results[currentIndex];

    // 表示するカード（現在 + 次の1枚）をインデックスベースで管理
    const visibleCards = results
        .slice(currentIndex, currentIndex + 2)
        .map((result, offset) => ({
            data: result,
            originalIndex: currentIndex + offset,
            isActive: offset === 0,
        }));

    // Call onComplete when all cards are reviewed
    useEffect(() => {
        if (!activeResult && currentIndex > 0 && onComplete) {
            onComplete();
        }
    }, [activeResult, currentIndex, onComplete]);

    const handleSwipe = (direction: 'left' | 'right') => {
        setSwipeDirection(direction);

        setTimeout(() => {
            if (direction === 'right') {
                onSave(activeResult);
            } else {
                if (onDiscard) onDiscard(activeResult);
            }

            setHistory((prev) => [...prev, currentIndex]);
            setCurrentIndex((prev) => prev + 1);
            setSwipeDirection(null);
        }, 50);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const prevIndex = history[history.length - 1];
        setHistory((prev) => prev.slice(0, -1));
        setCurrentIndex(prevIndex);
    };

    if (!activeResult) {
        return (
            <div className="text-center py-16 text-[var(--text-secondary)]">
                <h3>No more cards!</h3>
                <p>You've reviewed all generated words.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-[400px] mx-auto" style={{ minHeight: '450px' }}>
            {/* Undo Button */}
            <div className="w-full flex justify-end pr-4 mb-4" style={{ position: 'relative', zIndex: 20 }}>
                {history.length > 0 && (
                    <button
                        onClick={handleUndo}
                        className="bg-[var(--card-bg)] border-none rounded-full w-10 h-10 shadow-md cursor-pointer flex items-center justify-center text-[var(--text-secondary)]"
                        title="Undo"
                    >
                        <RotateCcw size={20} />
                    </button>
                )}
            </div>

            {/* カードスタック - インデックスベースでレンダリング */}
            <div className="relative" style={{ minHeight: '400px' }}>
                <AnimatePresence>
                    {visibleCards.map((card) => (
                        <SwipeableCard
                            key={card.originalIndex}
                            data={card.data}
                            isActive={card.isActive}
                            onSwipe={card.isActive ? handleSwipe : undefined}
                            swipeDirection={card.isActive ? swipeDirection : null}
                            swipeConfig={swipeConfig}
                            quizMode={quizMode}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
