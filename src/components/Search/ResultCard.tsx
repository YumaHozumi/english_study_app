import React from 'react';
import type { SearchResult } from '../../types';
import './ResultCard.css';

interface ResultCardProps {
    result: SearchResult;
    onSave?: () => void;
    isSaved?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, isSaved }) => {
    return (
        <div className="result-card glass-panel fade-in">
            <div className="result-header">
                <h2 className="word-title">{result.word}</h2>
                <span className="phonetic">{result.phonetic}</span>
            </div>

            <div className="result-body">
                <div className="section">
                    <label>意味</label>
                    <p className="meaning-text">{result.meaning}</p>
                </div>

                <div className="section example-section">
                    <label>Example</label>
                    <p className="example-text">
                        "{result.example}"
                    </p>
                    <p className="example-jp">
                        {result.exampleJp}
                    </p>
                </div>
            </div>

            <div className="result-footer">
                {isSaved && <span className="saved-badge">✓ Saved to Notebook</span>}
            </div>
        </div>
    );
};
