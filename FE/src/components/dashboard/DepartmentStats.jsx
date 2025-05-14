import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined, ProjectOutlined, DollarOutlined } from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import './../../styles/dashboard.css';  // Sửa đường dẫn import

const DepartmentStats = () => {
  // Sample data - replace with real data from API
  const stats = {
    totalDepartments: 5,
    totalEmployees: 42,
    totalProjects: 15,
    activeProjects: 8,
    completedProjects: 7,
    budget: 1250000
  };

  const projectProgressData = [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 45 },
    { month: 'Mar', progress: 70 },
    { month: 'Apr', progress: 90 },
  ];

  return (
    <div className="dashboard-container">
      <h2>Thống kê phòng ban</h2>
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng số phòng ban" 
              value={stats.totalDepartments} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng nhân viên" 
              value={stats.totalEmployees} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng số dự án" 
              value={stats.totalProjects} 
              prefix={<ProjectOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Ngân sách (VND)" 
              value={stats.budget} 
              prefix={<DollarOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} className="stats-row">
        <Col span={12}>
          <Card>
            <Statistic 
              title="Dự án đang thực hiện" 
              value={stats.activeProjects} 
              prefix={<ProjectOutlined />} 
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic 
              title="Dự án đã hoàn thành" 
              value={stats.completedProjects} 
              prefix={<ProjectOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      <Row className="stats-row">
        <Col span={24}>
          <Card title="Tiến độ dự án theo tháng">
            <LineChart width={800} height={300} data={projectProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="progress" stroke="#8884d8" />
            </LineChart>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DepartmentStats;