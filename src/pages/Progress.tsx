import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../utils/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const options = {
    responsive: true,
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
    plugins: {
        legend: {
            position: 'top' as const,
        },
        tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e2e8f0',
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            displayColors: true,
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            }
        },
        x: {
            grid: {
                display: false,
            }
        }
    }
};

const getLast7DaysLabels = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(days[d.getDay()]);
    }
    return labels;
};

export default function Progress() {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        stress: [0, 0, 0, 0, 0, 0, 0],
        steps: [0, 0, 0, 0, 0, 0, 0],
        weight: [null, null, null, null, null, null, null] as (number | null)[],
    });

    const labels = getLast7DaysLabels();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logs = await api('/logs/weekly');
                
                const newStress = [0, 0, 0, 0, 0, 0, 0];
                const newSteps = [0, 0, 0, 0, 0, 0, 0];
                const newWeight: (number | null)[] = [null, null, null, null, null, null, null];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                logs.forEach((log: any) => {
                    const logDate = new Date(log.date);
                    logDate.setHours(0, 0, 0, 0);
                    const diffTime = today.getTime() - logDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays >= 0 && diffDays < 7) {
                        const idx = 6 - diffDays;
                        if (log.stress_level != null) newStress[idx] = log.stress_level;
                        if (log.step_count != null) newSteps[idx] = log.step_count;
                        if (log.weight != null) newWeight[idx] = log.weight;
                    }
                });

                setChartData({
                    stress: newStress,
                    steps: newSteps,
                    weight: newWeight,
                });
            } catch (err) {
                console.error("Failed to fetch weekly logs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const moodDataConfig = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Stress Level',
                data: chartData.stress,
                borderColor: 'rgb(236, 72, 153)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                tension: 0.4,
                pointBackgroundColor: 'rgb(236, 72, 153)',
            },
        ],
    };

    const stepDataConfig = {
        labels,
        datasets: [
            {
                label: 'Steps',
                data: chartData.steps,
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(139, 92, 246, 0.8)',
            },
        ],
    };

    const weightDataConfig = {
        labels,
        datasets: [
            {
                fill: false,
                label: 'Weight (kg)',
                data: chartData.weight,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4,
                spanGaps: true,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointRadius: 5,
            },
        ],
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Weekly Progress</h2>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-gray-500 animate-pulse bg-white rounded-xl shadow-sm">
                    Loading your progress...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Stress & Mood Trends</h3>
                        <Line options={options} data={moodDataConfig} />
                    </Card>

                    <Card>
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Activity Levels</h3>
                        <Bar options={options} data={stepDataConfig} />
                    </Card>

                    <Card className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Weight Tracker</h3>
                        {chartData.weight.every(w => w === null) ? (
                            <div className="h-64 flex items-center justify-center bg-gray-50/80 rounded-xl text-gray-400 font-medium">
                                No weight entries found for the past 7 days. Log your weight to see trends!
                            </div>
                        ) : (
                            <div className="h-72">
                                <Line options={{...options, maintainAspectRatio: false}} data={weightDataConfig} />
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
