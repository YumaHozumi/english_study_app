'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/components/AuthProvider';
import { BottomNav } from '@/components/Navigation/BottomNav';
import { HeaderUserButton } from '@/components/HeaderUserButton';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <div className="app-container pb-20">
                    <header className="mb-6 flex justify-between items-center px-4">
                        <div className="text-left">
                            <h1 className="text-2xl m-0">English Study App</h1>
                            <p className="opacity-60 text-sm m-0">Turn your searches into study notes</p>
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
