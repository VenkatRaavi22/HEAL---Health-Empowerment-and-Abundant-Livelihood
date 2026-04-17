import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Calendar as CalendarIcon, Droplets, Info } from 'lucide-react';
import api from '../utils/api';

export default function CycleMonitor() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api("/profile");
                setProfile(data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading your cycle data...</div>;
    if (!profile) return <div className="p-10 text-center text-red-500">Please complete your setup first.</div>;

    // Cycle Calculations
    const today = new Date();
    const lastPeriodDate = new Date(profile.last_period_date);
    const cycleLength = profile.cycle_length || 28;

    // Calculate next period
    let nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

    // If next period date is in the past, move it forward (simplified)
    while (nextPeriodDate < today) {
        nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
    }

    const diffTime = nextPeriodDate.getTime() - today.getTime();
    const daysUntilPeriod = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate ovulation (approx 14 days before next period)
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    const diffTimeOv = ovulationDate.getTime() - today.getTime();
    const daysUntilOvulation = Math.ceil(diffTimeOv / (1000 * 60 * 60 * 24));

    // Calendar data for current month
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
    const cycleDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDayStatus = (day: number) => {
        const dateToCheck = new Date(currentYear, today.getMonth(), day);
        const dateString = dateToCheck.toDateString();

        if (dateString === today.toDateString()) return 'bg-primary text-white scale-110 shadow-lg ring-4 ring-primary/20';

        // Show period window (start of last period)
        const lastP = new Date(profile.last_period_date);
        const periodEnd = new Date(lastP);
        periodEnd.setDate(periodEnd.getDate() + 5); // Assume 5 days period

        if (dateToCheck >= lastP && dateToCheck < periodEnd) return 'bg-secondary/20 text-secondary font-medium';

        if (dateString === ovulationDate.toDateString()) return 'bg-accent/20 text-accent font-medium border border-accent';

        return 'hover:bg-gray-50 text-gray-700';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Cycle Monitor</h2>
                <div className="flex gap-2 text-sm">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-secondary/20"></span> Period</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-accent/20"></span> Ovulation Prediction</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Card */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">{currentMonth} {currentYear}</h3>
                        <div className="flex gap-2 text-xs text-gray-400">
                            Based on {profile.cycle_length} day cycle
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-400 font-medium">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {cycleDays.map(day => (
                            <div
                                key={day}
                                className={`
                    aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all
                    ${getDayStatus(day)}
                `}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Summary Side Cards */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <div className="flex items-start gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-primary">
                                <Droplets className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">Next Period</h4>
                                <p className="text-2xl font-bold text-primary">In {daysUntilPeriod} Days</p>
                                <p className="text-xs text-gray-500 mt-1">Predicted start: {nextPeriodDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                        <div className="flex items-start gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-accent">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">Ovulation</h4>
                                <p className="text-2xl font-bold text-accent">{daysUntilOvulation > 0 ? `In ${daysUntilOvulation} Days` : daysUntilOvulation === 0 ? 'Today' : 'Passed'}</p>
                                <p className="text-xs text-gray-500 mt-1">High chance of conception</p>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm flex gap-3">
                        <Info className="w-5 h-5 shrink-0" />
                        <p>Predictions are based on your setup details. Keep logging to improve accuracy.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
