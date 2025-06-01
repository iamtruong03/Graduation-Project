import React, { useState, useMemo, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Pagination,
  Skeleton,
  Alert,
  Fade,
  useTheme,
  Chip,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
  Card,
  CardContent
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TaskIcon from '@mui/icons-material/Task';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';

import projectService from '../../services/projectService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EmployeePerformanceStats = () => {
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [employeeStats, setEmployeeStats] = useState([]);
  const [projectStats, setProjectStats] = useState(null);

  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAllProjects();
        if (response.status === 200) {
          setProjects(response.data);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setSnackbar({
          open: true,
          message: 'Không thể tải danh sách dự án',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleValueChange = async (event) => {
    const projectId = event.target.value;
    setSelectedValue(projectId);
    
    if (!projectId) {
      setEmployeeStats([]);
      setProjectStats(null);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/projects/stats?projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('API error');
      
      const result = await response.json();
      
      if (result.status === 200 && result.data) {
        const data = result.data;
        
        // Map employee statistics
        setEmployeeStats(
          data.userProjectStatsDTOS.map((emp, index) => ({
            id: index + 1,
            name: emp.nameUser,
            department: emp.departmentName || 'Chưa phân bổ',
            project: emp.projectName,
            inProgress: emp.taskProcess,
            completed: emp.taskComplete,
            totalTasks: emp.totalTask,
            completionRate: emp.completionRate,
            projectCompletionRate: emp.projectCompletionRate
          }))
        );
        
        // Map project statistics
        setProjectStats({
          totalProjectTask: data.totalProjectTask,
          projectTaskProcess: data.projectTaskProcess,
          projectTaskComplete: data.projectTaskComplete,
          projectRate: data.projectRate
        });
        
        setSnackbar({ 
          open: true, 
          message: 'Đã cập nhật thông tin dự án', 
          severity: 'success' 
        });
      }
    } catch (err) {
      console.error('Error fetching project stats:', err);
      setSnackbar({ 
        open: true, 
        message: 'Không thể cập nhật thông tin dự án', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Use employeeStats for filtered data
  const filteredEmployees = employeeStats;

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

  const handleEmployeeClick = (employee) => {
    try {
      setSelectedEmployee(employee);
      setOpenDetailDialog(true);
      setSnackbar({
        open: true,
        message: 'Đã tải thông tin chi tiết nhân viên',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin chi tiết nhân viên',
        severity: 'error'
      });
    }
  };

  // Project Statistics Cards Component
  const ProjectStatsCards = () => {
    if (!projectStats) return null;

    const statsData = [
      {
        title: 'Tổng công việc',
        value: projectStats.totalProjectTask,
        icon: <TaskIcon />,
        color: theme.palette.info.main,
        bgColor: theme.palette.info.light
      },
      {
        title: 'Đang thực hiện',
        value: projectStats.projectTaskProcess,
        icon: <PlayCircleOutlineIcon />,
        color: theme.palette.warning.main,
        bgColor: theme.palette.warning.light
      },
      {
        title: 'Đã hoàn thành',
        value: projectStats.projectTaskComplete,
        icon: <CheckCircleIcon />,
        color: theme.palette.success.main,
        bgColor: theme.palette.success.light
      },
      {
        title: 'Tiến độ dự án',
        value: `${Math.round(projectStats.projectRate)}%`,
        icon: <PercentIcon />,
        color: theme.palette.primary.main,
        bgColor: theme.palette.primary.light
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                background: `linear-gradient(135deg, ${stat.bgColor}20 0%, ${stat.color}10 100%)`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: '50%', 
                      backgroundColor: stat.color,
                      color: '#fff'
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon fontSize="large" />}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh'
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            mb: 4 
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                pb: 1,
                mb: { xs: 2, md: 0 }
              }}
            >
              Thống kê hiệu suất nhân viên
            </Typography>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Dự án</InputLabel>
              <Select
                value={selectedValue}
                label="Dự án"
                onChange={handleValueChange}
                disabled={loading}
              >
                <MenuItem value="">Chọn dự án</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1, fontSize: 20 }} />
                      {project.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Project Statistics Cards */}
          {selectedValue && <ProjectStatsCards />}

          {/* Employee Table */}
          {selectedValue && (
            <>
              <TableContainer 
                component={Paper} 
                sx={{ 
                  mb: 4,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên nhân viên</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Phòng ban</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Dự án</TableCell>
                      <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Tổng công việc</TableCell>
                      <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Đang thực hiện</TableCell>
                      <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Đã hoàn thành</TableCell>
                      <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Tỷ lệ hoàn thành</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tiến độ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from(new Array(rowsPerPage)).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from(new Array(8)).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton animation="wave" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedEmployees.map((employee) => (
                      <TableRow 
                        key={employee.id}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                        onClick={() => handleEmployeeClick(employee)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography
                              component="span"
                              sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {employee.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<WorkIcon />}
                            label={employee.project}
                            size="small"
                            sx={{ backgroundColor: theme.palette.primary.light, color: '#fff' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={employee.totalTasks}
                            size="small"
                            color="info"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={employee.inProgress}
                            size="small"
                            color="warning"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={employee.completed}
                            size="small"
                            color="success"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={`${employee.completionRate}% hoàn thành`}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CircularProgress
                                variant="determinate"
                                value={employee.completionRate}
                                size={30}
                                thickness={4}
                                sx={{
                                  color: employee.completionRate >= 100 ? theme.palette.success.main :
                                    employee.completionRate >= 50 ? theme.palette.primary.main :
                                    theme.palette.error.main
                                }}
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {`${Math.round(employee.completionRate)}%`}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={employee.completionRate}
                                sx={{
                                  height: 8,
                                  borderRadius: 5,
                                  backgroundColor: theme.palette.grey[200],
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: employee.completionRate >= 100 ? theme.palette.success.main :
                                      employee.completionRate >= 50 ? theme.palette.primary.main :
                                      theme.palette.error.main,
                                    borderRadius: 5
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {filteredEmployees.length > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3,
                  px: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
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
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}

              {/* Charts */}
              {filteredEmployees.length > 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                        <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
                        Số lượng công việc theo nhân viên
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="Đang thực hiện" fill={theme.palette.warning.main} />
                          <Bar dataKey="Đã hoàn thành" fill={theme.palette.success.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                        <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
                        Tỷ lệ hoàn thành công việc
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill={theme.palette.primary.main}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </>
          )}

          {/* No Data Message */}
          {!selectedValue && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <WorkIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chọn dự án để xem thống kê
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng chọn một dự án từ dropdown để hiển thị thống kê hiệu suất nhân viên
              </Typography>
            </Box>
          )}

          {/* Employee Detail Dialog */}
          <Dialog
            open={openDetailDialog}
            onClose={() => setOpenDetailDialog(false)}
            maxWidth="md"
            fullWidth
            TransitionComponent={Fade}
            PaperProps={{
              sx: {
                borderRadius: 2,
                bgcolor: theme.palette.background.paper
              }
            }}
          >
            <DialogTitle sx={{ 
              borderBottom: `1px solid ${theme.palette.divider}`,
              pb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Chi tiết hiệu suất nhân viên
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={() => setOpenDetailDialog(false)}
                  sx={{
                    color: theme.palette.grey[500]
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {selectedEmployee && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Thông tin cơ bản
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ '& > *': { mb: 1.5 } }}>
                        <Typography>
                          <strong>Tên nhân viên:</strong> {selectedEmployee.name}
                        </Typography>
                        <Typography>
                          <strong>Phòng ban:</strong> {selectedEmployee.department}
                        </Typography>
                        <Typography>
                          <strong>Dự án:</strong> {selectedEmployee.project}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Thống kê công việc
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ '& > *': { mb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`Tổng: ${selectedEmployee.totalTasks}`}
                            color="info"
                            size="small"
                          />
                          <Chip
                            label={`Đang thực hiện: ${selectedEmployee.inProgress}`}
                            color="warning"
                            size="small"
                          />
                          <Chip
                            label={`Đã hoàn thành: ${selectedEmployee.completed}`}
                            color="success"
                            size="small"
                          />
                        </Box>
                        <Typography>
                          <strong>Tỷ lệ hoàn thành:</strong>
                          <Box component="span" sx={{ ml: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={selectedEmployee.completionRate}
                              size={24}
                              thickness={4}
                              sx={{
                                color: selectedEmployee.completionRate >= 100 ? theme.palette.success.main :
                                  selectedEmployee.completionRate >= 50 ? theme.palette.primary.main :
                                  theme.palette.error.main,
                                mr: 1,
                                verticalAlign: 'middle'
                              }}
                            />
                            {Math.round(selectedEmployee.completionRate)}%
                          </Box>
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Biểu đồ hiệu suất cá nhân
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[{
                          name: selectedEmployee.name,
                          'Đang thực hiện': selectedEmployee.inProgress,
                          'Đã hoàn thành': selectedEmployee.completed
                        }]}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="Đang thực hiện" fill={theme.palette.warning.main} />
                          <Bar dataKey="Đã hoàn thành" fill={theme.palette.success.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </Dialog>
        </Paper>

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
      </Box>
    </Fade>
  );
};

export default EmployeePerformanceStats;