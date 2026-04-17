import React from 'react';
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
    plugins: {
        legend: {
            position: 'top' as const,
        },
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

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Progress() {
    const moodData = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Stress Level',
                data: [4, 5, 3, 6, 4, 2, 3],
                borderColor: 'rgb(236, 72, 153)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const stepData = {
        labels,
        datasets: [
            {
                label: 'Steps',
                data: [4500, 6200, 5100, 8400, 7200, 3100, 5400],
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderRadius: 8,
            },
        ],
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Weekly Progress</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Stress & Mood Trends</h3>
                    <Line options={options} data={moodData} />
                </Card>

                <Card>
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Activity Levels</h3>
                    <Bar options={options} data={stepData} />
                </Card>

                <Card className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Weight Tracker</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400">
                        [Weight Chart Placeholder - Add more data points to visualize]
                    </div>
                </Card>
            </div>
        </div>
    );
}
