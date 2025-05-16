import React, { useState, useEffect } from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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

  const handleExport = async () => {
    try {
      setLoading(true);
      await projectService.exportProjects();
      setError(null);
    } catch (err) {
      setError('Không thể xuất dữ liệu dự án');
      console.error('Error exporting projects:', err);
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
          DANH SÁCH DỰ ÁN
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
            placeholder="Tên, mã dự án"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
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
              minWidth: 200,
              backgroundColor: '#fff'
            }}
          >
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
    
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 200,
              backgroundColor: '#fff'
            }}
          >
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
            variant="contained"
            component={Link}
            to="/project/create"
            sx={{ 
              ml: 'auto',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            TẠO DỰ ÁN
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
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mã dự án</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên dự án</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Loại dự án</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày bắt đầu</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày kết thúc</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Người tạo</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow 
                      key={project.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell>{project.code}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.type}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: getStatusColor(project.status),
                            color: '#fff',
                            py: 0.5,
                            px: 1.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            fontSize: '0.875rem'
                          }}
                        >
                          {project.status}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(project.startDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{new Date(project.endDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{project.creator}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/project/detail/${project.id}`}
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/project/edit/${project.id}`}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(project.id)}
                        >
                          <DeleteIcon fontSize="small" />
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
                Tổng {projects.length} bản ghi
              </Typography>
              <Pagination
                count={totalPages}
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