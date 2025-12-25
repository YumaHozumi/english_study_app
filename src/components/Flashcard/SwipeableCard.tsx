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
            'rgba(255, 80, 80, 0.2)', // Left (Redish)
            'rgba(255, 80, 80, 0.1)',
            'rgba(255, 255, 255, 1)',   // Center (White)
            'rgba(80, 255, 80, 0.1)',
            'rgba(80, 255, 80, 0.2)'  // Right (Greenish)
        ]
    );

    // Icon opacities
    const checkOpacity = useTransform(x, [50, 150], [0, 1]);
    const crossOpacity = useTransform(x, [-150, -50], [1, 0]);

    const handleDragEnd = (_: any, info: PanInfo) => {
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
                backgroundColor: '#fff', // fallback
                background: background as any, // motion value
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
                justifyContent: 'center', // Center vertically
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
            <motion.div style={{ position: 'absolute', top: 40, right: 40, opacity: checkOpacity, color: '#4CAF50' }}>
                <Check size={64} strokeWidth={3} />
            </motion.div>
            <motion.div style={{ position: 'absolute', top: 40, left: 40, opacity: crossOpacity, color: '#F44336' }}>
                <X size={64} strokeWidth={3} />
            </motion.div>

            <div style={{ textAlign: 'center', width: '100%' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#2d3748' }}>{data.word}</h2>
                <p style={{ fontSize: '1.2rem', color: '#718096', marginBottom: '2rem', fontStyle: 'italic' }}>{data.phonetic}</p>

                <div style={{ textAlign: 'left', width: '100%', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#a0aec0', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Meaning</h3>
                    <p style={{ fontSize: '1.1rem', color: '#4a5568', lineHeight: 1.5 }}>{data.meaning}</p>
                </div>

                <div style={{ textAlign: 'left', width: '100%', flex: 1 }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#a0aec0', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Example</h3>
                    <p style={{ fontSize: '1rem', color: '#4a5568', marginBottom: '0.5rem' }}>{data.example}</p>
                    <p style={{ fontSize: '0.9rem', color: '#718096' }}>{data.exampleJp}</p>
                </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#cbd5e0', marginTop: '1rem' }}>
                Swipe Right to Save • Left to Discard
            </div>
        </motion.div>
    );
};
