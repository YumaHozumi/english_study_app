import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import type { SearchResult } from '../../types';
import type { LucideIcon } from 'lucide-react';
import { Eye, ArrowLeft, ArrowRight } from 'lucide-react';

export interface SwipeConfig {
    rightIcon: LucideIcon;
    rightLabel: string;
    rightColor: string;
    leftIcon: LucideIcon;
    leftLabel: string;
    leftColor: string;
}

interface SwipeableCardProps {
    data: SearchResult;
    onSwipe?: (direction: 'left' | 'right') => void;
    swipeDirection: 'left' | 'right' | null;
    swipeConfig: SwipeConfig;
    style?: React.CSSProperties;
    isActive?: boolean;
    quizMode?: boolean; // true: 意味を隠してクイズ形式、false: 全表示
}

export const SwipeableCard = ({
    data,
    onSwipe,
    swipeDirection,
    swipeConfig,
    style,
    isActive = true,
    quizMode = false
}: SwipeableCardProps) => {
    const [isRevealed, setIsRevealed] = useState(!quizMode);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const dragOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const RightIcon = swipeConfig.rightIcon;
    const LeftIcon = swipeConfig.leftIcon;

    // カードが変わったらリセット
    useEffect(() => {
        setIsRevealed(!quizMode);
    }, [data.word, quizMode]);

    // アイコン/ラベル: 30px～50pxで素早くフェードイン
    const rightIconOpacity = useTransform(x, [30, 50], [0, 1]);
    const leftIconOpacity = useTransform(x, [-50, -30], [1, 0]);

    // スワイプ可能かどうか（クイズモードでは意味表示後のみ）
    const canSwipe = isActive && (!quizMode || isRevealed);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const THRESHOLD = 100;
        if (info.offset.x > THRESHOLD) {
            onSwipe?.('right');
        } else if (info.offset.x < -THRESHOLD) {
            onSwipe?.('left');
        } else {
            // 閾値未満: スプリングアニメーションで元の位置に戻す
            animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
        }
    };

    const handleReveal = () => {
        setIsRevealed(true);
    };

    return (
        <motion.div
            className="bg-[var(--card-bg)]"
            style={{
                width: '100%',
                maxWidth: '400px',
                minHeight: '400px',
                borderRadius: '20px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                marginLeft: 'auto',
                marginRight: 'auto',
                cursor: canSwipe ? 'grab' : 'default',
                x,
                rotate: canSwipe ? rotate : 0,
                opacity: isActive ? dragOpacity : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: 'clamp(1rem, 4vw, 2rem)',
                paddingTop: 'clamp(3rem, 8vh, 5rem)',
                pointerEvents: isActive ? 'auto' : 'none',
                ...style
            }}
            animate={{
                scale: isActive ? 1 : 0.95,
                opacity: isActive ? 1 : 0.7,
                zIndex: isActive ? 10 : 1,
            }}
            transition={{
                scale: { type: 'spring', stiffness: 300, damping: 25 },
                opacity: { duration: 0.2 },
                zIndex: { duration: 0 },
            }}
            drag={canSwipe ? "x" : false}
            dragConstraints={{ left: -150, right: 150 }}
            dragElastic={0.7}
            onDragEnd={canSwipe ? handleDragEnd : undefined}
            whileTap={canSwipe ? { cursor: 'grabbing', scale: 1.02 } : undefined}
            exit={{
                x: swipeDirection === 'right' ? 500 : swipeDirection === 'left' ? -500 : 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 25 : swipeDirection === 'left' ? -25 : 0,
                transition: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    duration: 0.5
                }
            }}
        >
            {/* Overlay Icons with Labels - only show for active card when revealed */}
            {isActive && isRevealed && (
                <>
                    <motion.div
                        className="absolute top-6 right-6 flex flex-col items-center gap-1 sm:top-10 sm:right-10"
                        style={{ opacity: rightIconOpacity, color: swipeConfig.rightColor }}
                    >
                        <RightIcon size={48} strokeWidth={3} />
                        <span className="text-sm font-medium">{swipeConfig.rightLabel}</span>
                    </motion.div>
                    <motion.div
                        className="absolute top-6 left-6 flex flex-col items-center gap-1 sm:top-10 sm:left-10"
                        style={{ opacity: leftIconOpacity, color: swipeConfig.leftColor }}
                    >
                        <LeftIcon size={48} strokeWidth={3} />
                        <span className="text-sm font-medium">{swipeConfig.leftLabel}</span>
                    </motion.div>
                </>
            )}

            <div className="text-center w-full">
                <h2 className="text-3xl sm:text-4xl mb-2 text-[var(--text-primary)]">{data.word}</h2>
                <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-6 sm:mb-8 italic">{data.phonetic}</p>

                {/* クイズモード: 意味非表示時 */}
                {quizMode && !isRevealed ? (
                    <div className="flex flex-col gap-4 mt-8">
                        <button
                            onClick={handleReveal}
                            className="w-full py-4 px-6 bg-indigo-500 text-white rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 text-lg font-medium hover:bg-indigo-600 transition-colors"
                        >
                            <Eye size={24} />
                            タップして意味を確認
                        </button>
                    </div>
                ) : (
                    /* 通常表示 or 意味表示後 */
                    <>
                        <div className="text-left w-full mb-4 sm:mb-6">
                            <h3 className="text-sm uppercase text-[var(--text-tertiary)] mb-2 tracking-wide">Meaning</h3>
                            <p className="text-base sm:text-lg text-[var(--text-primary)] leading-relaxed break-words">{data.meaning}</p>
                        </div>

                        <div className="text-left w-full">
                            <h3 className="text-sm uppercase text-[var(--text-tertiary)] mb-2 tracking-wide">Example</h3>
                            <p className="text-sm sm:text-base text-[var(--text-primary)] mb-2 break-words">{data.example}</p>
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] break-words">{data.exampleJp}</p>
                        </div>
                    </>
                )}
            </div>

            {/* スワイプガイド: 意味表示後のみ */}
            {isRevealed && (
                <div className="mt-auto pt-4 w-full shrink-0">
                    <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-tertiary)]">
                        <span style={{ color: swipeConfig.leftColor }} className="flex items-center gap-1">
                            <ArrowLeft size={18} />
                            {swipeConfig.leftLabel}
                        </span>
                        <span className="mx-4">スワイプで回答</span>
                        <span style={{ color: swipeConfig.rightColor }} className="flex items-center gap-1">
                            {swipeConfig.rightLabel}
                            <ArrowRight size={18} />
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
