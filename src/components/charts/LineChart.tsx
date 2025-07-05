import React from 'react';
import type { ChartData } from '../../types';


interface LineChartProps {
  data: ChartData[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  // Find max value for scaling
  const maxValue = Math.max(...data.map((item) => item.value));
  const minValue = Math.min(...data.map((item) => item.value));
  const range = maxValue - minValue;

  // Calculate positions for points and lines
  const chartHeight = 180;
  const chartWidth = 100 - (data.length > 1 ? 100 / (data.length - 1) : 0);

  // Generate SVG path
  const pathD = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - ((point.value - minValue) / range) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="relative h-full w-full">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-2">
        <div>{maxValue}</div>
        <div>{Math.round((maxValue + minValue) / 2)}</div>
        <div>{minValue}</div>
      </div>

      {/* Chart area */}
      <div className="absolute left-8 right-4 top-0 bottom-0">
        <svg width="100%" height="100%" viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1={chartHeight / 2} x2="100" y2={chartHeight / 2} stroke="#e5e7eb" strokeDasharray="2,2" />
          <line x1="0" y1={chartHeight} x2="100" y2={chartHeight} stroke="#e5e7eb" />

          {/* Data line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            const y = chartHeight - ((point.value - minValue) / range) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="absolute left-8 right-4 bottom-0 flex justify-between text-xs text-gray-500">
        {data.map((point, index) => (
          <div key={index} className={index === 0 ? 'text-left' : index === data.length - 1 ? 'text-right' : ''}>
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;