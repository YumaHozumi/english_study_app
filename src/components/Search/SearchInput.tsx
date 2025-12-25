import React, { useState } from 'react';
import './SearchInput.css';

interface SearchInputProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <form className="search-container" onSubmit={handleSubmit}>
            <input
                type="text"
                className="search-input glass-panel"
                placeholder="Search for an English word..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
            />
            <button type="submit" className="search-button glass-panel" disabled={isLoading || !query.trim()}>
                {isLoading ? '...' : 'Search'}
            </button>
        </form>
    );
};
