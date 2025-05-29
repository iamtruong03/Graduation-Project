import React, { useState, useEffect } from 'react';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
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
  Alert,
  CircularProgress,
  Badge,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { CheckCircle as ApproveIcon, Assignment as AssignmentIcon, Add as AddIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import taskService from '../../services/taskService';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [taskType, setTaskType] = useState('all');
  const [taskStatus, setTaskStatus] = useState('all');
  const [taskPriority, setTaskPriority] = useState('all');
  const [status, setStatus] = useState('all');
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
  const rowsPerPage = 10;

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.searchTasks({ search: searchName }, page - 1, rowsPerPage);
      setTasks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getPendingApprovalTasks({
        page: pendingPage,
        size: rowsPerPage,
        search: searchName
      });
      if (response.status === 200) {
        const { content, totalPages, totalElements } = response.data;
        setPendingTasks(content);
        setPendingTotalPages(totalPages);
        setPendingCount(totalElements);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (err) {
      console.error('Error fetching pending tasks:', err);
      setError('Không thể tải danh sách công việc chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await taskService.getPendingApprovalTasks({
        page: 0,
        size: 1
      });
      if (response.status === 200) {
        setPendingCount(response.data.totalElements);
      }
    } catch (err) {
      console.error('Error fetching pending count:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchPendingCount();
    // eslint-disable-next-line
  }, [page, searchName]);

  useEffect(() => {
    if (openPendingDialog) {
      fetchPendingTasks();
    }
  }, [openPendingDialog, pendingPage]);

  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    // Thực hiện xóa công việc
    const newData = tasks.filter(task => task.id !== deleteId);
    // Cập nhật state hoặc gọi API xóa
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleApprove = (id) => {
    setApproveId(id);
    setOpenApproveDialog(true);
  };

  const handleConfirmApprove = async () => {
    try {
      setLoading(true);
      const response = await taskService.approveTask(approveId, localStorage.getItem('userId'));
      if (response.success) {
        await fetchTasks();
        await fetchPendingTasks();
        await fetchPendingCount();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Không thể phê duyệt công việc');
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
      await taskService.exportTasks();
      setError(null);
    } catch (err) {
      setError('Không thể xuất dữ liệu công việc');
      console.error('Error exporting tasks:', err);
    } finally {
      setLoading(false);
    }
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
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
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
            <TextField
              size="small"
              placeholder="Tên, mã công việc"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                sx: { backgroundColor: '#fff' }
              }}
              sx={{ 
                minWidth: 300,
                flex: 1
              }}
            />
          
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 200,
                backgroundColor: '#fff'
              }}
            >
              <InputLabel>Loại công việc</InputLabel>
              <Select
                value={taskType}
                label="Loại công việc"
                onChange={(e) => setTaskType(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="department">Công việc phòng ban</MenuItem>
                <MenuItem value="project">Công việc dự án</MenuItem>
              </Select>
            </FormControl>
      
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 200,
                backgroundColor: '#fff'
              }}
            >
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={taskStatus}
                label="Trạng thái"
                onChange={(e) => setTaskStatus(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="not_started">Chưa bắt đầu</MenuItem>
                <MenuItem value="in_progress">Đang thực hiện</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
              </Select>
            </FormControl>
      
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 200,
                backgroundColor: '#fff'
              }}
            >
              <InputLabel>Mức độ ưu tiên</InputLabel>
              <Select
                value={taskPriority}
                label="Mức độ ưu tiên"
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="high">Cao</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="low">Thấp</MenuItem>
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
                minWidth: 140
              }}
            >
              XUẤT DỮ LIỆU
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
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Dự án/Phòng ban</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mức độ ưu tiên</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Người phụ trách</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Người thực hiện</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày cập nhật</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#1976d2' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
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
                      <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
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
                          {row.taskType === 'project' ? 'Công việc dự án' : 'Công việc phòng ban'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.taskType === 'project' ? row.projectName || row.project : row.departmentName || row.department}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.priorityName || row.priority}
                          size="small"
                          sx={{
                            backgroundColor: getPriorityColor(row.priorityName || row.priority),
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.managerName || row.manager}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.assigneeName || row.assignee}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.updatedAt}
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
                          
                          {row.status === 'pending' && (
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

        {/* Delete Dialog */}
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

        {/* Approve Dialog */}
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

        {/* Pending Tasks Dialog */}
        <Dialog
          open={openPendingDialog}
          onClose={handleClosePendingDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Danh sách công việc chờ duyệt ({pendingCount})
          </DialogTitle>
          <DialogContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã công việc</TableCell>
                        <TableCell>Tên công việc</TableCell>
                        <TableCell>Loại công việc</TableCell>
                        <TableCell>Dự án/Phòng ban</TableCell>
                        <TableCell>Mức độ ưu tiên</TableCell>
                        <TableCell>Người phụ trách</TableCell>
                        <TableCell>Người thực hiện</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.code}</TableCell>
                          <TableCell>{task.name}</TableCell>
                          <TableCell>{task.taskType === 'project' ? 'Công việc dự án' : 'Công việc phòng ban'}</TableCell>
                          <TableCell>{task.taskType === 'project' ? task.projectName || task.project : task.departmentName || task.department}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                backgroundColor: getPriorityColor(task.priorityName || task.priority),
                                color: '#fff',
                                py: 0.5,
                                px: 1.5,
                                borderRadius: 1,
                                display: 'inline-block',
                                fontSize: '0.875rem'
                              }}
                            >
                              {task.priorityName || task.priority}
                            </Box>
                          </TableCell>
                          <TableCell>{task.managerName || task.manager}</TableCell>
                          <TableCell>{task.assigneeName || task.assignee}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/task/detail/${task.id}`}
                              sx={{ mr: 1 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(task.id)}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Pagination
                    count={pendingTotalPages}
                    page={pendingPage + 1}
                    onChange={handlePendingPageChange}
                    color="primary"
                    size="small"
                  />
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePendingDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

// Helper function để xác định màu sắc mức độ ưu tiên
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Cao':
    case 'high':
      return '#d32f2f'; // Red
    case 'Trung bình':
    case 'medium':
      return '#ed6c02'; // Orange
    case 'Thấp':
    case 'low':
      return '#2e7d32'; // Green
    default:
      return '#757575'; // Grey
  }
};

export default TaskList;