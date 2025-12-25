import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { SearchResult } from '../../types';
import { X, Check } from 'lucide-react';

interface SwipeableCardProps {
    data: SearchResult;
    onSwipe: (direction: 'left' | 'right') => void;
    swipeDirection: 'left' | 'right' | null;
    style?: React.CSSProperties;
}

export const SwipeableCard = ({ data, onSwipe, swipeDirection, style }: SwipeableCardProps) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const background = useTransform(
        x,
        [-200, -100, 0, 100, 200],
        [
            'rgba(255, 80, 80, 0.2)',
            'rgba(255, 80, 80, 0.1)',
            'rgba(255, 255, 255, 1)',
            'rgba(80, 255, 80, 0.1)',
            'rgba(80, 255, 80, 0.2)'
        ]
    );

    const checkOpacity = useTransform(x, [50, 150], [0, 1]);
    const crossOpacity = useTransform(x, [-150, -50], [1, 0]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipe('right');
        } else if (info.offset.x < -threshold) {
            onSwipe('left');
        }
    };

    return (
        <motion.div
            style={{
                width: '100%',
                maxWidth: '400px',
                height: '500px',
                backgroundColor: '#fff',
                background: background as unknown as string,
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
            {/* Overlay Icons */}
            <motion.div className="absolute top-10 right-10 text-green-500" style={{ opacity: checkOpacity }}>
                <Check size={64} strokeWidth={3} />
            </motion.div>
            <motion.div className="absolute top-10 left-10 text-red-500" style={{ opacity: crossOpacity }}>
                <X size={64} strokeWidth={3} />
            </motion.div>

            <div className="text-center w-full">
                <h2 className="text-4xl mb-2 text-gray-800">{data.word}</h2>
                <p className="text-xl text-gray-500 mb-8 italic">{data.phonetic}</p>

                <div className="text-left w-full mb-6">
                    <h3 className="text-sm uppercase text-gray-400 mb-2 tracking-wide">Meaning</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{data.meaning}</p>
                </div>

                <div className="text-left w-full flex-1">
                    <h3 className="text-sm uppercase text-gray-400 mb-2 tracking-wide">Example</h3>
                    <p className="text-base text-gray-600 mb-2">{data.example}</p>
                    <p className="text-sm text-gray-500">{data.exampleJp}</p>
                </div>
            </div>

            <div className="text-xs text-gray-300 mt-4">
                Swipe Right to Save • Left to Discard
            </div>
        </motion.div>
    );
};
