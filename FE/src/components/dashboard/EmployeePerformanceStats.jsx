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
  Pagination,
  Skeleton,
  Alert,
  Fade,
  useTheme,
  Chip,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
  const theme = useTheme();
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

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleValueChange = (event) => {
    try {
      setSelectedValue(event.target.value);
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Đã cập nhật thông tin dự án',
          severity: 'success'
        });
      }, 500);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật thông tin dự án',
        severity: 'error'
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Lọc nhân viên theo dự án
  const filteredEmployees = useMemo(() => {
    return mockEmployeeStats.filter(emp => {
      if (!selectedValue) return true;
      return emp.project === mockProjects.find(p => p.id === selectedValue)?.name;
    });
  }, [selectedValue]);

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
                <MenuItem value="">Tất cả</MenuItem>
                {mockProjects.map((project) => (
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

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
                  Số lượng công việc theo nhân viên
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} animation="wave" />
                ) : (
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
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
                  Tỷ lệ hoàn thành công việc
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} animation="wave" />
                ) : (
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
                )}
              </Paper>
            </Grid>
          </Grid>

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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                            {selectedEmployee.completionRate}%
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
                        <BarChart data={[selectedEmployee]}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="inProgress" name="Đang thực hiện" fill={theme.palette.warning.main} />
                          <Bar dataKey="completed" name="Đã hoàn thành" fill={theme.palette.success.main} />
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