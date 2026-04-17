import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

function AnimatedNumber({ value }: { value: string | number }) {
    if (typeof value === 'number') return <Counter from={0} to={value} />;
    
    const strVal = String(value);
    
    // Skip times like 2:00 PM
    if (strVal.includes(':')) return <>{value}</>;

    const match = strVal.match(/^([0-9,]+)(.*)$/);
    if (!match) return <>{value}</>;
    
    const numStr = match[1].replace(/,/g, '');
    const num = parseInt(numStr, 10);
    const suffix = match[2];
    
    if (isNaN(num)) return <>{value}</>;

    return (
        <span className="flex items-baseline">
           <Counter from={0} to={num} />
           <span>{suffix}</span>
        </span>
    );
}

function Counter({ from, to }: { from: number, to: number }) {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

    React.useEffect(() => {
        const controls = animate(count, to, { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 });
        return controls.stop;
    }, [count, to]);

    return <motion.span>{rounded}</motion.span>;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'primary' | 'secondary' | 'accent';
    className?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    color = 'primary',
    className
}: StatCardProps) {

    // Upgraded solid circle backgrounds
    const colorStyles = {
        primary: 'bg-[#E91E63] text-white shadow-md shadow-[#E91E63]/20',
        secondary: 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20',
        accent: 'bg-[#2DD4BF] text-white shadow-md shadow-[#2DD4BF]/20',
    };

    return (
        <Card hoverEffect className={twMerge('flex items-start justify-between min-h-[140px]', className)}>
            <div className="flex flex-col h-full justify-between">
                <div>
                    <h3 className="text-3xl font-bold text-[#0F172A] mb-1 flex items-baseline">
                        <AnimatedNumber value={value} />
                    </h3>
                    <p className="text-[#64748B] text-[15px] font-medium tracking-wide">{title}</p>
                </div>
                {trend && (
                    <p className={twMerge(
                        "text-xs font-semibold mt-4 flex items-center gap-1.5",
                        trendUp ? "text-emerald-500" : "text-rose-500"
                    )}>
                        <span className={twMerge("w-1.5 h-1.5 rounded-full", trendUp ? "bg-emerald-500" : "bg-rose-500")}></span>
                        {trend}
                    </p>
                )}
            </div>
            <div className={twMerge("p-3 rounded-full flex items-center justify-center transition-transform hover:scale-105", colorStyles[color])}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
        </Card>
    );
}
