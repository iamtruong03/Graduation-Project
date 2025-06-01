import React, { useState, useEffect, useRef } from 'react';
import { FileDownload as FileDownloadIcon, Search as SearchIcon, Edit as EditIcon, Visibility as VisibilityIcon, Delete as DeleteIcon, CheckCircle as ApproveIcon, Assignment as AssignmentIcon, Add as AddIcon, Cancel as CancelIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Switch,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert as MuiAlert,
  Snackbar,
  CircularProgress,
  Badge,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import taskService from '../../services/taskService';
import staffService from '../../services/staffService';
import departmentService from '../../services/departmentService';
import projectService from '../../services/projectService';
import riskService from '../../services/riskService';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [openPendingDialog, setOpenPendingDialog] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [approveId, setApproveId] = useState(null);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const rowsPerPage = 10;
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [users, setUsers] = useState({});
  const [departments, setDepartments] = useState({});
  const [projects, setProjects] = useState({});
  const projectsRef = useRef({});
  const [projectNames, setProjectNames] = useState({});
  const [risks, setRisks] = useState({});
  const risksRef = useRef({});

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = {
        search: searchName,
        taskTypeId: selectedTaskType || undefined,
        assigneeId: selectedAssignee || undefined
      };

      const response = await taskService.searchTasks(filter, page > 0 ? page - 1 : 0, rowsPerPage);
      setTasks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Không thể tải danh sách công việc');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getPendingApprovalTasks({
        search: searchName,
        page: pendingPage,
        size: rowsPerPage
      });
      if (response.data) {
        setPendingTasks(response.data.content);
        setPendingTotalPages(response.data.totalPages);
        setPendingCount(response.data.totalElements);
      }
    } catch (err) {
      setError('Không thể tải danh sách công việc chờ duyệt');
      console.error('Error fetching pending tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await taskService.getPendingApprovalTasks({
        search: searchName,
        page: pendingPage,
        size: rowsPerPage
      });
      if (response.status === 200) {
        setPendingCount(response.data.totalElements);
      }
    } catch (err) {
      console.error('Error fetching pending count:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await staffService.getListUser();
      if (response.data) {
        const userMap = {};
        response.data.forEach(user => {
          userMap[user.id] = user.name;
        });
        setUsers(userMap);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      if (response.data) {
        const departmentMap = {};
        response.data.forEach(department => {
          departmentMap[department.id] = department.name;
        });
        setDepartments(departmentMap);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getProjectList();
      console.log('Raw API Response:', response);
      
      if (response && response.data) {
        const projectMap = {};
        response.data.forEach(project => {
          if (project && project.id) {
            projectMap[project.id] = {
              name: project.name,
              code: project.code,
              status: project.status,
              state: project.state
            };
            console.log(`Mapping project: id=${project.id}, name=${project.name}`);
          }
        });
        console.log('Final Project Map:', projectMap);
        projectsRef.current = projectMap;
        setProjects(projectMap);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchRisks = async () => {
    try {
      const response = await riskService.getAllRisks();
      if (response && response.data) {
        const riskMap = {};
        response.data.forEach(risk => {
          if (risk && risk.id) {
            riskMap[risk.id] = {
              name: risk.name,
              code: risk.code
            };
          }
        });
        risksRef.current = riskMap;
        setRisks(riskMap);
      }
    } catch (err) {
      console.error('Error fetching risks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchPendingCount();
    fetchUsers();
    fetchDepartments();
    fetchProjects();
    fetchRisks();
    // eslint-disable-next-line
  }, [page, searchName, selectedTaskType, selectedAssignee]);

  useEffect(() => {
    if (openPendingDialog) {
      fetchPendingTasks();
    }
  }, [openPendingDialog, pendingPage]);

  useEffect(() => {
    console.log('Projects state updated:', projects);
  }, [projects]);

  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await taskService.changeStatus(deleteId);
      await fetchTasks();
      setOpenDialog(false);
      setDeleteId(null);
      setSnackbar({
        open: true,
        message: 'Xóa công việc thành công',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể xóa công việc',
        severity: 'error'
      });
      console.error('Error cancelling task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage > 0 ? newPage : 1);
  };

  const handleApprove = (id) => {
    setApproveId(id);
    setOpenApproveDialog(true);
  };

  const handleConfirmApprove = async () => {
    try {
      setLoading(true);
      const response = await taskService.approveTask(approveId);
      if (response) {
        await fetchTasks();
        await fetchPendingTasks();
        await fetchPendingCount();
        setSnackbar({
          open: true,
          message: 'Phê duyệt công việc thành công!',
          severity: 'success'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể phê duyệt công việc',
        severity: 'error'
      });
      console.error('Error approving task:', err);
    } finally {
      setLoading(false);
      setOpenApproveDialog(false);
      setApproveId(null);
    }
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setApproveId(null);
  };

  const handleClosePendingDialog = () => {
    setOpenPendingDialog(false);
  };

  const handlePendingPageChange = (event, newPage) => {
    setPendingPage(newPage - 1);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const filter = {
        search: searchName
      };

      const response = await taskService.exportTasks(filter);
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers?.['content-disposition'];
      let fileName = 'DanhSachCongViec.xlsx';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch) {
          fileName = decodeURIComponent(fileNameMatch[1]);
        }
      }
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSnackbar({
        open: true,
        message: 'Xuất dữ liệu thành công',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể xuất dữ liệu công việc',
        severity: 'error'
      });
      console.error('Error exporting tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleReject = (id) => {
    setRejectId(id);
    setOpenRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    try {
      setLoading(true);
      const response = await taskService.rejectTask(rejectId, rejectReason);
      if (response) {
        await fetchTasks();
        await fetchPendingTasks();
        await fetchPendingCount();
        setSnackbar({
          open: true,
          message: 'Từ chối công việc thành công!',
          severity: 'success'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể từ chối công việc',
        severity: 'error'
      });
      console.error('Error rejecting task:', err);
    } finally {
      setLoading(false);
      setOpenRejectDialog(false);
      setRejectId(null);
      setRejectReason('');
    }
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectId(null);
    setRejectReason('');
  };

  const getAssigneeName = (assigneeId) => {
    return users[assigneeId] || assigneeId || 'Không xác định';
  };

  const getDepartmentName = (departmentId) => {
    return departments[departmentId] || departmentId || 'Không xác định';
  };

  const getProjectName = (projectId, fallbackName) => {
    if (!projectId) return 'Không xác định';
    if (projectNames[projectId]) return projectNames[projectId];
    if (fallbackName) return fallbackName;

    projectService.getProjectById(projectId).then(res => {
      if (res?.data?.name) {
        setProjectNames(prev => ({ ...prev, [projectId]: res.data.name }));
      }
    });
    return projectId;
  };

  const getRiskName = (riskId) => {
    if (!riskId) return 'Không xác định';
    if (risks[riskId]) return risks[riskId].name;
    
    // Nếu chưa có trong cache, gọi API để lấy thông tin
    riskService.getRiskById(riskId).then(res => {
      if (res?.data?.name) {
        setRisks(prev => ({
          ...prev,
          [riskId]: {
            name: res.data.name,
            code: res.data.code
          }
        }));
      }
    });
    return riskId;
  };

  const handleTaskTypeChange = (event) => {
    setSelectedTaskType(event.target.value);
    setPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  const handleAssigneeChange = (event) => {
    setSelectedAssignee(event.target.value);
    setPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: '#fff' }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            mb: 4,
            pb: 2,
            borderBottom: '2px solid #1976d2'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              flex: 1
            }}
          >
            DANH SÁCH CÔNG VIỆC
          </Typography>

          <Badge badgeContent={pendingCount} color="error">
            <Button
              variant="contained"
              onClick={() => setOpenPendingDialog(true)}
              startIcon={<AssignmentIcon />}
              sx={{
                backgroundColor: '#ff9800',
                '&:hover': {
                  backgroundColor: '#f57c00'
                },
                mr: 1
              }}
            >
              CÔNG VIỆC CHỜ DUYỆT
            </Button>
          </Badge>

          <Button
            variant="contained"
            component={Link}
            to="/task/create"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#1b5e20'
              }
            }}
          >
            TẠO CÔNG VIỆC MỚI
          </Button>
        </Stack>

        {error && (
          <MuiAlert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </MuiAlert>
        )}

        <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                minWidth: 300,
                backgroundColor: '#fff',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
            }}
          >
            <TextField
                fullWidth
              size="small"
                placeholder="Tìm kiếm theo tên, mã công việc..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              InputProps={{
                  startAdornment: (
                    <SearchIcon 
                      sx={{ 
                        color: '#1976d2',
                        mr: 1,
                        fontSize: '1.25rem'
                      }} 
                    />
                  ),
                  endAdornment: searchName && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchName('')}
              sx={{
                        color: '#757575',
                        '&:hover': {
                          color: '#1976d2',
                          backgroundColor: 'rgba(25, 118, 210, 0.04)'
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: '1px'
                    },
                    '& input': {
                      py: 1.5,
                      fontSize: '0.875rem'
                    }
                  }
              }}
            />
              {searchName && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    left: 0,
                    color: '#666',
                    fontSize: '0.75rem'
                  }}
                >
                  Đang tìm kiếm: {searchName}
                </Typography>
              )}
            </Box>

            <FormControl
              size="small"
              sx={{
                minWidth: 200,
                backgroundColor: '#fff',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <InputLabel>Loại công việc</InputLabel>
              <Select
                value={selectedTaskType}
                onChange={handleTaskTypeChange}
                label="Loại công việc"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: '1px'
                  }
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="1">Công việc rủi ro</MenuItem>
                <MenuItem value="2">Công việc dự án</MenuItem>
                <MenuItem value="3">Công việc phòng ban</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 200,
                backgroundColor: '#fff',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <InputLabel>Người thực hiện</InputLabel>
              <Select
                value={selectedAssignee}
                onChange={handleAssigneeChange}
                label="Người thực hiện"
              sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: '1px'
                  }
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {Object.entries(users).map(([id, name]) => (
                  <MenuItem key={id} value={id}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={handleExport}
              startIcon={<FileDownloadIcon />}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                },
                minWidth: 140,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Xuất dữ liệu
            </Button>
          </Stack>
        </Paper>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>STT</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mã công việc</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Tên công việc</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Loại công việc</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Phạm vi thực hiện</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mức độ ưu tiên</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Người thực hiện</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày bắt đầu</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày kết thúc</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày hoàn thành thực tế</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#1976d2' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell>{((page - 1) * rowsPerPage) + index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#1976d2',
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                        component={Link}
                        to={`/task/detail/${row.id}`}
                      >
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getTaskTypeName(row.taskTypeId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.taskTypeId === 1 ? getRiskName(row.riskId) :
                         row.taskTypeId === 2 ? getProjectName(row.projectId, row.projectName) :
                         row.taskTypeId === 3 ? getDepartmentName(row.departmentId) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusName(row.state)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(row.state),
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityName(row.priorityId)}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(row.priorityId),
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getAssigneeName(row.assigneeId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(row.startDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(row.dueDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.completedDate ? `${formatDate(row.completedDate)}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/task/detail/${row.id}`}
                          sx={{
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)'
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>

                        {row.state === 0 && (
                          <>
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(row.id)}
                            sx={{
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)'
                              }
                            }}
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleReject(row.id)}
                              sx={{
                                color: '#d32f2f',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                }
                              }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}

                        <IconButton
                          size="small"
                          onClick={() => handleDelete(row.id)}
                          sx={{
                            color: '#d32f2f',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.04)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{
          mt: 3,
          p: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" color="text.secondary">
            Tổng {tasks.length} công việc
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
        >
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc chắn muốn xóa công việc này không?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openApproveDialog}
          onClose={handleCloseApproveDialog}
        >
          <DialogTitle>Xác nhận phê duyệt</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc chắn muốn phê duyệt công việc này không?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseApproveDialog}>Hủy</Button>
            <Button onClick={handleConfirmApprove} color="success" autoFocus>
              Phê duyệt
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openRejectDialog}
          onClose={handleCloseRejectDialog}
        >
          <DialogTitle>Từ chối công việc</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Vui lòng nhập lý do từ chối công việc:
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Lý do từ chối"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRejectDialog}>Hủy</Button>
            <Button
              onClick={handleConfirmReject}
              color="error"
              disabled={!rejectReason.trim()}
            >
              Từ chối
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openPendingDialog}
          onClose={handleClosePendingDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1976d2',
                textAlign: 'center',
                mb: 2
              }}
            >
              DANH SÁCH CÔNG VIỆC CHỜ DUYỆT
            </Typography>
          </DialogTitle>
          <DialogContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mã công việc</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Tên công việc</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Loại công việc</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Dự án/Phòng ban</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Trạng thái</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mức độ ưu tiên</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Người thực hiện</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày bắt đầu</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày kết thúc</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: '#1976d2' }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingTasks.map((task) => (
                        <TableRow
                          key={task.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {task.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#1976d2',
                                cursor: 'pointer',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                              component={Link}
                              to={`/task/detail/${task.id}`}
                            >
                              {task.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getTaskTypeName(task.taskTypeId)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {task.taskTypeId === 1 ? (task.riskName || task.riskId || 'N/A') :
                               task.taskTypeId === 2 ? getProjectName(task.projectId, task.projectName) :
                               task.taskTypeId === 3 ? getDepartmentName(task.departmentId) : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusName(task.state)}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(task.state),
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getPriorityName(task.priorityId)}
                              size="small"
                              sx={{
                                backgroundColor: getPriorityColor(task.priorityId),
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {task.assigneeName || getAssigneeName(task.assigneeId)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(task.startDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(task.dueDate)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/task/detail/${task.id}`}
                                sx={{
                                  color: '#1976d2',
                                  '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                  }
                                }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(task.id)}
                                sx={{
                                  color: '#2e7d32',
                                  '&:hover': {
                                    backgroundColor: 'rgba(46, 125, 50, 0.04)'
                                  }
                                }}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleReject(task.id)}
                                sx={{
                                  color: '#d32f2f',
                                  '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                  }
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Tổng {pendingTasks.length} công việc
                  </Typography>
                  <Pagination
                    count={pendingTotalPages}
                    page={pendingPage + 1}
                    onChange={handlePendingPageChange}
                    color="primary"
                    size="medium"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePendingDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

const getPriorityColor = (priorityId) => {
  switch (priorityId) {
    case 3:
      return '#d32f2f'; // Red - Cao
    case 2:
      return '#ed6c02'; // Orange - Trung bình
    case 1:
      return '#2e7d32'; // Green - Thấp
    default:
      return '#757575'; // Grey - Không xác định
  }
};

const getPriorityName = (priorityId) => {
  switch (priorityId) {
    case 3:
      return 'Cao';
    case 2:
      return 'Trung bình';
    case 1:
      return 'Thấp';
    default:
      return 'Không xác định';
  }
};

const getTaskTypeName = (taskTypeId) => {
  switch (taskTypeId) {
    case 1:
      return 'Công việc rủi ro';
    case 2:
      return 'Công việc dự án';
    case 3:
      return 'Công việc phòng ban';
    default:
      return 'Không xác định';
  }
};

const getStatusName = (state) => {
  switch (state) {
    case 0:
      return 'Chờ duyệt';
    case 1:
      return 'Từ chối';
    case 2:
      return 'Đang thực hiện';
    case 3:
      return 'Hoàn thành';
    case 4:
      return 'Quá hạn';
    case 5:
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getStatusColor = (state) => {
  switch (state) {
    case 0:
      return '#ff9800'; // Chờ duyệt - Cam
    case 1:
      return '#d32f2f'; // Từ chối - Đỏ
    case 2:
      return '#1976d2'; // Đang thực hiện - Xanh dương
    case 3:
      return '#2e7d32'; // Hoàn thành - Xanh lá
    case 4:
      return '#ed6c02'; // Quá hạn - Cam đậm
    case 5:
      return '#757575'; // Đã hủy - Xám
    default:
      return '#757575'; // Không xác định - Xám
  }
};

export default TaskList;