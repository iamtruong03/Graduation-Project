import React, { useState } from 'react';
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
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const mockData = [
  { id: 1, code: 'CV001', name: 'Phát triển tính năng mới', taskType: 'project', project: 'Dự án A', department: 'Phòng kỹ thuật', type: 'Phát triển', status: 'Đang thực hiện', priority: 'Cao', manager: 'Nguyễn Văn A', assignee: 'Trần Thị B', active: true, updatedAt: '20/07/2023' },
  { id: 2, code: 'CV002', name: 'Sửa lỗi giao diện', taskType: 'project', project: 'Dự án B', department: 'Phòng kỹ thuật', type: 'Bảo trì', status: 'Hoàn thành', priority: 'Trung bình', manager: 'Lê Văn C', assignee: 'Phạm Thị D', active: true, updatedAt: '19/07/2023' },
  { id: 3, code: 'CV003', name: 'Tối ưu hóa hiệu suất', taskType: 'department', project: null, department: 'Phòng kế toán', type: 'Cải tiến', status: 'Chưa bắt đầu', priority: 'Thấp', manager: 'Nguyễn Văn A', assignee: 'Hoàng Văn E', active: false, updatedAt: '18/07/2023' },
  { id: 4, code: 'CV004', name: 'Kiểm thử hệ thống', taskType: 'department', project: null, department: 'Phòng hành chính', type: 'Kiểm thử', status: 'Đang thực hiện', priority: 'Cao', manager: 'Trần Thị F', assignee: 'Lê Thị G', active: true, updatedAt: '17/07/2023' },
];

const TaskList = () => {
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
  const rowsPerPage = 10;

  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    // Thực hiện xóa công việc
    const newData = mockData.filter(task => task.id !== deleteId);
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
          DANH SÁCH CÔNG VIỆC
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mb: 3,
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
              endAdornment: <SearchIcon color="action" />
            }}
            sx={{ 
              minWidth: 250,
              backgroundColor: '#fff'
            }}
          />
          
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 150,
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
              minWidth: 150,
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
              minWidth: 150,
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
            variant="contained"
            onClick={handleExport}
            startIcon={<FileDownloadIcon />}
            sx={{ 
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#1b5e20'
              }
            }}
          >
            XUẤT DỮ LIỆU
          </Button>
      
          <Button
            component={Link}
            to="/task/create"
            variant="contained"
            sx={{ 
              ml: 'auto',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            TẠO CÔNG VIỆC
          </Button>
        </Stack>
      
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 1,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1976d2' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>STT</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mã công việc</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên công việc</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Loại công việc</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Dự án/Phòng ban</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mức độ ưu tiên</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Người phụ trách</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Người thực hiện</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày cập nhật</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    </TableCell>
                  </TableRow>
                )}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  mockData.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.taskType === 'project' ? 'Công việc dự án' : 'Công việc phòng ban'}</TableCell>
                      <TableCell>{row.taskType === 'project' ? row.project : row.department}</TableCell>
                      <TableCell>{row.priority}</TableCell>
                      <TableCell>{row.manager}</TableCell>
                      <TableCell>{row.assignee}</TableCell>
                      <TableCell>{row.updatedAt}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" component={Link} to={`/task/detail/${row.id}`} sx={{ mr: 1 }}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" component={Link} to={`/task/edit/${row.id}`} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
      
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: '#fff',
            borderRadius: 1,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                Tổng {mockData.length} bản ghi
              </Typography>
              <Pagination
                count={Math.ceil(mockData.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
            </Stack>
          </Box>
        </Paper>
      </Box>
  );
};

export default TaskList;