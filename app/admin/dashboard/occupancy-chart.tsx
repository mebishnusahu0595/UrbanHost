// components/dashboard/occupancy-chart.tsx
"use client";

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface OccupancyChartProps {
    approvedHotels?: number;
    pendingHotels?: number;
    totalHotels?: number;
}

export function OccupancyChart({ approvedHotels = 0, pendingHotels = 0, totalHotels = 0 }: OccupancyChartProps) {
    const rejectedHotels = Math.max(0, totalHotels - approvedHotels - pendingHotels);

    // Calculate percentages
    const approvedPercent = totalHotels > 0 ? Math.round((approvedHotels / totalHotels) * 100) : 0;
    const pendingPercent = totalHotels > 0 ? Math.round((pendingHotels / totalHotels) * 100) : 0;
    const otherPercent = totalHotels > 0 ? Math.round((rejectedHotels / totalHotels) * 100) : 0;

    const data = {
        labels: ['Approved', 'Pending', 'Other'],
        datasets: [
            {
                data: totalHotels > 0 ? [approvedPercent, pendingPercent, otherPercent] : [0, 0, 100],
                backgroundColor: ['#3B82F6', '#F97316', '#94A3B8'],
                hoverBackgroundColor: ['#2563EB', '#EA580C', '#64748B'],
                borderWidth: 0,
                cutout: '70%',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context: any) => `${context.label}: ${context.parsed}%`,
                },
            },
        },
    };

    const centerTextPlugin = {
        id: 'centerText',
        afterDatasetsDraw(chart: any) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();

            // Draw percentage
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.fillStyle = '#1E3A8A';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${approvedPercent}%`, width / 2, height / 2 - 8);

            // Draw label
            ctx.font = '12px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Approved', width / 2, height / 2 + 16);

            ctx.restore();
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-6">
            <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                <Doughnut data={data} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-blue-900">{approvedPercent}%</span>
                    <span className="text-xs text-gray-500">Approved</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3 w-full px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Approved</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{approvedPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{pendingPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                        <span className="text-sm text-gray-600">Other</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{otherPercent}%</span>
                </div>
            </div>
        </div>
    );
}
