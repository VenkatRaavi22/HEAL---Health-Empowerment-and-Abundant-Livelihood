import React from 'react';
import { Card } from './Card';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    to: string;
    color?: string; // Hex color for icon background
}

export function FeatureCard({ title, description, icon: Icon, to, color }: FeatureCardProps) {
    return (
        <Link to={to} className="block group">
            <Card hoverEffect className="h-full min-h-[160px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="bg-gray-50 p-2 rounded-full">
                        <ArrowRight className="w-4 h-4 text-gray-700" />
                    </div>
                </div>

                <div className="flex flex-col h-full">
                    <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
                        style={{ backgroundColor: color ? `${color}15` : '#F3F4F6' }}>
                        <Icon className="w-6 h-6" style={{ color: color || '#4B5563' }} strokeWidth={2.5} />
                    </div>
                    <div className="mt-auto">
                        <h3 className="text-[17px] font-bold text-[#0F172A] mb-1.5 transition-colors group-hover:text-[#FA5881]">
                            {title}
                        </h3>
                        <p className="text-[14px] leading-snug text-[#64748B] opacity-90 line-clamp-2">
                            {description}
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
