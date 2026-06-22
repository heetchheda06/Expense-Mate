import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

// Register essential ChartJS structures
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// High-fidelity Category spending breakdown chart
export const CategoryDoughnutChart = ({ expenses }) => {
  const categories = [
    'Food',
    'Transport',
    'Education',
    'Shopping',
    'Health',
    'Bills',
    'EMI',
    'Investments',
    'Entertainment',
    'Miscellaneous',
    'Grocery'
  ];

  // Neon color map matching aesthetics
  const categoryColors = {
    'Food': '#4F46E5', // Indigo
    'Transport': '#06B6D4', // Cyan
    'Education': '#10B981', // Emerald
    'Shopping': '#8B5CF6', // Purple
    'Health': '#F43F5E', // Rose
    'Bills': '#EC4899', // Pink
    'EMI': '#F59E0B', // Amber
    'Investments': '#14B8A6', // Teal
    'Entertainment': '#D946EF', // Fuchsia
    'Miscellaneous': '#64748B', // Slate
    'Grocery': '#84CC16' // Lime
  };

  // Compile totals
  const totals = {};
  categories.forEach(c => { totals[c] = 0; });
  expenses.forEach(e => {
    if (totals[e.category] !== undefined) {
      totals[e.category] += e.amount;
    } else {
      totals['Other'] += e.amount;
    }
  });

  const filteredCategories = categories.filter(c => totals[c] > 0);
  const dataValues = filteredCategories.map(c => totals[c]);
  const bgColors = filteredCategories.map(c => categoryColors[c]);

  const hasData = dataValues.length > 0;

  const data = {
    labels: filteredCategories,
    datasets: [
      {
        data: hasData ? dataValues : [1],
        backgroundColor: hasData ? bgColors : ['rgba(255,255,255,0.05)'],
        borderColor: hasData ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: {
            family: 'Outfit',
            size: 11,
            weight: 'semibold'
          },
          padding: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        enabled: hasData,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return ` ${label}: ₹${value.toFixed(2)}`;
          }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="relative h-60 w-full flex items-center justify-center">
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-xs text-slate-400 font-semibold bg-slate-900/60 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">No expenses logged yet</p>
        </div>
      )}
      <Doughnut data={data} options={options} />
    </div>
  );
};

// Spending Trend Line chart
export const SpendingTrendChart = ({ expenses }) => {
  // Sort expenses by date ascending to build timelines
  const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group by date (last 7 transaction dates or calendar dates)
  const dailyTotals = {};
  sorted.forEach(exp => {
    const dStr = new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dailyTotals[dStr] = (dailyTotals[dStr] || 0) + exp.amount;
  });

  const labels = Object.keys(dailyTotals).slice(-7);
  const dataValues = labels.map(l => dailyTotals[l]);

  const hasData = labels.length > 0;

  const data = {
    labels: hasData ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Daily Spending',
        data: hasData ? dataValues : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#4F46E5', // Brand Indigo
        backgroundColor: 'rgba(79, 70, 229, 0.15)', // Light fill
        borderWidth: 2,
        tension: 0.35,
        pointBackgroundColor: '#06B6D4', // Cyan nodes
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Outfit', size: 10 },
          callback: (value) => `₹${value}`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Outfit', size: 10 }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => ` Spent: ₹${context.raw.toFixed(2)}`
        }
      }
    }
  };

  return (
    <div className="h-60 w-full">
      <Line data={data} options={options} />
    </div>
  );
};
