import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Select, Spin, Empty, Menu, Modal } from 'antd';
import { TeamOutlined, ProjectOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, BarChartOutlined } from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import './../../styles/dashboard.css';
import departmentService from '../../services/departmentService';

const DepartmentStats = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch danh sách phòng ban khi component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await departmentService.getAll();
        if (response.status === 200) {
          setDepartments(response.data);
        }

        // Fetch department stats
        const statsResponse = await fetch('http://localhost:8080/department/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        const statsData = await statsResponse.json();
        
        if (statsData.status === 200) {
          setStats({
            totalDepartments: statsData.data.totalDepartments,
            totalUsers: statsData.data.totalUsers,  // Mapping totalUsers từ API vào totalUsers trong UI
            totalProjects: statsData.data.totalProjects,
            activeProjects: statsData.data.totalProjectsProcess,
            completedProjects: statsData.data.totalProjectsComplete
          });

          setProjectProgressData(statsData.data.monthlyProgress);
          
          const mappedEmployeeList = statsData.data.userStatsList.map(user => ({
            id: user.name, // Using name as ID since no ID provided
            name: user.name,
            role: user.position === 'NULL' ? 'Chưa phân công' : user.position,
            tasks: user.totalTasks,
            completed: user.tasksCompleted,
            performanceData: [{ month: 'Current', completed: user.tasksCompleted, total: user.totalTasks }]
          }));

          setDepartmentDetails(prev => ({
            ...prev,
            1: {
              ...prev[1],
              employeeList: mappedEmployeeList
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setSnackbar({
          open: true,
          message: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const departmentDetails = {
    1: {
      employees: 12,
      activeProjects: 3,
      completedProjects: 2,
      performance: 85,
      projectProgress: [
        { month: 'T1', progress: 25 },
        { month: 'T2', progress: 48 },
        { month: 'T3', progress: 75 },
        { month: 'T4', progress: 85 },
      ],
      employeeList: [
        { 
          id: 1,
          name: 'Nguyễn Văn A', 
          role: 'Trưởng phòng', 
          tasks: 15, 
          completed: 12,
          performanceData: [
            { month: 'T1', completed: 3, total: 4 },
            { month: 'T2', completed: 4, total: 5 },
            { month: 'T3', completed: 5, total: 6 },
            { month: 'T4', completed: 4, total: 4 },
          ]
        },
        { 
          id: 2,
          name: 'Trần Thị B', 
          role: 'Nhân viên', 
          tasks: 10, 
          completed: 8,
          performanceData: [
            { month: 'T1', completed: 2, total: 3 },
            { month: 'T2', completed: 3, total: 4 },
            { month: 'T3', completed: 3, total: 3 },
            { month: 'T4', completed: 2, total: 2 },
          ]
        },
        { 
          id: 3,
          name: 'Lê Văn C', 
          role: 'Nhân viên', 
          tasks: 12, 
          completed: 10,
          performanceData: [
            { month: 'T1', completed: 2, total: 3 },
            { month: 'T2', completed: 3, total: 3 },
            { month: 'T3', completed: 4, total: 5 },
            { month: 'T4', completed: 3, total: 3 },
          ]
        }
      ]
    },
    // Thêm dữ liệu cho các phòng ban khác...
  };

  const stats = {
    totalDepartments: departments.length,
    totalUsers: 42,
    totalProjects: 15,
    activeProjects: 8,
    completedProjects: 7,
  };

  const projectProgressData = [
    { month: 'T1', progress: 30 },
    { month: 'T2', progress: 45 },
    { month: 'T3', progress: 65 },
    { month: 'T4', progress: 80 },
  ];

  const projectStatusData = [
    { name: 'Đang thực hiện', value: stats.activeProjects },
    { name: 'Đã hoàn thành', value: stats.completedProjects },
  ];

  const COLORS = ['#faad14', '#52c41a'];

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDepartmentSelect = async (key) => {
    try {
      setLoading(true);
      setSelectedDepartment(key);
  
      if (key !== 'all') {
        // Gọi API /department/stats với departmentId
        const statsResponse = await fetch(`http://localhost:8080/department/stats?departmentId=${key}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const statsData = await statsResponse.json();
  
        if (statsData.status === 200) {
          setDepartmentDetails(prev => ({
            ...prev,
            [key]: {
              employees: statsData.data.totalUsers,
              activeProjects: statsData.data.totalProjectsProcess,
              completedProjects: statsData.data.totalProjectsComplete,
              projectProgress: statsData.data.monthlyProgress || [],
              employeeList: statsData.data.userStatsList.map(user => ({
                id: user.name,
                name: user.name,
                role: user.position === 'NULL' ? 'Chưa phân công' : user.position,
                tasks: user.totalTasks,
                completed: user.tasksCompleted,
                performanceData: user.monthlyPerformance
                  ? user.monthlyPerformance.map(data => ({
                      month: data.month,
                      completed: data.completed,
                      total: data.total,
                    }))
                  : [{ month: 'Current', completed: user.tasksCompleted, total: user.totalTasks }],
              })),
            },
          }));
        }
      } else {
        // Gọi API /department/stats cho tất cả phòng ban
        const statsResponse = await fetch('http://localhost:8080/department/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const statsData = await statsResponse.json();
  
        if (statsData.status === 200) {
          setStats({
            totalDepartments: statsData.data.totalDepartments,
            totalUsers: statsData.data.totalUsers,
            totalProjects: statsData.data.totalProjects,
            activeProjects: statsData.data.totalProjectsProcess,
            completedProjects: statsData.data.totalProjectsComplete,
          });
          setProjectProgressData(statsData.data.monthlyProgress);
          // Cập nhật employeeList cho tổng quát (nếu cần)
          setDepartmentDetails(prev => ({
            ...prev,
            1: {
              ...prev[1],
              employeeList: statsData.data.userStatsList.map(user => ({
                id: user.name,
                name: user.name,
                role: user.position === 'NULL' ? 'Chưa phân công' : user.position,
                tasks: user.totalTasks,
                completed: user.tasksCompleted,
                performanceData: user.monthlyPerformance
                  ? user.monthlyPerformance.map(data => ({
                      month: data.month,
                      completed: data.completed,
                      total: data.total,
                    }))
                  : [{ month: 'Current', completed: user.tasksCompleted, total: user.totalTasks }],
              })),
            },
          }));
        }
      }
  
      // Lấy danh sách phòng ban
      const response = await departmentService.getAll();
      if (response.status === 200) {
        setDepartments(response.data);
      }
    } catch (err) {
      console.error('Error fetching department data:', err);
      setSnackbar({
        open: true,
        message: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeClick = (employee) => {
    try {
      setSelectedEmployee(employee);
      setShowEmployeeModal(true);
      setSnackbar({
        open: true,
        message: 'Đã tải thông tin nhân viên',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin nhân viên',
        severity: 'error'
      });
    }
  };

  const employeeColumns = [
    { 
      title: 'Tên nhân viên', 
      dataIndex: 'name', 
      key: 'name',
      render: (text, record) => (
        <a onClick={() => handleEmployeeClick(record)} style={{ color: '#1890ff' }}>
          {text}
        </a>
      )
    },
    { title: 'Chức vụ', dataIndex: 'role', key: 'role' },
    {
      title: 'Hiệu suất',
      key: 'performance',
      render: (_, record) => (
        <Progress
          percent={Math.round((record.completed / record.tasks) * 100)}
          size="small"
          status={((record.completed / record.tasks) * 100) >= 80 ? 'success' : 'active'}
        />
      )
    },
    { title: 'Công việc đã hoàn thành', dataIndex: 'completed', key: 'completed' },
    { title: 'Tổng số công việc', dataIndex: 'tasks', key: 'tasks' },
  ];

  const renderEmployeePerformanceModal = () => {
    if (!selectedEmployee) return null;

    const performanceData = selectedEmployee.performanceData.map(data => ({
      month: data.month,
      'Hoàn thành': (data.completed / data.total) * 100
    }));

    return (
      <Modal
        title={`Hiệu suất công việc - ${selectedEmployee.name}`}
        open={showEmployeeModal}
        onCancel={() => setShowEmployeeModal(false)}
        width={800}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Statistic
                title="Hiệu suất trung bình"
                value={Math.round((selectedEmployee.completed / selectedEmployee.tasks) * 100)}
                suffix="%"
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Biểu đồ hiệu suất theo tháng">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Hoàn thành" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  };

  const renderContent = () => {
    if (selectedDepartment === 'all') {
      return (
        <>
          <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic 
                  title={<span style={{ fontSize: '16px', color: '#666' }}>Tổng số phòng ban</span>}
                  value={stats.totalDepartments}
                  prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic 
                  title={<span style={{ fontSize: '16px', color: '#666' }}>Tổng nhân viên</span>}
                  value={stats.totalUsers}
                  prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic 
                  title={<span style={{ fontSize: '16px', color: '#666' }}>Tổng số dự án</span>}
                  value={stats.totalProjects}
                  prefix={<ProjectOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={12}>
              <Card
                title={<span style={{ color: '#666', fontSize: '16px' }}>Trạng thái dự án</span>}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title={<span style={{ fontSize: '14px', color: '#666' }}>Đang thực hiện</span>}
                      value={stats.activeProjects}
                      prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                      valueStyle={{ color: '#faad14', fontSize: '20px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title={<span style={{ fontSize: '14px', color: '#666' }}>Đã hoàn thành</span>}
                      value={stats.completedProjects}
                      prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                    />
                  </Col>
                </Row>
                <div style={{ height: '250px', marginTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title={<span style={{ color: '#666', fontSize: '16px' }}>Tiến độ dự án theo tháng</span>}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="#1890ff"
                        strokeWidth={2}
                        dot={{ fill: '#1890ff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      );
    }

    const department = departmentDetails[selectedDepartment];
    if (!department) {
      return (
        <Empty
          description="Không có dữ liệu cho phòng ban này"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title={<span style={{ fontSize: '16px', color: '#666' }}>Tổng nhân viên</span>}
                value={department.employees}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title={<span style={{ fontSize: '16px', color: '#666' }}>Dự án đang thực hiện</span>}
                value={department.activeProjects}
                prefix={<ProjectOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title={<span style={{ fontSize: '16px', color: '#666' }}>Dự án đã hoàn thành</span>}
                value={department.completedProjects}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card
              title={<span style={{ color: '#666', fontSize: '16px' }}>Tiến độ dự án theo tháng</span>}
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={department.projectProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#1890ff"
                      strokeWidth={2}
                      dot={{ fill: '#1890ff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card
              title={<span style={{ color: '#666', fontSize: '16px' }}>Danh sách nhân viên</span>}
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Table
                columns={employeeColumns}
                dataSource={department.employeeList}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    );
  };

  return (
    <div className="dashboard-container" style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}>
          Thống kê phòng ban
        </h2>
        <Select
          style={{ width: 200 }}
          value={selectedDepartment}
          onChange={handleDepartmentSelect}
          placeholder="Chọn phòng ban"
          loading={loading}
        >
          <Select.Option value="all" key="all">
            <TeamOutlined /> Tất cả phòng ban
          </Select.Option>
          {departments.map(dept => (
            <Select.Option key={dept.id} value={dept.id}>
              <UserOutlined /> {dept.name}
            </Select.Option>
          ))}
        </Select>
      </Row>

      {renderContent()}
      {renderEmployeePerformanceModal()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default DepartmentStats;