import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ProjectStats = () => {
  const projectData = [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 45 },
    { month: 'Mar', progress: 70 },
    { month: 'Apr', progress: 90 },
  ];

  return (
    <div className="stats-container">
      <h2>Project Progress</h2>
      <LineChart width={500} height={300} data={projectData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="progress" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

export default ProjectStats;