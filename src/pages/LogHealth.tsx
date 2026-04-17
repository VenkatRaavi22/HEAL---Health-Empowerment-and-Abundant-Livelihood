import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Smile, Frown, Meh, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../utils/api';

export default function LogHealth() {
    const navigate = useNavigate();
    const [mood, setMood] = useState('Neutral');
    const [stress, setStress] = useState('5');
    const [weight, setWeight] = useState('');
    const [sleep, setSleep] = useState('');
    const [symptomList, setSymptomList] = useState<any[]>([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api("/logs", {
                method: "POST",
                body: JSON.stringify({
                    mood,
                    sleep_hours: parseFloat(sleep),
                    stress_level: parseInt(stress),
                    weight: parseFloat(weight),
                    step_count: 5000, // Default or add field
                    symptomIds: selectedSymptoms
                }),
            });

            // Fetch risk analysis to update dashboard context if needed
            // For now just redirect
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to save log", err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Daily Health Log</h2>
                <span className="text-gray-500">{new Date().toLocaleDateString()}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mood Section */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">How do you feel today?</h3>
                    <div className="flex gap-4">
                        {['Great', 'Neutral', 'Low'].map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMood(m)}
                                className={`flex-1 p-4 rounded-xl border transition-all ${mood === m
                                    ? 'border-primary bg-primary/10 text-primary font-medium'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    {m === 'Great' && <Smile className="w-8 h-8" />}
                                    {m === 'Neutral' && <Meh className="w-8 h-8" />}
                                    {m === 'Low' && <Frown className="w-8 h-8" />}
                                    <span>{m}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Vitals Section */}
                <Card className="space-y-4">
                    <h3 className="text-lg font-semibold">Vitals & Sleep</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Weight (kg)"
                            type="number"
                            step="0.1"
                            placeholder="60.5"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                        <Input
                            label="Sleep (hours)"
                            type="number"
                            step="0.5"
                            placeholder="7.5"
                            value={sleep}
                            onChange={(e) => setSleep(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-700">Stress Level</label>
                            <span className="text-sm font-bold text-primary">{stress}/10</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={stress}
                            onChange={(e) => setStress(e.target.value)}
                            className="w-full text-primary accent-primary"
                        />
                    </div>
                </Card>

                {/* Symptoms Section */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                        {loading ? (
                            <p className="text-gray-500 text-sm">Loading symptoms...</p>
                        ) : (
                            symptomList.map((sym) => (
                                <button
                                    key={sym.symptom_id}
                                    type="button"
                                    onClick={() => toggleSymptom(sym.symptom_id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSymptoms.includes(sym.symptom_id)
                                        ? 'bg-secondary text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {sym.symptom_name}
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                <Button fullWidth type="submit" className="text-lg">
                    <Save className="w-5 h-5" />
                    Save Entry
                </Button>
            </form>
        </div>
    );
}
