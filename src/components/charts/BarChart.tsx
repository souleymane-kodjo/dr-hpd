import React from 'react';
import type { ChartData } from '../../types';


interface BarChartProps {
  data: ChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  // Find max value for scaling
  const maxValue = Math.max(...data.map((item) => item.value));

  // Chart dimensions
  const chartHeight = 180;
  const barWidth = 100 / data.length - 2; // -2 for spacing

  return (
    <div className="relative h-full w-full">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-2">
        <div>{maxValue}%</div>
        <div>{Math.round(maxValue / 2)}%</div>
        <div>0%</div>
      </div>

      {/* Chart area */}
      <div className="absolute left-8 right-4 top-0 bottom-6">
        <svg width="100%" height="100%" viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1={chartHeight / 2} x2="100" y2={chartHeight / 2} stroke="#e5e7eb" strokeDasharray="2,2" />
          <line x1="0" y1={chartHeight} x2="100" y2={chartHeight} stroke="#e5e7eb" />

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = (index / data.length) * 100 + 1; // +1 for spacing
            const y = chartHeight - barHeight;

            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#10b981"
                rx="2"
                opacity={item.value > 80 ? 1 : item.value > 50 ? 0.8 : 0.6}
              />
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="absolute left-8 right-4 bottom-0 flex justify-between text-xs text-gray-500">
        {data.map((item, index) => (
          <div key={index} className="transform -rotate-45 origin-top-left ml-2">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;