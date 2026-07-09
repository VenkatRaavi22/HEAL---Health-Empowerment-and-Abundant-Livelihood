import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Calendar as CalendarIcon, Heart, Plus, Search, MessageCircle, Users, LayoutGrid, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function CycleMonitor() {
    const [status, setStatus] = useState<any>(null);
    const [forecast, setForecast] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [expectModalOpen, setExpectModalOpen] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const CycleTrackerCard = ({ status }: { status: any }) => {
        if (!status) return null;
        const { cycleDay, cycleLength, ovulationDay, fertileWindowFrozen } = status;
        
        const size = 280;
        const center = size / 2;
        const outerRadius = 100;
        const innerRadius = 80;
        
        const circumferenceOuter = 2 * Math.PI * outerRadius;
        const circumferenceInner = 2 * Math.PI * innerRadius;
        
        const periodDays = 5;
        const fertileStartDay = Math.max(1, ovulationDay - 5);
        const fertileDays = 6; 
        
        const getStroke = (startDay: number, duration: number, circumference: number) => {
            const length = (duration / cycleLength) * circumference;
            const offset = ((startDay - 1) / cycleLength) * circumference;
            return {
                strokeDasharray: `${length} ${circumference}`,
                strokeDashoffset: -offset
            };
        };

        // If the cycle is missed (cycleDay exceeds cycleLength), lock the progress at the start of the ring (0 degrees)
        let effectiveDayForAngle = cycleDay;
        if (cycleDay > cycleLength || fertileWindowFrozen) {
            effectiveDayForAngle = 1; // locks to 0 degrees (start of the ring)
        }
        const currentAngle = ((effectiveDayForAngle - 1) / cycleLength) * 360; 
        const markerX = center + outerRadius * Math.cos(currentAngle * (Math.PI / 180));
        const markerY = center + outerRadius * Math.sin(currentAngle * (Math.PI / 180));

        const ovAngle = ((ovulationDay - 1) / cycleLength) * 360;
        const ovX = center + outerRadius * Math.cos(ovAngle * (Math.PI / 180));
        const ovY = center + outerRadius * Math.sin(ovAngle * (Math.PI / 180));

        return (
            <div className="bg-[#EBE2EE] p-6 rounded-3xl shadow-sm border border-[#E0D5E3] flex flex-col items-center w-full">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Menstrual cycle {cycleLength} days</h4>
                <div className="relative">
                    <svg width={size} height={size} className="-rotate-90">
                        {/* Outer Track Background */}
                        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="white" strokeWidth="20" />
                        
                        {/* Period (Outer) */}
                        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#F96181" strokeWidth="20" strokeLinecap="round"
                            {...getStroke(1, periodDays, circumferenceOuter)} />
                        
                        {/* Fertile Window (Outer) - Hidden if frozen */}
                        {!fertileWindowFrozen && (
                            <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#8AD5C7" strokeWidth="20" strokeLinecap="round"
                                {...getStroke(fertileStartDay, fertileDays, circumferenceOuter)} />
                        )}
                            
                        {/* Ovulation Dot - Hidden if frozen */}
                        {!fertileWindowFrozen && (
                            <circle cx={ovX} cy={ovY} r="10" fill="#1A9B89" />
                        )}

                        {/* Follicular Phase (Inner) */}
                        <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#F79762" strokeWidth="3" strokeLinecap="round"
                            {...getStroke(1, ovulationDay, circumferenceInner)} />
                            
                        {/* Luteal Phase (Inner) */}
                        <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#678DE3" strokeWidth="3" strokeLinecap="round"
                            {...getStroke(ovulationDay + 1, cycleLength - ovulationDay, circumferenceInner)} />
                            
                        {/* Current Day Marker */}
                        <circle cx={markerX} cy={markerY} r="14" fill="none" stroke="#333" strokeWidth="3" strokeDasharray="4 4" className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: `${markerX}px ${markerY}px` }} />
                    </svg>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center mt-2">
                            <span className="text-sm font-bold text-gray-500">Day</span>
                            <h2 className="text-5xl font-black text-gray-800">{cycleDay}</h2>
                        </div>
                    </div>
                </div>
                
                {/* Legend */}
                <div className="mt-8 flex flex-col gap-3 text-sm font-semibold text-gray-700 w-full px-4">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#F96181]"></span> Period</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#8AD5C7]"></span> Fertile days</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1A9B89]"></span> Ovulation</div>
                    </div>
                    <div className="flex items-center justify-center gap-8 w-full mt-2">
                        <div className="flex items-center gap-2"><span className="w-4 h-1 bg-[#F79762]"></span> Follicular phase</div>
                        <div className="flex items-center gap-2"><span className="w-4 h-1 bg-[#678DE3]"></span> Luteal phase</div>
                    </div>
                </div>
            </div>
        );
    };
    
    // Log form
    const [flow, setFlow] = useState('');
    const [mood, setMood] = useState('');
    const [pain, setPain] = useState('');
    const [checkInSymptoms, setCheckInSymptoms] = useState<Record<string, string>>({ weight: '', acne: '', hair: '' });

    // Edit form
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [localDelay, setLocalDelay] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statusRes, forecastRes] = await Promise.all([
                api("/cycle/status"),
                api("/cycle/forecast")
            ]);
            setStatus(statusRes);
            setForecast(forecastRes);
        } catch (err) {
            console.error("Failed to fetch cycle data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogSymptom = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!flow || !mood || !pain) {
            alert("Please select all symptoms to log.");
            return;
        }

        try {
            await api("/logs", {
                method: "POST",
                body: JSON.stringify({
                    flow_intensity: flow,
                    mood: mood,
                    pain_level: pain,
                    // Send basic placeholder values for required fields in health logs
                    sleep_hours: 8,
                    stress_level: 5,
                    weight: 0,
                    step_count: 0
                })
            });
            alert("Symptoms logged successfully!");
            setLogModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Failed to log symptoms.");
        }
    };

    const handleEditDates = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api("/cycle/log-period", {
                method: "POST",
                body: JSON.stringify({
                    startDate: editStartDate,
                    endDate: editEndDate || null
                })
            });
            setEditModalOpen(false);
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Failed to update period dates.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading your insights...</div>;

    // Navigation handlers
    const prevMonth = () => {
        const d = new Date(calendarDate);
        d.setMonth(d.getMonth() - 1);
        setCalendarDate(d);
    };

    const nextMonth = () => {
        const d = new Date(calendarDate);
        d.setMonth(d.getMonth() + 1);
        setCalendarDate(d);
    };

    // Month Calendar Calculation
    const today = new Date();
    const currentMonthStr = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const monthDays = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const todayStr = today.toISOString().slice(0, 10);
    
    const startOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const endOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
    
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));
    
    const iterDate = new Date(startDate);
    while (iterDate <= endDate) {
        const d = new Date(iterDate);
        const dStr = d.toISOString().slice(0, 10);
        const isCurrentMonth = d.getMonth() === calendarDate.getMonth();
        
        let isActualStart = false;
        let isPredictedStart = false;
        
        if (status?.history && status.history.length > 0) {
            isActualStart = status.history.some((h: any) => h.start_date === dStr) || status.lastPeriodStart === dStr;
            
            // Next predicted based on last period
            const nextP = new Date(status.lastPeriodStart);
            nextP.setDate(nextP.getDate() + status.cycleLength);
            if (nextP.toISOString().slice(0, 10) === dStr) isPredictedStart = true;
            
            // Historical predicted
            for (let j = 0; j < status.history.length - 1; j++) {
                const prev = status.history[j + 1];
                if (prev.cycle_length) {
                    const p = new Date(prev.start_date);
                    p.setDate(p.getDate() + prev.cycle_length);
                    if (p.toISOString().slice(0, 10) === dStr) isPredictedStart = true;
                }
            }
        } else if (status?.lastPeriodStart) {
             isActualStart = status.lastPeriodStart === dStr;
             const p = new Date(status.lastPeriodStart);
             p.setDate(p.getDate() + (status.cycleLength || 28));
             if (p.toISOString().slice(0, 10) === dStr) isPredictedStart = true;
        }

        const isToday = dStr === todayStr;

        let circleClass = "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition-all mx-auto ";
        
        if (isActualStart && isPredictedStart) {
            circleClass += "bg-[#FA5881] text-white ring-4 ring-white/50 shadow-lg"; // Match
        } else if (isActualStart) {
            circleClass += "bg-[#FA5881] text-white shadow-md"; // Actual
        } else if (isPredictedStart) {
            circleClass += "bg-transparent text-[#FA5881] border-2 border-dashed border-[#FA5881] bg-white/50"; // Predicted
        } else if (isToday) {
            circleClass += "bg-white text-[#FA5881] shadow-lg ring-4 ring-white/30"; // Today
        } else {
            circleClass += "bg-[#FF7396]/80 text-white/90"; // default
        }

        monthDays.push({
            date: d.getDate(),
            isCurrentMonth,
            isToday,
            circleClass
        });
        
        iterDate.setDate(iterDate.getDate() + 1);
    }

    const delayDays = status?.delayDays || 0;
    const isPredictedDay = status?.predictedPeriodDate === todayStr;
    const isActualStartToday = status?.history?.some((h: any) => h.start_date === todayStr) || status?.lastPeriodStart === todayStr;
    const missedTwoCycles = delayDays > (status?.cycleLength * 2 || 56);

    return (
        <div className="min-h-screen bg-[#FFF5F7] animate-fade-in pb-24 -m-4 sm:-m-8 overflow-hidden">
            {/* Pink Gradient Header Background */}
            <div className="relative pt-12 px-6 pb-12 flex flex-col items-center text-center bg-gradient-to-b from-[#FFC2CD] to-[#FA5881] rounded-b-[40px] shadow-sm">
                
                {/* Header Date & Icons */}
                <div className="w-full flex justify-between items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center relative shadow-md">
                        <span className="text-white text-xs font-bold">Heal</span>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FA5881] rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={prevMonth} className="text-gray-800 hover:text-white font-black text-xl bg-white/30 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">&lt;</button>
                        <h2 className="text-lg font-semibold text-gray-900 w-32 text-center leading-tight">{currentMonthStr}</h2>
                        <button onClick={nextMonth} className="text-gray-800 hover:text-white font-black text-xl bg-white/30 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">&gt;</button>
                    </div>
                    <div className="w-8 h-8"></div> {/* Placeholder to keep header centered */}
                </div>

                {/* Month Calendar Grid */}
                <div className="w-full max-w-md px-2 mb-10">
                    <div className="grid grid-cols-7 gap-y-3 gap-x-1 sm:gap-x-2 text-center mb-2">
                        {dayNames.map((name, i) => (
                            <div key={i} className="text-xs font-bold text-gray-700/80">{name}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-3 gap-x-1 sm:gap-x-2 text-center">
                        {monthDays.map((d, i) => (
                            <div key={i} className="flex justify-center">
                                <div className={`${d.circleClass} ${d.isCurrentMonth ? '' : 'opacity-50'}`} title={d.isToday ? "Today" : ""}>
                                    {d.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Display */}
                <div className="mb-8 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{status?.phase}:</h3>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">Day {status?.cycleDay}</h1>
                    
                    {status?.predictedPeriodDate && (
                        <div className="text-sm font-semibold text-gray-700 mt-2 bg-white/50 px-3 py-1 rounded-full border border-pink-200">
                            Predicted Date: {new Date(status.predictedPeriodDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    )}
                    
                    {isPredictedDay && !isActualStartToday && localDelay === 0 && (
                        <div className="mt-4 p-4 bg-white rounded-2xl shadow-sm border border-pink-100 max-w-sm text-center animate-fade-in">
                            <p className="font-bold text-gray-900 mb-2">Did your period start today?</p>
                            <div className="flex gap-2 justify-center">
                                <Button onClick={() => { setEditStartDate(todayStr); setEditModalOpen(true); }} className="bg-[#FA5881] px-6 text-sm">Yes</Button>
                                <Button variant="outline" className="px-6 text-sm" onClick={() => setLocalDelay(prev => prev + 1)}>Not yet</Button>
                            </div>
                        </div>
                    )}



                    {delayDays > 0 && !missedTwoCycles && (
                        <div className="mt-3 px-3 py-1 bg-red-100/80 text-red-700 text-sm font-bold rounded-full shadow-sm">
                            Delayed by {delayDays} {delayDays === 1 ? 'day' : 'days'}
                        </div>
                    )}

                </div>

                {/* Edit Button */}
                <button 
                    onClick={() => {
                        setEditStartDate(status?.lastPeriodStart || '');
                        setEditModalOpen(true);
                    }}
                    className="bg-white text-[#FA5881] px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                >
                    Edit period dates
                </button>
            </div>

            {/* Bottom Section with White Background */}
            <div className="relative z-10 mt-12 px-6 bg-[#FFF5F7]">
                <div className="flex flex-col xl:flex-row gap-8 max-w-6xl mx-auto">
                    {/* Left: Daily Insights */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-left">My daily insights • Today</h3>
                        
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                            {/* Log Card */}
                            <div 
                                onClick={() => setLogModalOpen(true)}
                                className="snap-start shrink-0 w-36 h-48 bg-white rounded-[24px] p-4 flex flex-col items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                            >
                                <span className="font-bold text-center text-gray-900 leading-tight mt-2">Log your<br/>symptoms</span>
                                <div className="w-10 h-10 rounded-full bg-[#FA5881] text-white flex items-center justify-center shadow-md mb-2">
                                    <Plus className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Symptoms to expect */}
                            <div 
                                onClick={() => setExpectModalOpen(true)}
                                className="cursor-pointer snap-start shrink-0 w-36 h-48 bg-gradient-to-b from-[#A5B4FC] to-[#818CF8] rounded-[24px] p-4 flex flex-col items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                            >
                                <div className="absolute -bottom-10 w-full h-24 bg-white/30 rounded-t-full blur-xl"></div>
                                <span className="font-bold text-center text-white leading-tight mt-2 relative z-10">Symptoms<br/>to expect</span>
                                <div className="w-10 h-10 rounded-full bg-white/90 text-[#FA5881] flex items-center justify-center shadow-md mb-2 relative z-10 group-hover:scale-110 transition-transform">
                                    <Heart className="w-5 h-5 fill-current" />
                                </div>
                            </div>

                            {/* Cycle Day */}
                            <div className="snap-start shrink-0 w-36 h-48 bg-[#DDD6FE] rounded-[24px] p-4 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <svg viewBox="0 0 100 100" className="w-32 h-32 fill-current text-white"><path d="M50 0 L100 50 L50 100 L0 50 Z" /></svg>
                                </div>
                                <span className="font-bold text-gray-800 mb-1 relative z-10">Cycle day</span>
                                <span className="text-5xl font-black text-gray-900 relative z-10">{status?.cycleDay}</span>
                            </div>
                        </div>

                        {/* Predicted Date and Due In Cards */}
                        <div className="grid grid-cols-2 gap-4 mt-2 mb-6 animate-fade-in">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 text-center flex flex-col justify-center items-center group hover:shadow-md transition-shadow">
                                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Predicted Start</span>
                                <span className="text-2xl font-black text-gray-900 group-hover:text-[#FA5881] transition-colors">
                                    {status?.predictedPeriodDate ? new Date(status.predictedPeriodDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '--'}
                                </span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 text-center flex flex-col justify-center items-center group hover:shadow-md transition-shadow">
                                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Period Due In</span>
                                <span className="text-2xl font-black text-[#FA5881]">
                                    {status?.predictedPeriodDate ? (() => {
                                        if (status?.phase === 'Menstrual') return "0";
                                        
                                        // Standardize to midnight for accurate day counting
                                        const todayMidnight = new Date();
                                        todayMidnight.setHours(0,0,0,0);
                                        const predMidnight = new Date(status.predictedPeriodDate);
                                        predMidnight.setHours(0,0,0,0);
                                        const diff = predMidnight.getTime() - todayMidnight.getTime();
                                        const days = Math.round(diff / (1000 * 60 * 60 * 24));
                                        
                                        if (days > 0) return `${days} Days`;
                                        if (days === 0 && localDelay === 0) return "Today";
                                        
                                        const totalDelay = Math.abs(days) + localDelay;
                                        return `Delayed ${totalDelay}d`;
                                    })() : '--'}
                                </span>
                            </div>
                        </div>

                        {missedTwoCycles && (
                            <div className="bg-purple-50 p-5 rounded-3xl mb-6 border border-purple-100 shadow-sm animate-fade-in w-full text-left">
                                <h4 className="font-bold text-purple-900 mb-2">Cycle Check-in</h4>
                                <p className="text-sm text-purple-800 mb-4">You've missed two consecutive cycles. Have you experienced any of these symptoms recently?</p>
                                
                                <div className="space-y-3 w-full">
                                    {[
                                        { id: 'weight', label: 'Sudden weight changes' },
                                        { id: 'acne', label: 'Severe acne' },
                                        { id: 'hair', label: 'Unusual facial hair growth' }
                                    ].map(symptom => (
                                        <div key={symptom.id} className="flex flex-col bg-white p-3 rounded-xl border border-purple-100 w-full shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-700 text-sm">{symptom.label}</span>
                                                {checkInSymptoms[symptom.id] && (
                                                    <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full uppercase">
                                                        {checkInSymptoms[symptom.id]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {['no', 'mild', 'yes'].map(opt => (
                                                    <button 
                                                        key={opt}
                                                        onClick={() => setCheckInSymptoms(prev => ({...prev, [symptom.id]: opt}))}
                                                        className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-colors ${
                                                            checkInSymptoms[symptom.id] === opt 
                                                                ? 'bg-purple-600 text-white border-purple-600' 
                                                                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                                                        }`}
                                                    >
                                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {Object.values(checkInSymptoms).includes('yes') && (
                                    <div className="mt-4 p-3 bg-red-100/80 text-red-800 text-sm font-semibold rounded-xl border border-red-200">
                                        ⚠️ <span className="font-bold text-red-900">Caution:</span> Based on your reported symptoms along with missed cycles, we strongly recommend consulting a gynaecologist or health specialist.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-xl mt-2 border border-yellow-100 text-left">
                            <strong>Medical Disclaimer:</strong> {forecast?.disclaimer}
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-2xl mt-4 border border-blue-100 text-left">
                            <p className="text-sm font-medium text-gray-700">
                                {forecast?.message}
                            </p>
                        </div>
                        
                        {status?.needsConsultation && (
                            <div className="mt-6 px-5 py-4 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-3xl shadow-sm w-full text-left animate-fade-in">
                                <span className="block font-bold mb-2 text-red-900">Medical Consultation Recommended</span>
                                {status.consultationReason}
                            </div>
                        )}
                    </div>

                    {/* Right: Info Cards */}
                    <div className="flex-1 flex flex-col gap-8 xl:mt-11">
                        <CycleTrackerCard status={status} />
                        
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex flex-col justify-center">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 text-left">The importance of understanding your menstrual cycle</h4>
                            <p className="text-sm text-gray-700 mb-4 text-left leading-relaxed">
                                Getting to know your menstrual cycle can help you connect with your body and get familiar with the changes it goes through each month. It can help you better anticipate shifts in mood, energy, and physical symptoms so you’re always prepared. Understanding your menstrual cycle can help you understand what’s typical for you and when it might be worth checking in with a doctor.
                            </p>
                            <p className="text-sm text-gray-700 text-left leading-relaxed">
                                Cycle changes can also give you valuable information about your health. For instance, symptoms like skipped periods could signal pregnancy, or irregular periods may suggest you’re in perimenopause. Always speak to your doctor if your cycle suddenly changes or you have any questions or concerns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expected Symptoms Modal */}
            <Modal isOpen={expectModalOpen} onClose={() => setExpectModalOpen(false)} title="Symptoms to Expect">
                <div className="space-y-4">
                    <p className="text-gray-800 font-medium">
                        {forecast?.message}
                    </p>
                    
                    {forecast?.suggestions && forecast.suggestions.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2">Suggestions for you:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-800">
                                {forecast.suggestions.map((suggestion: string, idx: number) => (
                                    <li key={idx}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-xl mt-4 border border-yellow-100">
                        <strong>Medical Disclaimer:</strong> {forecast?.disclaimer}
                    </div>
                    
                    <Button onClick={() => setExpectModalOpen(false)} fullWidth className="bg-[#FA5881] mt-2">Got it</Button>
                </div>
            </Modal>

            {/* Log Modal */}
            <Modal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} title="Log Symptoms">
                <form onSubmit={handleLogSymptom} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700">Flow Intensity</label>
                        <select 
                            value={flow} 
                            onChange={e => setFlow(e.target.value)}
                            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2 bg-white"
                        >
                            <option value="">Select...</option>
                            <option value="light">Light</option>
                            <option value="medium">Medium</option>
                            <option value="heavy">Heavy</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700">Pain Level</label>
                        <select 
                            value={pain} 
                            onChange={e => setPain(e.target.value)}
                            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2 bg-white"
                        >
                            <option value="">Select...</option>
                            <option value="none">None</option>
                            <option value="mild cramps">Mild Cramps</option>
                            <option value="severe cramps">Severe Cramps</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700">Mood</label>
                        <select 
                            value={mood} 
                            onChange={e => setMood(e.target.value)}
                            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2 bg-white"
                        >
                            <option value="">Select...</option>
                            <option value="calm">Calm</option>
                            <option value="anxious">Anxious</option>
                            <option value="irritable">Irritable</option>
                        </select>
                    </div>
                    <Button type="submit" fullWidth className="bg-[#FA5881]">Save Log</Button>
                </form>
            </Modal>

            {/* Edit Dates Modal */}
            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Period Dates">
                <form onSubmit={handleEditDates} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700">Start Date</label>
                        <Input 
                            type="date" 
                            value={editStartDate}
                            onChange={e => setEditStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700">End Date (Optional)</label>
                        <Input 
                            type="date" 
                            value={editEndDate}
                            onChange={e => setEditEndDate(e.target.value)}
                        />
                    </div>
                    <Button type="submit" fullWidth className="bg-[#FA5881]">Update Cycle</Button>
                </form>
            </Modal>
        </div>
    );
}
