import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ModernChart = ({ data }) => {
  return (
    <div className="w-full h-[400px] bg-gray-900 rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            itemStyle={{ color: '#E5E7EB' }}
            labelStyle={{ color: '#9CA3AF', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8, fill: '#10B981', stroke: '#064E3B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ModernChart;