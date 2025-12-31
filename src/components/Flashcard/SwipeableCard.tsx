import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import type { SearchResult } from '../../types';
import type { LucideIcon } from 'lucide-react';

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
}

export const SwipeableCard = ({ data, onSwipe, swipeDirection, swipeConfig, style, isActive = true }: SwipeableCardProps) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const dragOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const RightIcon = swipeConfig.rightIcon;
    const LeftIcon = swipeConfig.leftIcon;

    // アイコン/ラベル: 30px～50pxで素早くフェードイン
    const rightIconOpacity = useTransform(x, [30, 50], [0, 1]);
    const leftIconOpacity = useTransform(x, [-50, -30], [1, 0]);

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
                cursor: isActive ? 'grab' : 'default',
                x,
                rotate: isActive ? rotate : 0,
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
            drag={isActive ? "x" : false}
            dragConstraints={{ left: -150, right: 150 }}
            dragElastic={0.7}
            onDragEnd={isActive ? handleDragEnd : undefined}
            whileTap={isActive ? { cursor: 'grabbing', scale: 1.02 } : undefined}
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
            {/* Overlay Icons with Labels - only show for active card */}
            {isActive && (
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

                <div className="text-left w-full mb-4 sm:mb-6">
                    <h3 className="text-sm uppercase text-[var(--text-tertiary)] mb-2 tracking-wide">Meaning</h3>
                    <p className="text-base sm:text-lg text-[var(--text-primary)] leading-relaxed break-words">{data.meaning}</p>
                </div>

                <div className="text-left w-full">
                    <h3 className="text-sm uppercase text-[var(--text-tertiary)] mb-2 tracking-wide">Example</h3>
                    <p className="text-sm sm:text-base text-[var(--text-primary)] mb-2 break-words">{data.example}</p>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] break-words">{data.exampleJp}</p>
                </div>
            </div>

            <div className="text-xs text-[var(--text-tertiary)] mt-auto pt-3 flex items-center justify-center gap-3 shrink-0">
                <span>← {swipeConfig.leftLabel}</span>
                <span>•</span>
                <span>{swipeConfig.rightLabel} →</span>
            </div>
        </motion.div>
    );
};
