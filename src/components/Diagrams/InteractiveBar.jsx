import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle, LabelList } from 'recharts';

const SimpleChart = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const data = [
    { date: '2023', value: 31.80, color: "#63BDBF" },
    { date: '2024', value: 33.49, color: "#63BDBF" },
    { date: '2025', value: 34.79, color: "#63BDBF" },
    { date: '2026', value: 36.14, color: "#63BDBF"},
  ];

  const renderCustomBar = (props) => {
    const { x, y, width, height, ...rest } = props;
    return (
      <Rectangle
        {...rest}
        x={x}
        y={y}
        height={height}
        width={width}
        fill={props.payload.color}
        radius={[6, 6, 0, 0]}
        className="transition-all duration-300 select-none"
      />
    );
  };

  const renderHoveredBar = (props) => {
    const { x, y, width, height, ...rest } = props;
    const targetWidth = width + 6;
    const targetX = x - 3; 
    const targetY = y - 6;
    const targetHeight = height + 6;

    return (
      <Rectangle
        {...rest}
        x={targetX}
        y={targetY}
        height={targetHeight}
        width={targetWidth}
        fill={props.payload.color}
        radius={[6, 6, 0, 0]}
        className="cursor-pointer transition-all duration-300 select-none"
      />
    );
  };

  return (
    <div style={{ width: '100%', height: 230 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 35, right: 10, left: 0, bottom: 20 }}>
          <Tooltip cursor={false} content={({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-black/85 border border-[#63BDBF]/30 rounded-lg px-2 py-2 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <p className="text-[#63BDBF] text-sm font-bold m-0">
          {payload[0].payload.date}
        </p>
        <p className="text-white text-sm font-semibold mt-0.5 mb-0">
          ${payload[0].value} economic value
        </p>
      </div>
    );
  }}/>
          <YAxis domain={[30, 'dataMax + 2']} hide={true} />
          <XAxis dataKey="date" interval={0} axisLine={false} tickLine={false} tick={{ dy: 15 }} />
          
          <Bar 
            dataKey="value" 
            shape={renderCustomBar} 
            activeBar={renderHoveredBar}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SimpleChart;