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
    <div className = "interactiveBarGraph">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 35, right: 10, left: 0, bottom: 20 }}>
          <Tooltip cursor={false} content={({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-chart-tooltip">
        <p className="date">
          {payload[0].payload.date}
        </p>
        <p className="value">
          ${payload[0].value} economic value
        </p>
      </div>
    );
  }}/>
          <YAxis domain={[30, 'dataMax + 2']} hide={true} />
          <XAxis dataKey="date" interval={0}/>
          
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