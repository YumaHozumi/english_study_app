import { useState } from 'react';
import type { SearchResult } from '../../types';
import { SwipeableCard } from './SwipeableCard';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface FlashcardStackProps {
    results: SearchResult[];
    onSave: (result: SearchResult) => void;
    onDiscard?: (result: SearchResult) => void;
}

export const FlashcardStack = ({ results, onSave, onDiscard }: FlashcardStackProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [history, setHistory] = useState<number[]>([]); // Track indices for undo
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

    // We only show the current card and the one immediately after it
    const activeResult = results[currentIndex];
    const nextResult = results[currentIndex + 1];

    const handleSwipe = (direction: 'left' | 'right') => {
        // Set direction first for exit animation
        setSwipeDirection(direction);

        // Small delay to let exit animation use the direction
        setTimeout(() => {
            if (direction === 'right') {
                onSave(activeResult);
            } else {
                if (onDiscard) onDiscard(activeResult);
            }

            setHistory((prev) => [...prev, currentIndex]);
            setCurrentIndex((prev) => prev + 1);
            setSwipeDirection(null); // Reset for next card
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
            <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
                <h3>No more cards!</h3>
                <p>You've reviewed all generated words.</p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '600px', margin: '0 auto' }}>
            {/* Helper text / Undo Button Area */}
            <div style={{ position: 'absolute', top: -50, width: '100%', display: 'flex', justifyContent: 'flex-end', paddingRight: '1rem', zIndex: 10 }}>
                {history.length > 0 && (
                    <button
                        onClick={handleUndo}
                        style={{
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4a5568'
                        }}
                        title="Undo"
                    >
                        <RotateCcw size={20} />
                    </button>
                )}
            </div>

            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Background Card (The "next" card) */}
                {nextResult && (
                    <div
                        key={`next-${currentIndex + 1}`}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            width: '100%',
                            maxWidth: '400px',
                            height: '500px',
                            backgroundColor: '#f7fafc',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            transform: 'scale(0.95) translateY(10px)',
                            zIndex: 0,
                        }}
                    >
                        {/* Simplified preview of next card */}
                        <div style={{ padding: '2rem', opacity: 0.5, filter: 'blur(1px)' }}>
                            <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>{nextResult.word}</h2>
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
