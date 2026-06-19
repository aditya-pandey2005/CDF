'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import Card from '@/components/ui/Card';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

interface ChartRendererProps {
  type: 'bar' | 'pie' | 'line' | 'doughnut';
  data: ChartData;
  title: string;
  className?: string;
}

export default function ChartRenderer({
  type,
  data,
  title,
  className = '',
}: ChartRendererProps) {
  const isCartesian = type === 'bar' || type === 'line';

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8', // --text-secondary
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1a2340', // --bg-card
        titleColor: '#f1f5f9', // --text-primary
        bodyColor: '#94a3b8', // --text-secondary
        borderColor: '#1e293b', // --border
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
      },
    },
    ...(isCartesian && {
      scales: {
        x: {
          grid: {
            color: 'rgba(30, 41, 59, 0.5)', // --border
          },
          ticks: {
            color: '#94a3b8', // --text-secondary
            font: {
              family: 'Inter, sans-serif',
            },
          },
        },
        y: {
          grid: {
            color: 'rgba(30, 41, 59, 0.5)', // --border
          },
          ticks: {
            color: '#94a3b8', // --text-secondary
            font: {
              family: 'Inter, sans-serif',
            },
          },
        },
      },
    }),
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data as any} options={options} />;
      case 'line':
        return <Line data={data as any} options={options} />;
      case 'pie':
        return <Pie data={data as any} options={options} />;
      case 'doughnut':
        return <Doughnut data={data as any} options={options} />;
      default:
        return null;
    }
  };

  return (
    <Card className={`flex flex-col ${className}`}>
      <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
        {title}
      </h3>
      <div className="relative w-full max-w-full flex items-center justify-center">
        {renderChart()}
      </div>
    </Card>
  );
}
