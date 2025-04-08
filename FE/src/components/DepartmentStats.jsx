import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined, ProjectOutlined, DollarOutlined } from '@ant-design/icons';
import './../styles/dashboard.css';

const DepartmentStats = () => {
  // Sample data - replace with real data from API
  const stats = {
    totalDepartments: 5,
    totalEmployees: 42,
    avgProjects: 3.2,
    budget: 1250000
  };

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
              title="Dự án trung bình" 
              value={stats.avgProjects} 
              precision={1}
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
    </div>
  );
};

export default DepartmentStats;