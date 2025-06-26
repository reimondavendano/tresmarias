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