import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
    className?: string;
}

export function Button({
    variant = 'primary',
    fullWidth = false,
    className,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark shadow-md hover:shadow-lg',
        outline: 'border-2 border-primary text-primary hover:bg-primary/5',
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    };

    return (
        <button
            className={twMerge(
                baseStyles,
                variants[variant],
                fullWidth && 'w-full',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
