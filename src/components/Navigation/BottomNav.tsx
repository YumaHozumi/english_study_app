'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, BookOpen, GraduationCap, Settings } from 'lucide-react';

const navItems = [
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/vocabulary', icon: BookOpen, label: 'Vocabulary' },
    { path: '/study', icon: GraduationCap, label: 'Study' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handlePrefetch = (path: string) => {
        router.prefetch(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] backdrop-blur-md border-t border-[var(--border-color)] py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-colors duration-300">
            <div className="flex justify-around max-w-[600px] mx-auto">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = pathname === path;
                    return (
                        <Link
                            key={path}
                            href={path}
                            onMouseEnter={() => handlePrefetch(path)}
                            onTouchStart={() => handlePrefetch(path)}
                            className={`flex flex-col items-center gap-1 px-4 py-2 no-underline text-xs transition-colors duration-200 ${isActive
                                ? 'text-[var(--primary-color)] font-semibold'
                                : 'text-[var(--text-secondary)] font-normal'
                                }`}
                        >
                            <Icon size={22} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

