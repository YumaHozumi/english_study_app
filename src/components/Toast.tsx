'use client';

import { useEffect } from 'react';
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
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-[var(--text-color)] text-[var(--card-bg)] px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-[1000] max-w-[calc(100vw-2rem)]"
        >
            <span className="text-sm">{message}</span>
            {action && (
                <button
                    onClick={action.onClick}
                    className="bg-[var(--primary-color)] text-white border-none px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                    {action.label}
                </button>
            )}
            <button
                onClick={onClose}
                className="bg-transparent border-none text-[var(--card-bg)] opacity-70 cursor-pointer p-1 flex items-center"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

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
