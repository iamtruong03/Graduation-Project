import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const EmployeeStats = () => {
  const [data] = useState([
    { name: 'Active', value: 85 },
    { name: 'On Leave', value: 10 },
    { name: 'Inactive', value: 5 }
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="stats-container">
      <h2>Employee Status Distribution</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default EmployeeStats;