// Theme types and storage service

export type Theme = 'light' | 'dark';

const THEME_KEY = 'app_theme';

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

export const ThemeStorage = {
    get(): Theme {
        if (!isClient) {
            return 'light'; // Default for SSR
        }
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        // Default to system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    set(theme: Theme): void {
        if (!isClient) {
            return; // No-op for SSR
        }
        localStorage.setItem(THEME_KEY, theme);
    }
};
