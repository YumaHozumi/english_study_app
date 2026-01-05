import React, { useState } from 'react';

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
            setQuery(''); // 連続検索のため入力欄をクリア
        }
    };

    return (
        <form className="flex gap-3 mb-4" onSubmit={handleSubmit}>
            <input
                type="text"
                className="flex-1 px-4 py-3 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl text-[var(--text-color)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                placeholder="Search for an English word..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
            />
            <button
                type="submit"
                className="px-6 py-3 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl text-[var(--text-color)] font-medium cursor-pointer transition-colors hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !query.trim()}
            >
                {isLoading ? '...' : 'Search'}
            </button>
        </form>
    );
};
