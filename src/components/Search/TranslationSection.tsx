'use client';

import React from 'react';
import { motion } from 'framer-motion';

import type { SentencePair } from '@/types';

interface TranslationSectionProps {
    sentencePairs: SentencePair[];
}

export const TranslationSection: React.FC<TranslationSectionProps> = ({
    sentencePairs,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl space-y-6"
        >
            {sentencePairs.map((pair, index) => (
                <div key={index} className="space-y-2">
                    {/* 英語（主役）：大きく、明るく */}
                    <p className="text-[var(--text-color)] text-base font-medium leading-relaxed">
                        {pair.en}
                    </p>
                    {/* 日本語（脇役）：小さく、グレー */}
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                        {pair.ja}
                    </p>
                </div>
            ))}
        </motion.div>
    );
};
