import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import projectService from '../../services/projectService';



const ProjectList = () => {
  const mockData = [
    {
      id: 1,
      code: 'PRJ001',
      name: 'Hệ thống quản lý nhân sự',
      type: 'Phát triển phần mềm',
      status: 'Tạo mới',
      startDate: '2024-01-19',
      endDate: '2024-11-22',
      manager: 'Bùi Hoài Hương',
      creator: 'Admin'
    },
    {
      id: 2,
      code: 'PRJ002',
      name: 'Ứng dụng di động bán hàng',
      type: 'Mobile',
      status: 'Chờ phê duyệt',
      startDate: '2024-03-15',
      endDate: '2024-04-20',
      manager: 'Ngô Duy Anh',
      creator: 'Admin'
    },
    {
      id: 3,
      code: 'PRJ003',
      name: 'Website thương mại điện tử',
      type: 'Web',
      status: 'Đã duyệt',
      startDate: '2024-02-04',
      endDate: '2024-09-19',
      manager: 'Ngô Duy Anh',
      creator: 'Admin'
    }
  ];

  // Thay đổi useState projects để sử dụng mockData
  const [projects, setProjects] = useState(mockData);
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchProjects();
  }, [page, searchCode, searchName, status]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const searchQuery = [searchCode, searchName]
        .filter(Boolean)
        .join(' ');
      
      // Vì đang dùng mockData, không cần gọi API
      const filteredProjects = mockData.filter(project => {
        const matchesSearch = project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            project.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = status === 'all' || project.status.toLowerCase() === status.toLowerCase();
        return matchesSearch && matchesStatus;
      });
      
      setProjects(filteredProjects);
      setTotalPages(Math.ceil(filteredProjects.length / rowsPerPage));
      setError(null);
    } catch (err) {
      // Không hiển thị lỗi, chỉ log ra console để debug
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id) => {
    try {
      await projectService.changeProjectStatus(id);
      await fetchProjects();
    } catch (err) {
      setError('Không thể thay đổi trạng thái dự án');
      console.error('Error changing project status:', err);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await projectService.deleteProject(deleteId);
      await fetchProjects(); // Tải lại danh sách sau khi xóa
      setError(null);
    } catch (err) {
      setError('Không thể xóa dự án');
      console.error('Error deleting project:', err);
    } finally {
      setLoading(false);
      setOpenDialog(false);
      setDeleteId(null);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>DANH SÁCH DỰ ÁN</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tên, mã dự án"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
          sx={{ minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Loại dự án</InputLabel>
          <Select
            value={status}
            label="Loại dự án"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="software">Phát triển phần mềm</MenuItem>
            <MenuItem value="mobile">Mobile</MenuItem>
            <MenuItem value="web">Web</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={status}
            label="Trạng thái"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="new">Tạo mới</MenuItem>
            <MenuItem value="pending">Chờ phê duyệt</MenuItem>
            <MenuItem value="approved">Đã duyệt</MenuItem>
            <MenuItem value="inProgress">Đang thực hiện</MenuItem>
            <MenuItem value="cancelled">Hủy bỏ</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          component={Link}
          to="/project/create"
          sx={{ ml: 'auto' }}
        >
          TẠO DỰ ÁN
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã dự án</TableCell>
              <TableCell>Tên dự án</TableCell>
              <TableCell>Loại dự án</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Người tạo</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              projects.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: getStatusColor(row.status),
                        color: '#fff'
                      }}
                    >
                      {row.status}
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(row.startDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{new Date(row.endDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{row.manager}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" component={Link} to={`/project/detail/${row.id}`} sx={{ mr: 1 }}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" component={Link} to={`/project/edit/${row.id}`} sx={{ mr: 1 }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography>Tổng {projects.length} bản ghi</Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

// Thêm hàm helper để xác định màu sắc trạng thái
const getStatusColor = (status) => {
  switch (status) {
    case 'Tạo mới':
      return '#1976d2'; // Blue
    case 'Chờ phê duyệt':
      return '#ed6c02'; // Orange
    case 'Đã duyệt':
      return '#2e7d32'; // Green
    case 'Đang thực hiện':
      return '#9c27b0'; // Purple
    case 'Hủy bỏ':
      return '#d32f2f'; // Red
    default:
      return '#757575'; // Grey
  }
};

export default ProjectList;