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
    
    // Log form
    const [flow, setFlow] = useState('');
    const [mood, setMood] = useState('');
    const [pain, setPain] = useState('');

    // Edit form
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');

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

    // Week Calendar Calculation
    const today = new Date();
    const currentMonthStr = today.toLocaleString('default', { month: 'long', day: 'numeric' });
    
    const weekDays = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const currentDayOfWeek = today.getDay();
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        // Start week from Sunday or adjust so today is in the middle. Let's just do Sun-Sat
        d.setDate(today.getDate() - currentDayOfWeek + i);
        weekDays.push({
            date: d.getDate(),
            name: dayNames[i],
            isToday: i === currentDayOfWeek
        });
    }

    const delayDays = status?.cycleDay - status?.cycleLength;

    return (
        <div className="relative min-h-screen bg-[#FFF5F7] animate-fade-in pb-24 -m-4 sm:-m-8 overflow-hidden">
            {/* Pink Gradient Header Background */}
            <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#FFC2CD] to-[#FA5881] rounded-b-[40px] z-0"></div>
            
            {/* Top Curved Overlay for blending */}
            <div className="relative z-10 pt-12 px-6 flex flex-col items-center text-center">
                
                {/* Header Date & Icons */}
                <div className="w-full flex justify-between items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center relative shadow-md">
                        <span className="text-white text-xs font-bold">Heal</span>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FA5881] rounded-full border-2 border-white"></div>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{currentMonthStr}</h2>
                    <div className="w-6 h-6"></div> {/* Placeholder to keep header centered */}
                </div>

                {/* Week Calendar */}
                <div className="flex justify-between w-full max-w-sm px-2 mb-10">
                    {weekDays.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-gray-700/80">{d.isToday ? 'TODAY' : d.name}</span>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                ${d.isToday ? 'bg-white text-[#FA5881] shadow-lg ring-4 ring-white/30' : 'bg-[#FF7396] text-white'}`}>
                                {d.date}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Display */}
                <div className="mb-8 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{status?.phase}:</h3>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">Day {status?.cycleDay}</h1>
                    {delayDays > 0 && (
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
            <div className="relative z-10 mt-16 px-6 bg-[#FFF5F7]">
                
                {/* My daily insights */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">My daily insights • Today</h3>
                
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

                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-xl mt-2 border border-yellow-100">
                    <strong>Medical Disclaimer:</strong> {forecast?.disclaimer}
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl mt-4 border border-blue-100">
                    <p className="text-sm font-medium text-gray-700">
                        {forecast?.message}
                    </p>
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
