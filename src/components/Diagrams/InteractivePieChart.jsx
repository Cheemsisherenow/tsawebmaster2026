import React, { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';

const InteractivePieChart = () => {
  const data = [
    { name: 'Not Volunteering', value: 72, color: '#7ABCBF' },
    { name: 'Volunteering', value: 28, color: '#3D6B6E' },
  ];

  const [activeData, setActiveData] = useState(data[0]);


  const renderCustomSlice = (props) => {
    const { fill, innerRadius, outerRadius, isActive, ...rest } = props;
    
    const targetInner = isActive ? innerRadius - 2 : innerRadius; 
    const targetOuter = isActive ? outerRadius + 4 : outerRadius;

    return (
      <Sector 
        {...rest} 
        innerRadius={targetInner}
        outerRadius={targetOuter}
        fill={props.payload.color} 
        style={{ outline: 'none', stroke: 'none' }}
        className="cursor-pointer transition-all duration-300 select-none"
      />
    );
  };

  return (
    <div className = "interactivePieChart">
        <div className="volunteerGroup">
          <span className="volunteer">
            {activeData.name}
          </span>
          <span 
            className="percentage"
            style={{ color: activeData.color }}
          >
            {activeData.value}%
          </span>
        </div>
      <div className="chart">
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" 
              cy="50%" 
              innerRadius={30} 
              outerRadius={50} 
              paddingAngle={0}
              dataKey="value"
              shape={renderCustomSlice}
              onMouseEnter={(_, index) => setActiveData(data[index])}
              onMouseLeave={() => setActiveData(data[0])}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InteractivePieChart;