'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/components/AuthProvider';
import { BottomNav } from '@/components/Navigation/BottomNav';
import { HeaderUserButton } from '@/components/HeaderUserButton';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <div className="app-container" style={{ paddingBottom: '80px' }}>
                    <header style={{
                        marginBottom: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 1rem',
                    }}>
                        <div style={{ textAlign: 'left' }}>
                            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>English Study App</h1>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem', margin: 0 }}>Turn your searches into study notes</p>
                        </div>
                        <HeaderUserButton />
                    </header>
                    {children}
                    <BottomNav />
                </div>
            </ThemeProvider>
        </AuthProvider>
    );
}
