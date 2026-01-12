'use client';

import React from 'react';
import { motion } from 'framer-motion';

import type { SentenceStructure } from '@/types';
import './StructureView.css';

interface StructureViewProps {
    structure: SentenceStructure;
}

export const StructureView: React.FC<StructureViewProps> = ({ structure }) => {
    const { chunks } = structure;

    // Find root chunks (those with modifies_id === null)
    const rootChunks = chunks.filter(c => c.modifies_id === null);
    const getChildren = (parentId: number) => chunks.filter(c => c.modifies_id === parentId);

    const renderChunk = (chunk: typeof chunks[0], depth: number = 0) => {
        const children = getChildren(chunk.id);

        return (
            <div key={chunk.id} className="chunk-container" style={{ marginLeft: depth * 16 }}>
                <div className={`chunk-block chunk-${chunk.label.toLowerCase()}`}>
                    <div className="chunk-header">
                        <span className="chunk-text">{chunk.text}</span>
                        <span className="chunk-label">{chunk.jp_label}</span>
                    </div>
                    <div className="chunk-detail">
                        <div className="chunk-ja-text">{chunk.ja_text}</div>
                        {chunk.grammar_note && (
                            <div className="chunk-grammar-note">💡 {chunk.grammar_note}</div>
                        )}
                    </div>
                </div>
                {children.length > 0 && (
                    <div className="chunk-children">
                        {children.map(child => renderChunk(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="structure-view"
        >
            <div className="structure-header">
                <span className="structure-title">📐 構造解析</span>
            </div>
            <div className="chunks-container">
                {rootChunks.map(chunk => renderChunk(chunk))}
            </div>
        </motion.div>
    );
};
