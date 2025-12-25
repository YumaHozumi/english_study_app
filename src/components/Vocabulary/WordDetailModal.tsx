import { motion } from 'framer-motion';
import type { WordEntry } from '../../types';
import { X } from 'lucide-react';

interface WordDetailModalProps {
    word: WordEntry;
    onClose: () => void;
}

export const WordDetailModal = ({ word, onClose }: WordDetailModalProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '1rem',
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '2rem',
                    maxWidth: '400px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    position: 'relative',
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#718096',
                    }}
                >
                    <X size={24} />
                </button>

                {/* Word Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '0.25rem' }}>
                        {word.word}
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: '#718096', fontStyle: 'italic' }}>
                        {word.phonetic}
                    </p>
                </div>

                {/* Meaning */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#a0aec0',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.05em',
                    }}>
                        Meaning
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#4a5568', lineHeight: 1.6 }}>
                        {word.meaning}
                    </p>
                </div>

                {/* Example */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#a0aec0',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.05em',
                    }}>
                        Example
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#4a5568', marginBottom: '0.5rem' }}>
                        {word.example}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#718096' }}>
                        {word.exampleJp}
                    </p>
                </div>

                {/* Timestamp */}
                <div style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '1rem',
                    marginTop: '1rem',
                    fontSize: '0.8rem',
                    color: '#a0aec0',
                    textAlign: 'center',
                }}>
                    <span suppressHydrationWarning>
                        Added: {new Date(word.timestamp).toLocaleString()}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};
