import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <nav className="stats-nav">
        <Link to="/dashboard/department">Department Stats</Link>
        <Link to="/dashboard/employee">Employee Stats</Link>
        <Link to="/dashboard/project">Project Stats</Link>
      </nav>
      <div className="stats-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;