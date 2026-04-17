import React from 'react';
import { Card } from './Card';
import { twMerge } from 'tailwind-merge';

interface RiskCardProps {
    title: string;
    percentage: number;
    riskLabel: string;
    color: 'green' | 'yellow' | 'red';
    className?: string;
}

export function RiskCard({
    title,
    percentage,
    riskLabel,
    color,
    className
}: RiskCardProps) {
    // Defensive clamp: ensure percentage is always 0–100 regardless of source
    const safePercentage = Math.max(0, Math.min(Math.round(percentage), 100));

    const colorStyles = {
        green: { text: 'text-green-600', bg: 'bg-green-100', bar: 'bg-green-500' },
        yellow: { text: 'text-yellow-600', bg: 'bg-yellow-100', bar: 'bg-yellow-500' },
        red: { text: 'text-red-600', bg: 'bg-red-100', bar: 'bg-red-500' },
    };

    const styles = colorStyles[color];

    return (
        <Card className={twMerge('p-5', className)}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-700 font-semibold">{title}</h3>
                    <p className={twMerge("text-2xl font-bold mt-1", styles.text)}>
                        {safePercentage}%
                    </p>
                </div>
                <span className={twMerge("px-3 py-1 rounded-full text-xs font-bold uppercase", styles.bg, styles.text)}>
                    {riskLabel}
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                    className={twMerge("h-2.5 rounded-full transition-all duration-1000 ease-out", styles.bar)}
                    style={{ width: `${safePercentage}%` }}
                ></div>
            </div>
        </Card>
    );
}
