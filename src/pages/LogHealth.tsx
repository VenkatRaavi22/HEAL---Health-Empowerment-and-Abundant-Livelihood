import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Smile, Frown, Meh, Save, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../utils/api';

export default function LogHealth() {
    const navigate = useNavigate();
    const [moodLevel, setMoodLevel] = useState(50);
    const [stress, setStress] = useState('5');
    const [weight, setWeight] = useState('');
    const [sleep, setSleep] = useState('');
    const [symptomList, setSymptomList] = useState<any[]>([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    React.useEffect(() => {
        fetchSymptoms();
    }, []);

    const fetchSymptoms = async () => {
        try {
            const data = await api("/symptoms");
            setSymptomList(data);
        } catch (err) {
            console.error("Failed to fetch symptoms", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSymptom = (id: number) => {
        if (selectedSymptoms.includes(id)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
        } else {
            setSelectedSymptoms([...selectedSymptoms, id]);
        }
    };

    const getMoodIcon = () => {
        if (moodLevel < 33) return <Frown className="w-16 h-16 text-rose-500 transition-colors duration-300" strokeWidth={1.5} />;
        if (moodLevel < 66) return <Meh className="w-16 h-16 text-amber-500 transition-colors duration-300" strokeWidth={1.5} />;
        return <Smile className="w-16 h-16 text-emerald-500 transition-colors duration-300" strokeWidth={1.5} />;
    };

    const getMoodLabel = () => {
        if (moodLevel < 33) return 'Low';
        if (moodLevel < 66) return 'Neutral';
        return 'Great';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api("/logs", {
                method: "POST",
                body: JSON.stringify({
                    mood: getMoodLabel(),
                    sleep_hours: sleep ? parseFloat(sleep) : null,
                    stress_level: parseInt(stress),
                    weight: weight ? parseFloat(weight) : null,
                    step_count: 5000, // Default or add field
                    symptomIds: selectedSymptoms
                }),
            });

            // Short delay to showcase the attractive loading state
            setTimeout(() => {
                navigate('/dashboard');
            }, 600);
        } catch (err) {
            console.error("Failed to save log", err);
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Health Log</h2>
                </div>
                <span className="text-gray-500 font-medium">{new Date().toLocaleDateString()}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mood Section */}
                <Card className="text-center py-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 opacity-50 z-0"></div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 tracking-wide">How do you feel today?</h3>
                        
                        <div className="flex flex-col items-center gap-6">
                            <div className="transform transition-transform duration-300 hover:scale-110">
                                {getMoodIcon()}
                            </div>
                            
                            <div className="w-full max-w-sm px-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={moodLevel}
                                    onChange={(e) => setMoodLevel(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FA5881]"
                                />
                                <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <span>Worst</span>
                                    <span className="text-gray-800">{getMoodLabel()}</span>
                                    <span>Great</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Vitals Section */}
                <Card className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 tracking-wide">Vitals & Sleep</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <Input
                            label="Weight (kg)"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 60.5"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                        <Input
                            label="Sleep (hours)"
                            type="number"
                            step="0.5"
                            placeholder="e.g. 7.5"
                            value={sleep}
                            onChange={(e) => setSleep(e.target.value)}
                        />
                    </div>

                    <div className="pt-2 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700">Stress Level</label>
                            <span className="text-sm font-black text-[#FA5881] bg-rose-50 px-3 py-1 rounded-full">{stress}/10</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={stress}
                            onChange={(e) => setStress(e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FA5881]"
                        />
                    </div>
                </Card>

                {/* Symptoms Section */}
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 tracking-wide mb-5">Symptoms</h3>
                    <div className="flex flex-wrap gap-2.5">
                        {loading ? (
                            <p className="text-gray-400 text-sm italic w-full text-center py-4">Loading symptoms...</p>
                        ) : (
                            symptomList.map((sym) => (
                                <button
                                    key={sym.symptom_id}
                                    type="button"
                                    onClick={() => toggleSymptom(sym.symptom_id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 shadow-sm ${selectedSymptoms.includes(sym.symptom_id)
                                        ? 'bg-gradient-to-r from-[#FA5881] to-rose-400 text-white shadow-rose-200 border border-transparent scale-105'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {sym.symptom_name}
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                <Button 
                    fullWidth 
                    type="submit" 
                    className="text-lg h-14 font-bold shadow-lg shadow-rose-200 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Saving Entry...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Save className="w-5 h-5" />
                            Save Entry
                        </span>
                    )}
                </Button>
            </form>
        </div>
    );
}
