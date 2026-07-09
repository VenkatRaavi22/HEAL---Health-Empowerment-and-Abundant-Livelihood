import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Setup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        age: '',
        height: '',
        weight: '',
        cycleLength: '',
        lastPeriod: '',
        condition: 'None',
        thyroidType: 'Hyperthyroidism (Overactive)',
        medication: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let finalCondition = formData.condition;
        if (formData.condition === 'Thyroid') {
            finalCondition = `Thyroid - ${formData.thyroidType}`;
        }

        try {
            await api("/profile/setup", {
                method: "POST",
                body: JSON.stringify({
                    age: parseInt(formData.age),
                    height: parseInt(formData.height),
                    weight: parseInt(formData.weight),
                    cycle_length: parseInt(formData.cycleLength),
                    last_period_date: formData.lastPeriod,
                    known_condition: finalCondition,
                    medication: formData.medication
                }),
            });

            // Update local user object
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            user.profileCompleted = true;
            localStorage.setItem("user", JSON.stringify(user));

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || "Failed to save profile");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Card className="p-8 animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Initial Health Setup</h2>
                <p className="text-gray-500 mb-8">Let's personalize your experience. All data is private.</p>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Age"
                            name="age"
                            type="number"
                            placeholder="25"
                            required
                            value={formData.age}
                            onChange={handleChange}
                        />
                        <Input
                            label="Weight (kg)"
                            name="weight"
                            type="number"
                            placeholder="60"
                            required
                            value={formData.weight}
                            onChange={handleChange}
                        />
                        <Input
                            label="Height (cm)"
                            name="height"
                            type="number"
                            placeholder="165"
                            required
                            value={formData.height}
                            onChange={handleChange}
                        />
                        <Input
                            label="Cycle Length (days)"
                            name="cycleLength"
                            type="number"
                            placeholder="28"
                            required
                            value={formData.cycleLength}
                            onChange={handleChange}
                        />
                    </div>

                    <Input
                        label="Last Period Start Date"
                        name="lastPeriod"
                        type="date"
                        required
                        value={formData.lastPeriod}
                        onChange={handleChange}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Known Conditions</label>
                        <select
                            name="condition"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-gray-50/50 focus:bg-white"
                            value={formData.condition}
                            onChange={handleChange}
                        >
                            <option value="None">None</option>
                            <option value="PCOS">PCOS</option>
                            <option value="Thyroid">Thyroid</option>
                            <option value="Endometriosis">Endometriosis</option>
                            <option value="Premenstrual Dysphoric Disorder (PMDD)">Premenstrual Dysphoric Disorder (PMDD)</option>
                            <option value="Cortisol / Stress Imbalances">Cortisol / Stress Imbalances</option>
                            <option value="Insulin Resistance">Insulin Resistance</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {formData.condition === 'Thyroid' && (
                        <div className="flex flex-col gap-1.5 animate-fade-in">
                            <label className="text-sm font-medium text-gray-700 ml-1">Thyroid Type</label>
                            <select
                                name="thyroidType"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-gray-50/50 focus:bg-white"
                                value={formData.thyroidType}
                                onChange={handleChange}
                            >
                                <option value="Hyperthyroidism (Overactive)">Hyperthyroidism (Overactive)</option>
                                <option value="Hypothyroidism (Underactive)">Hypothyroidism (Underactive)</option>
                            </select>
                        </div>
                    )}

                    <Input
                        label="Current Medication (Optional)"
                        name="medication"
                        type="text"
                        placeholder="e.g. Metformin"
                        value={formData.medication}
                        onChange={handleChange}
                    />

                    <Button type="submit" fullWidth className="mt-6 text-lg">
                        Complete Setup
                    </Button>
                </form>
            </Card>
        </div>
    );
}
