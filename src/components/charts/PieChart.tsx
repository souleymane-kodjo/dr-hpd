import React from 'react';
import type { ChartData } from '../../types';


interface PieChartProps {
  data: ChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  // Define colors for pie segments
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Calculate the pie segments
  const segments = data.map((item, index) => {
    const percent = (item.value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    return {
      ...item,
      percent,
      startPercent,
      endPercent: cumulativePercent,
      color: colors[index % colors.length],
    };
  });

  const radius = 50;
  const centerX = 70;
  const centerY = 70;

  return (
    <div className="relative h-full w-full">
      <svg width="100%" height="100%" viewBox="0 0 140 180">
        {/* Pie chart */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          {segments.map((segment, index) => {
            const startAngle = (segment.startPercent / 100) * 2 * Math.PI - Math.PI / 2;
            const endAngle = (segment.endPercent / 100) * 2 * Math.PI - Math.PI / 2;

            const x1 = radius * Math.cos(startAngle);
            const y1 = radius * Math.sin(startAngle);
            const x2 = radius * Math.cos(endAngle);
            const y2 = radius * Math.sin(endAngle);

            const largeArcFlag = segment.percent > 50 ? 1 : 0;

            const pathData = [
              `M 0 0`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`,
            ].join(' ');

            return <path key={index} d={pathData} fill={segment.color} />;
          })}

          {/* Inner white circle for donut effect */}
          <circle cx="0" cy="0" r={radius * 0.6} fill="white" />
        </g>

        {/* Legend */}
        <g transform="translate(0, 140)">
          {segments.map((segment, index) => (
            <g key={index} transform={`translate(0, ${index * 20})`}>
              <rect width="12" height="12" fill={segment.color} rx="2" />
              <text x="20" y="10" fontSize="10" fill="#374151">
                {segment.label} ({segment.percent.toFixed(1)}%)
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default PieChart;