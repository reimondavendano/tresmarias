'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 8400 },
  { name: 'Feb', revenue: 9200 },
  { name: 'Mar', revenue: 10100 },
  { name: 'Apr', revenue: 11300 },
  { name: 'May', revenue: 12450 },
  { name: 'Jun', revenue: 13200 },
];

// Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fill its container
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cc145bff', // text-gray-700
        }
      },
      title: {
        display: false, // Title is handled by CardTitle
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `P${context.parsed.y.toLocaleString()}`;
            }
            return label;
          }
        },
        backgroundColor: '#fff',
        bodyColor: '#cc145bff',
        titleColor: '#cc145bff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
      }
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
          borderColor: '#e5e7eb', // Border color for x-axis
        },
        ticks: {
          color: '#6b7280', // text-gray-600
        },
      },
      y: {
        grid: {
          borderColor: '#e5e7eb', // Border color for y-axis
          color: '#e5e7eb', // Grid line color
        },
        ticks: {
          color: '#6b7280', // text-gray-600
          callback: function(value: any) {
            return `P${value.toLocaleString()}`; // Format Y-axis labels as Philippine Peso
          }
        },
      },
    },
  };

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-salon-dark">Monthly Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Revenue']}
              labelStyle={{ color: '#000' }}
            />
            <Bar dataKey="revenue" fill="hsl(340, 82%, 52%)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}