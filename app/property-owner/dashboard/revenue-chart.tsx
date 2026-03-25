"use client";

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface RevenueDataPoint {
    _id: { year: number; month: number; day?: number; week?: number };
    revenue: number;
    bookings: number;
}

interface RevenueChartProps {
    monthlyData?: RevenueDataPoint[];
    dailyData?: RevenueDataPoint[];
    weeklyData?: RevenueDataPoint[];
    period?: 'monthly' | 'weekly' | 'daily';
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RevenueChart({ monthlyData = [], dailyData = [], weeklyData = [], period = 'daily' }: RevenueChartProps) {
    let labels: string[] = [];
    let revenueData: number[] = [];

    if (period === 'daily') {
        if (dailyData.length > 0) {
            labels = dailyData.map(d => `${d._id.day}/${d._id.month}`);
            revenueData = dailyData.map(d => d.revenue);
        } else {
            // Build 14-day placeholder
            for (let i = 13; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
                revenueData.push(0);
            }
        }
    } else if (period === 'weekly') {
        if (weeklyData.length > 0) {
            labels = weeklyData.map(d => `Week ${d._id.week}`);
            revenueData = weeklyData.map(d => d.revenue);
        } else {
            // Build 10-week placeholder
            for (let i = 9; i >= 0; i--) {
                labels.push(`Week ${i + 1}`);
                revenueData.push(0);
            }
        }
    } else if (period === 'monthly') {
        if (monthlyData.length > 0) {
            labels = monthlyData.map(d => `${monthNames[d._id.month - 1]} ${d._id.year.toString().slice(-2)}`);
            revenueData = monthlyData.map(d => d.revenue);
        } else {
            // Build 6-month placeholder
            const today = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(today);
                date.setMonth(date.getMonth() - i);
                labels.push(`${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`);
                revenueData.push(0);
            }
        }
    }

    const data = {
        labels,
        datasets: [
            {
                label: 'Revenue',
                data: revenueData,
                fill: true,
                borderColor: '#1E3A8A',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(30, 58, 138, 0.3)');
                    gradient.addColorStop(1, 'rgba(30, 58, 138, 0)');
                    return gradient;
                },
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#1E3A8A',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                borderColor: '#374151',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context: any) => `₹${context.parsed.y.toLocaleString()}`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#888888',
                    font: {
                        size: 11,
                    },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6,
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: '#f0f0f0',
                    drawBorder: false,
                },
                ticks: {
                    color: '#888888',
                    font: {
                        size: 11,
                    },
                    callback: (value: any) => value >= 1000 ? `₹${value / 1000}k` : `₹${value}`,
                    padding: 8,
                },
                border: {
                    display: false, // Ensures no extra border line takes space
                },
            },
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
    };

    return (
        <div className="h-[250px] w-full">
            <Line data={data} options={options} />
        </div>
    );
}
