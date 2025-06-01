import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Select, Spin, Empty, Modal } from 'antd';
import { TeamOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, BarChartOutlined } from "@ant-design/icons";
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
  
  // Thêm các state bị thiếu
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  
  const [projectProgressData, setProjectProgressData] = useState([]);
  const [departmentDetails, setDepartmentDetails] = useState({});
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  // Fetch danh sách phòng ban và thống kê ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch danh sách phòng ban
        const departmentsResponse = await departmentService.getAll();
        if (departmentsResponse.status === 200) {
          setDepartments(departmentsResponse.data);
        }

        // Fetch thống kê tổng quan
        const statsResponse = await fetch('http://localhost:8080/department/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        const statsData = await statsResponse.json();
        
        if (statsData.status === 200) {
          // Mapping dữ liệu thống kê tổng quan
          setStats({
            totalDepartments: statsData.data.totalDepartments,
            totalUsers: statsData.data.totalUsers,
            totalProjects: statsData.data.totalProjects,
            activeProjects: statsData.data.totalProjectsProcess,
            completedProjects: statsData.data.totalProjectsComplete
          });

          // Mapping dữ liệu biểu đồ tiến độ
          setProjectProgressData(statsData.data.monthlyProgress.map(item => ({
            month: item.month,
            progress: item.progress
          })));

          // Mapping danh sách nhân viên
          const mappedEmployeeList = statsData.data.userStatsList.map(user => {
            const efficiency = user.totalTasks > 0 ? 
              Math.round((user.tasksCompleted / user.totalTasks) * 100) : 0;
            
            return {
              id: user.name,
              name: user.name,
              role: user.position === 'NULL' ? 'Chưa phân công' : user.position,
              tasks: user.totalTasks,
              completed: user.tasksCompleted,
              efficiency: user.efficiency || efficiency,
              performanceData: user.performanceData ? user.performanceData.map(data => ({
                month: data.month,
                completed: data.completed,
                total: data.total,
                efficiency: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
              })) : [{
                month: 'Hiện tại',
                completed: user.tasksCompleted,
                total: user.totalTasks,
                efficiency: efficiency
              }]
            };
          });

          // Khởi tạo dữ liệu cho view "all"
          setDepartmentDetails(prev => ({
            ...prev,
            'all': {
              employees: statsData.data.totalUsers,
              activeProjects: statsData.data.totalProjectsProcess,
              completedProjects: statsData.data.totalProjectsComplete,
              projectProgress: statsData.data.monthlyProgress,
              employeeList: mappedEmployeeList
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setSnackbar({
          open: true,
          message: 'Không thể tải dữ liệu khởi tạo. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

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
          // Mapping dữ liệu cho phòng ban cụ thể
          const departmentData = {
            employees: statsData.data.totalUsers,
            activeProjects: statsData.data.totalProjectsProcess,
            completedProjects: statsData.data.totalProjectsComplete,
            performance: 0, // Tính toán từ dữ liệu nhân viên
            projectProgress: statsData.data.monthlyProgress.map(item => ({
              month: item.month,
              progress: item.progress
            })),
            employeeList: statsData.data.userStatsList.map(user => {
              // Tính hiệu suất trung bình
              const efficiency = user.totalTasks > 0 ? 
                Math.round((user.tasksCompleted / user.totalTasks) * 100) : 0;
              
              return {
                id: user.name, // Sử dụng name làm ID vì API không trả về ID
                name: user.name,
                role: user.position === 'NULL' ? 'Chưa phân công' : user.position,
                tasks: user.totalTasks,
                completed: user.tasksCompleted,
                efficiency: efficiency,
                performanceData: user.performanceData ? user.performanceData.map(data => ({
                  month: data.month,
                  completed: data.completed,
                  total: data.total,
                  efficiency: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                })) : [{
                  month: 'Hiện tại',
                  completed: user.tasksCompleted,
                  total: user.totalTasks,
                  efficiency: efficiency
                }]
              };
            })
          };

          // Tính hiệu suất trung bình của phòng ban
          const totalTasks = departmentData.employeeList.reduce((sum, emp) => sum + emp.tasks, 0);
          const totalCompleted = departmentData.employeeList.reduce((sum, emp) => sum + emp.completed, 0);
          departmentData.performance = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

          setDepartmentDetails(prev => ({
            ...prev,
            [key]: departmentData
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
          // Mapping dữ liệu tổng quan
          setStats({
            totalDepartments: statsData.data.totalDepartments,
            totalUsers: statsData.data.totalUsers,
            totalProjects: statsData.data.totalProjects,
            activeProjects: statsData.data.totalProjectsProcess,
            completedProjects: statsData.data.totalProjectsComplete,
          });

          // Mapping dữ liệu biểu đồ tiến độ theo tháng
          setProjectProgressData(statsData.data.monthlyProgress.map(item => ({
            month: item.month,
            progress: item.progress
          })));

          // Mapping danh sách nhân viên tổng quát
          const allEmployeeList = statsData.data.userStatsList.map(user => {
            const efficiency = user.totalTasks > 0 ? 
              Math.round((user.tasksCompleted / user.totalTasks) * 100) : 0;
            
            return {
              id: user.name,
              name: user.name,
              role: user.position === 'NULL' ? 'Chưa phân công' : user.position,
              tasks: user.totalTasks,
              completed: user.tasksCompleted,
              efficiency: user.efficiency || efficiency,
              performanceData: user.performanceData ? user.performanceData.map(data => ({
                month: data.month,
                completed: data.completed,
                total: data.total,
                efficiency: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
              })) : [{
                month: 'Hiện tại',
                completed: user.tasksCompleted,
                total: user.totalTasks,
                efficiency: efficiency
              }]
            };
          });

          // Cập nhật dữ liệu cho view "all"
          setDepartmentDetails(prev => ({
            ...prev,
            'all': {
              employees: statsData.data.totalUsers,
              activeProjects: statsData.data.totalProjectsProcess,
              completedProjects: statsData.data.totalProjectsComplete,
              projectProgress: statsData.data.monthlyProgress,
              employeeList: allEmployeeList
            }
          }));
        }
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

  // Cấu hình cột cho bảng nhân viên
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
      render: (_, record) => {
        const percentage = record.tasks > 0 ? Math.round((record.completed / record.tasks) * 100) : 0;
        return (
          <Progress
            percent={percentage}
            size="small"
            status={percentage >= 80 ? 'success' : percentage >= 60 ? 'active' : 'exception'}
          />
        );
      }
    },
    { title: 'Công việc đã hoàn thành', dataIndex: 'completed', key: 'completed' },
    { title: 'Tổng số công việc', dataIndex: 'tasks', key: 'tasks' },
  ];

  // Dữ liệu cho biểu đồ trạng thái dự án
  const projectStatusData = [
    { name: 'Đang thực hiện', value: stats.activeProjects },
    { name: 'Đã hoàn thành', value: stats.completedProjects },
  ];

  const COLORS = ['#faad14', '#52c41a'];

  // Modal hiệu suất nhân viên
  const renderEmployeePerformanceModal = () => {
    if (!selectedEmployee) return null;

    // Chuẩn bị dữ liệu cho biểu đồ
    const performanceChartData = selectedEmployee.performanceData.map(data => ({
      month: data.month,
      'Hiệu suất (%)': data.efficiency || (data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0),
      'Hoàn thành': data.completed,
      'Tổng số': data.total
    }));

    const overallEfficiency = selectedEmployee.tasks > 0 ? 
      Math.round((selectedEmployee.completed / selectedEmployee.tasks) * 100) : 0;

    return (
      <Modal
        title={`Hiệu suất công việc - ${selectedEmployee.name}`}
        open={showEmployeeModal}
        onCancel={() => setShowEmployeeModal(false)}
        width={900}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Hiệu suất tổng thể"
                value={overallEfficiency}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ 
                  color: overallEfficiency >= 80 ? '#52c41a' : 
                         overallEfficiency >= 60 ? '#faad14' : '#ff4d4f' 
                }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Công việc hoàn thành"
                value={selectedEmployee.completed}
                suffix={`/ ${selectedEmployee.tasks}`}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Chức vụ"
                value={selectedEmployee.role}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Biểu đồ hiệu suất theo tháng">
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'Hiệu suất (%)' ? `${value}%` : value,
                        name
                      ]}
                    />
                    <Bar dataKey="Hiệu suất (%)" fill="#1890ff" />
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

          {/* Thêm bảng nhân viên cho view tất cả */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24}>
              <Card
                title={<span style={{ color: '#666', fontSize: '16px' }}>Danh sách nhân viên</span>}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <Table
                  columns={employeeColumns}
                  dataSource={departmentDetails['all']?.employeeList || []}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
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
                pagination={{ pageSize: 10 }}
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