import { useState, useEffect } from 'react';
import type { SearchResult } from '../../types';
import { SwipeableCard } from './SwipeableCard';
import { AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface FlashcardStackProps {
    results: SearchResult[];
    onSave: (result: SearchResult) => void;
    onDiscard?: (result: SearchResult) => void;
    onComplete?: () => void;
}

export const FlashcardStack = ({ results, onSave, onDiscard, onComplete }: FlashcardStackProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [history, setHistory] = useState<number[]>([]);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

    const activeResult = results[currentIndex];
    const nextResult = results[currentIndex + 1];

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
        <div className="relative w-full max-w-[400px] h-[600px] mx-auto">
            {/* Undo Button */}
            <div className="absolute -top-12 w-full flex justify-end pr-4 z-10">
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

            <div className="relative w-full h-full">
                {/* Background Card */}
                {nextResult && (
                    <div
                        key={`next-${currentIndex + 1}`}
                        className="absolute top-0 left-0 right-0 mx-auto w-full max-w-[400px] h-[500px] bg-gray-100 rounded-2xl border border-gray-200 scale-95 translate-y-2.5 z-0"
                    >
                        <div className="p-8 opacity-50 blur-[1px]">
                            <h2 className="text-3xl text-center">{nextResult.word}</h2>
                        </div>
                    </div>
                )}

                {/* Active Card */}
                <AnimatePresence>
                    <SwipeableCard
                        key={currentIndex}
                        data={activeResult}
                        onSwipe={handleSwipe}
                        swipeDirection={swipeDirection}
                        style={{ zIndex: 1 }}
                    />
                </AnimatePresence>
            </div>
        </div>
    );
};
