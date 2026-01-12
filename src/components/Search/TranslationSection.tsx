'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import type { SentencePair } from '@/types';
import { StructureView } from './StructureView';

interface TranslationSectionProps {
    sentencePairs: SentencePair[];
}

export const TranslationSection: React.FC<TranslationSectionProps> = ({
    sentencePairs,
}) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleStructure = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

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
                    {/* 構造解析アコーディオン */}
                    {pair.structure && (
                        <>
                            <button
                                onClick={() => toggleStructure(index)}
                                className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-color)] transition-colors mt-2 bg-transparent border-none cursor-pointer p-0"
                            >
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}
                                />
                                <span>構造解説</span>
                            </button>
                            <AnimatePresence>
                                {expandedIndex === index && (
                                    <StructureView structure={pair.structure} />
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            ))}
        </motion.div>
    );
};
