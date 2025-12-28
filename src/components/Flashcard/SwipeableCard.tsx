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
    onSwipe: (direction: 'left' | 'right') => void;
    swipeDirection: 'left' | 'right' | null;
    swipeConfig: SwipeConfig;
    style?: React.CSSProperties;
}

export const SwipeableCard = ({ data, onSwipe, swipeDirection, swipeConfig, style }: SwipeableCardProps) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const RightIcon = swipeConfig.rightIcon;
    const LeftIcon = swipeConfig.leftIcon;

    // アイコン/ラベル: 30px～50pxで素早くフェードイン
    const rightIconOpacity = useTransform(x, [30, 50], [0, 1]);
    const leftIconOpacity = useTransform(x, [-50, -30], [1, 0]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const THRESHOLD = 200;
        if (info.offset.x > THRESHOLD) {
            onSwipe('right');
        } else if (info.offset.x < -THRESHOLD) {
            onSwipe('left');
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
                height: '500px',
                borderRadius: '20px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                marginLeft: 'auto',
                marginRight: 'auto',
                cursor: 'grab',
                x,
                rotate,
                opacity,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                ...style
            }}
            drag="x"
            dragConstraints={{ left: -150, right: 150 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing', scale: 1.02 }}
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
            {/* Overlay Icons with Labels */}
            <motion.div
                className="absolute top-10 right-10 flex flex-col items-center gap-1"
                style={{ opacity: rightIconOpacity, color: swipeConfig.rightColor }}
            >
                <RightIcon size={48} strokeWidth={3} />
                <span className="text-sm font-medium">{swipeConfig.rightLabel}</span>
            </motion.div>
            <motion.div
                className="absolute top-10 left-10 flex flex-col items-center gap-1"
                style={{ opacity: leftIconOpacity, color: swipeConfig.leftColor }}
            >
                <LeftIcon size={48} strokeWidth={3} />
                <span className="text-sm font-medium">{swipeConfig.leftLabel}</span>
            </motion.div>

            <div className="text-center w-full">
                <h2 className="text-4xl mb-2 text-[var(--text-primary)]">{data.word}</h2>
                <p className="text-xl text-[var(--text-secondary)] mb-8 italic">{data.phonetic}</p>

                <div className="text-left w-full mb-6">
                    <h3 className="text-sm uppercase text-[var(--text-tertiary)] mb-2 tracking-wide">Meaning</h3>
                    <p className="text-lg text-[var(--text-primary)] leading-relaxed">{data.meaning}</p>
                </div>

                <div className="text-left w-full flex-1">
                    <h3 className="text-sm uppercase text-[var(--text-tertiary)] mb-2 tracking-wide">Example</h3>
                    <p className="text-base text-[var(--text-primary)] mb-2">{data.example}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{data.exampleJp}</p>
                </div>
            </div>

            <div className="text-xs text-[var(--text-tertiary)] mt-4 flex items-center justify-center gap-3">
                <span>← {swipeConfig.leftLabel}</span>
                <span>•</span>
                <span>{swipeConfig.rightLabel} →</span>
            </div>
        </motion.div>
    );
};
