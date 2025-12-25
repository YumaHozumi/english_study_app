'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TranslationSectionProps {
    originalText: string;
    translation: string;
}

export const TranslationSection: React.FC<TranslationSectionProps> = ({
    originalText,
    translation,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl"
        >
            <div className="mb-3">
                <div className="text-xs text-[var(--text-secondary)] mb-1 font-medium">📝 Original</div>
                <p className="text-[var(--text-color)] text-sm leading-relaxed">{originalText}</p>
            </div>
            <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1 font-medium">🌐 Translation</div>
                <p className="text-[var(--text-color)] text-sm leading-relaxed">{translation}</p>
            </div>
        </motion.div>
    );
};
