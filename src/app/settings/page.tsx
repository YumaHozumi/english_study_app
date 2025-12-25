'use client';

import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>⚙️ Settings</h1>

            <div style={{
                background: 'var(--card-bg)',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow)',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-color)' }}>
                            Dark Mode
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Switch between light and dark themes
                        </p>
                    </div>
                    {/* Toggle Switch */}
                    <button
                        onClick={toggleTheme}
                        role="switch"
                        aria-checked={isDark}
                        style={{
                            width: '52px',
                            height: '28px',
                            borderRadius: '999px',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            background: isDark
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : '#cbd5e0',
                            transition: 'background 0.3s ease',
                            position: 'relative',
                        }}
                    >
                        <span
                            style={{
                                display: 'block',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                transition: 'transform 0.3s ease',
                                transform: isDark ? 'translateX(24px)' : 'translateX(0)',
                            }}
                        />
                    </button>
                </div>
            </div>

            {/* Version info */}
            <div style={{
                marginTop: '2rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
            }}>
                <p>English Study App v0.1.0</p>
            </div>
        </div>
    );
}
