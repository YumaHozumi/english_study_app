'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ToastProps {
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, action, duration = 5000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
                position: 'fixed',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--text-color)',
                color: 'var(--card-bg)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                zIndex: 1000,
                maxWidth: 'calc(100vw - 2rem)',
            }}
        >
            <span style={{ fontSize: '0.9rem' }}>{message}</span>
            {action && (
                <button
                    onClick={action.onClick}
                    style={{
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {action.label}
                </button>
            )}
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--card-bg)',
                    opacity: 0.7,
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

// Toast container for multiple toasts
interface ToastData {
    id: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContainerProps {
    toasts: ToastData[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <AnimatePresence>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    action={toast.action}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </AnimatePresence>
    );
}
