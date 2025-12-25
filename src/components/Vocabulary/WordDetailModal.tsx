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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--card-bg)] rounded-2xl p-8 max-w-[400px] w-full max-h-[80vh] overflow-auto relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-[var(--text-secondary)]"
                >
                    <X size={24} />
                </button>

                {/* Word Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl text-[var(--text-color)] mb-1">
                        {word.word}
                    </h2>
                    <p className="text-lg text-[var(--text-secondary)] italic">
                        {word.phonetic}
                    </p>
                </div>

                {/* Meaning */}
                <div className="mb-6">
                    <h3 className="text-xs uppercase text-gray-400 mb-2 tracking-wide">
                        Meaning
                    </h3>
                    <p className="text-base text-[var(--text-color)] leading-relaxed">
                        {word.meaning}
                    </p>
                </div>

                {/* Example */}
                <div className="mb-6">
                    <h3 className="text-xs uppercase text-gray-400 mb-2 tracking-wide">
                        Example
                    </h3>
                    <p className="text-base text-[var(--text-color)] mb-2">
                        {word.example}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                        {word.exampleJp}
                    </p>
                </div>

                {/* Timestamp */}
                <div className="border-t border-[var(--border-color)] pt-4 mt-4 text-xs text-gray-400 text-center">
                    <span suppressHydrationWarning>
                        Added: {new Date(word.timestamp).toLocaleString()}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};
