import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function Card({ children, className, hoverEffect = false, ...props }: CardProps) {
    return (
        <div
            className={twMerge(
                'bg-white rounded-[20px] p-7 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 border border-gray-100/80',
                hoverEffect && 'hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

