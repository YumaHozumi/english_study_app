'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/components/AuthProvider';
import { BottomNav } from '@/components/Navigation/BottomNav';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <div className="app-container" style={{ paddingBottom: '80px' }}>
                    <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.5rem' }}>English Study App</h1>
                        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Turn your searches into study notes</p>
                    </header>
                    {children}
                    <BottomNav />
                </div>
            </ThemeProvider>
        </AuthProvider>
    );
}
