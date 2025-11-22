import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ModernChart = ({ data }) => {
  // Custom tooltip - minimal and professional
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const change = data.find(d => d.name === label)?.priceChange || 0;
      const isPositive = change >= 0;

      return (
        <div className="bg-black/90 border border-gray-600 rounded px-3 py-2 shadow-2xl backdrop-blur">
          <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1 font-mono">{label}</p>
          <p className="text-white font-bold text-lg font-mono mb-0.5">
            ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[11px] font-mono font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 15, left: 15, bottom: 5 }} barGap={8}>
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="1 3"
            stroke="#2D3748"
            vertical={false}
            opacity={0.5}
          />
          <XAxis
            dataKey="name"
            stroke="#718096"
            tick={{ fill: '#A0AEC0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }}
            axisLine={{ stroke: '#4A5568', strokeWidth: 1 }}
            tickLine={false}
            height={50}
            interval={0}
          />
          <YAxis
            stroke="#718096"
            tick={{ fill: '#A0AEC0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${(value).toLocaleString()}`}
            width={60}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          />
          <Bar
            dataKey="value"
            radius={[2, 2, 0, 0]}
            maxBarSize={70}
            fill="url(#greenGradient)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ModernChart;