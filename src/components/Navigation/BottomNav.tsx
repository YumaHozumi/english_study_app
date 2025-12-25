'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, BookOpen, GraduationCap, Settings } from 'lucide-react';

const navItems = [
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/vocabulary', icon: BookOpen, label: 'Vocabulary' },
    { path: '/study', icon: GraduationCap, label: 'Study' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--border-color)',
            padding: '0.5rem 0',
            paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
            transition: 'background 0.3s, border-color 0.3s',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                maxWidth: '600px',
                margin: '0 auto',
            }}>
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = pathname === path;
                    return (
                        <Link
                            key={path}
                            href={path}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 1rem',
                                textDecoration: 'none',
                                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: isActive ? 600 : 400,
                                transition: 'color 0.2s',
                            }}
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
