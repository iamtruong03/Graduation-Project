import React, { useState, useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Pagination
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import CloseIcon from '@mui/icons-material/Close';

const mockDepartments = [
  { id: 1, name: 'Phòng kế toán' },
  { id: 2, name: 'Phòng hành chính' },
  { id: 3, name: 'Phòng kỹ thuật' },
];

const mockProjects = [
  { id: 1, name: 'Dự án A' },
  { id: 2, name: 'Dự án B' },
  { id: 3, name: 'Dự án C' },
];

const mockEmployeeStats = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    department: 'Phòng kế toán',
    project: 'Dự án A',
    inProgress: 3,
    completed: 5,
    completionRate: 62.5,
    deadline: '2024-03-15',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    department: 'Phòng kỹ thuật',
    project: 'Dự án A',
    inProgress: 2,
    completed: 8,
    completionRate: 80,
    deadline: '2024-03-20',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    department: 'Phòng hành chính',
    project: 'Dự án B',
    inProgress: 4,
    completed: 2,
    completionRate: 33.3,
    deadline: '2024-03-25',
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EmployeePerformanceStats = () => {
  const [viewMode, setViewMode] = useState('department');
  const [selectedValue, setSelectedValue] = useState('');
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      setSelectedValue('');
    }
  };

  const handleValueChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Lọc nhân viên theo mode hiện tại
  const filteredEmployees = useMemo(() => {
    return mockEmployeeStats.filter(emp => {
      if (!selectedValue) return true;
      
      if (viewMode === 'department') {
        return emp.department === mockDepartments.find(d => d.id === selectedValue)?.name;
      } else {
        return emp.project === mockProjects.find(p => p.id === selectedValue)?.name;
      }
    });
  }, [selectedValue, viewMode]);

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const barChartData = useMemo(() => {
    return filteredEmployees.map(employee => ({
      name: employee.name,
      'Đang thực hiện': employee.inProgress,
      'Đã hoàn thành': employee.completed,
    }));
  }, [filteredEmployees]);
  
  const pieChartData = useMemo(() => {
    return filteredEmployees.map(employee => ({
      name: employee.name,
      value: employee.completionRate,
    }));
  }, [filteredEmployees]);

  // Thêm dữ liệu thống kê theo thời gian
  const timelineData = [
    { month: 'T1', completed: 10, inProgress: 5 },
    { month: 'T2', completed: 15, inProgress: 8 },
    { month: 'T3', completed: 12, inProgress: 6 },
    { month: 'T4', completed: 20, inProgress: 4 },
  ];

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setOpenDetailDialog(true);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            color: '#1976d2',
            borderBottom: '2px solid #1976d2',
            pb: 1
          }}
        >
          THỐNG KÊ HIỆU SUẤT CÔNG VIỆC NHÂN VIÊN
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="Chế độ xem"
            >
              <ToggleButton value="department" aria-label="Theo phòng ban">
                Theo phòng ban
              </ToggleButton>
              <ToggleButton value="project" aria-label="Theo dự án">
                Theo dự án
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{viewMode === 'department' ? 'Phòng ban' : 'Dự án'}</InputLabel>
              <Select
                value={selectedValue}
                label={viewMode === 'department' ? 'Phòng ban' : 'Dự án'}
                onChange={handleValueChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {viewMode === 'department' 
                  ? mockDepartments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))
                  : mockProjects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))
                }
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên nhân viên</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Phòng ban</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Dự án</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Đang thực hiện</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Đã hoàn thành</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Tỷ lệ hoàn thành</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Deadline</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tiến độ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Typography
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'underline'
                        }
                      }}
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      {employee.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.project}</TableCell>
                  <TableCell align="center">{employee.inProgress}</TableCell>
                  <TableCell align="center">{employee.completed}</TableCell>
                  <TableCell align="center">{`${employee.completionRate}%`}</TableCell>
                  <TableCell>{new Date(employee.deadline).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={employee.completionRate}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: employee.completionRate >= 100 ? '#2e7d32' :
                                employee.completionRate >= 50 ? '#1976d2' : '#d32f2f'
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${Math.round(employee.completionRate)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          px: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            Tổng {filteredEmployees.length} bản ghi
          </Typography>
          <Pagination
            count={Math.ceil(filteredEmployees.length / rowsPerPage)}
            page={page + 1}
            onChange={(e, p) => handleChangePage(e, p - 1)}
            color="primary"
            size="small"
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Số lượng công việc theo nhân viên
              </Typography>
              <BarChart width={500} height={300} data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Đang thực hiện" fill="#8884d8" />
                <Bar dataKey="Đã hoàn thành" fill="#82ca9d" />
              </BarChart>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tỷ lệ hoàn thành công việc
              </Typography>
              <PieChart width={500} height={300}>
                <Pie
                  data={pieChartData}
                  cx={250}
                  cy={150}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Xu hướng công việc theo thời gian
              </Typography>
              <BarChart width={1100} height={300} data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Đã hoàn thành" fill="#82ca9d" />
                <Bar dataKey="inProgress" name="Đang thực hiện" fill="#8884d8" />
              </BarChart>
            </Paper>
          </Grid>
        </Grid>

        <Dialog
          open={openDetailDialog}
          onClose={() => setOpenDetailDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle>
            Chi tiết hiệu suất nhân viên
            <IconButton
              aria-label="close"
              onClick={() => setOpenDetailDialog(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedEmployee && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thông tin cơ bản
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Tên nhân viên:</strong> {selectedEmployee.name}</Typography>
                    <Typography><strong>Phòng ban:</strong> {selectedEmployee.department}</Typography>
                    <Typography><strong>Dự án:</strong> {selectedEmployee.project}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thống kê công việc
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Đang thực hiện:</strong> {selectedEmployee.inProgress} công việc</Typography>
                    <Typography><strong>Đã hoàn thành:</strong> {selectedEmployee.completed} công việc</Typography>
                    <Typography><strong>Tỷ lệ hoàn thành:</strong> {selectedEmployee.completionRate}%</Typography>
                    <Typography><strong>Deadline:</strong> {selectedEmployee.deadline}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Biểu đồ hiệu suất cá nhân
                  </Typography>
                  <BarChart width={500} height={300} data={[selectedEmployee]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inProgress" name="Đang thực hiện" fill="#8884d8" />
                    <Bar dataKey="completed" name="Đã hoàn thành" fill="#82ca9d" />
                  </BarChart>
                </Grid>
              </Grid>
            )}
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default EmployeePerformanceStats;