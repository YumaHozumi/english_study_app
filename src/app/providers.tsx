'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/components/AuthProvider';
import { BottomNav } from '@/components/Navigation/BottomNav';
import { HeaderUserButton } from '@/components/HeaderUserButton';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ServiceWorkerRegistration />
                <div className="app-container pb-20">
                    <header className="mb-6 flex justify-between items-center px-4">
                        <div className="flex flex-col">
                            <img
                                src="/kioku-logo.png"
                                alt="Kioku"
                                className="h-8"
                            />
                            <p className="opacity-60 text-xs m-0 mt-1">検索を記憶に変える</p>
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

