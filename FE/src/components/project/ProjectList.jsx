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
  Alert,
  Badge,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, CheckCircle as ApproveIcon, Assignment as AssignmentIcon, Add as AddIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import staffService from '../../services/staffService';
import departmentService from '../../services/departmentService';
import { PROJECT_STATES, PROJECT_TYPES } from '../../utils/constants';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState({});
  const [managers, setManagers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [projectType, setProjectType] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [approveId, setApproveId] = useState(null);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [openPendingDialog, setOpenPendingDialog] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const rowsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchPendingCount();
    fetchDepartments();
  }, [page, searchTerm, projectType, status]);

  useEffect(() => {
    if (openPendingDialog) {
      fetchPendingProjects();
    }
  }, [openPendingDialog, pendingPage]);

  const fetchDepartments = async () => {
    try {
      const [deptResponse, userResponse] = await Promise.all([
        departmentService.getAll(),
        staffService.listUserChildDep()
      ]);

      if (deptResponse.data) {
        const deptMap = {};
        deptResponse.data.forEach(dept => {
          deptMap[dept.id] = dept.name;
        });
        setDepartments(deptMap);
      }

      if (userResponse.data) {
        const userMap = {};
        userResponse.data.forEach(user => {
          userMap[user.id] = user.name;
        });
        setManagers(userMap);
      }
    } catch (err) {
      console.error('Error fetching departments and users:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const filter = {
        search: searchTerm,
        projectType: projectType !== 'all' ? projectType : undefined,
        state: status !== 'all' ? status : undefined,
        page: page,
        size: rowsPerPage
      };
      
      const response = await projectService.searchProjects(filter);
      if (response.status === 200) {
        const { content, totalPages, totalElements } = response.data;
        setProjects(content);
        setTotalPages(totalPages);
        setTotalElements(totalElements);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getPendingApprovalProjects({
        page: pendingPage,
        size: rowsPerPage,
        search: searchTerm
      });
      if (response.status === 200) {
        const { content, totalPages, totalElements } = response.data;
        setPendingProjects(content);
        setPendingTotalPages(totalPages);
        setPendingCount(totalElements);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (err) {
      console.error('Error fetching pending projects:', err);
      setError('Không thể tải danh sách dự án chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await projectService.getPendingApprovalProjects({
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset về trang đầu tiên khi tìm kiếm
  };

  const handleProjectTypeChange = (event) => {
    setProjectType(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1); // API sử dụng zero-based index
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await projectService.deleteProject(deleteId);
      if (response.data.success) {
        await fetchProjects();
      } else {
        setError(response.data.message);
      }
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

  const handleApprove = (id) => {
    setApproveId(id);
    setOpenApproveDialog(true);
  };

  const handleConfirmApprove = async () => {
    try {
      setLoading(true);
      const response = await projectService.approveProject(approveId, localStorage.getItem('userId'));
      if (response.success) {
        await fetchProjects();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Không thể phê duyệt dự án');
      console.error('Error approving project:', err);
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
            DANH SÁCH DỰ ÁN
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
              DỰ ÁN CHỜ DUYỆT
            </Button>
          </Badge>

          <Button
            variant="contained"
            component={Link}
            to="/project/create"
            startIcon={<AddIcon />}
            sx={{ 
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#1b5e20'
              }
            }}
          >
            TẠO DỰ ÁN MỚI
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
              placeholder="Tìm kiếm theo tên, mã dự án..."
              value={searchTerm}
              onChange={handleSearchChange}
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
              <InputLabel>Loại dự án</InputLabel>
              <Select
                value={projectType}
                label="Loại dự án"
                onChange={handleProjectTypeChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {Object.entries(PROJECT_TYPES).map(([id, name]) => (
                  <MenuItem key={id} value={id}>{name}</MenuItem>
                ))}
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
                onChange={handleStatusChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {Object.entries(PROJECT_STATES).map(([id, name]) => (
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
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mã dự án</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Tên dự án</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Loại dự án</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Phòng ban</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày bắt đầu</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày kết thúc</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Người quản lý</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#1976d2' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Không có dữ liệu
                    </Typography>
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
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {project.code}
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
                        onClick={() => navigate(`/project/${project.id}`)}
                      >
                        {project.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {PROJECT_TYPES[project.projectTypeId] || project.projectTypeId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {departments[project.departmentId] || project.departmentId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PROJECT_STATES[project.state] || project.state}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(project.state),
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(project.startDate).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(project.endDate).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {managers[project.managerId] || project.managerId}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/project/${project.id}`)}
                          sx={{ 
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)'
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      
                        {project.state === 1 && (
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(project.id)}
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
                          onClick={() => handleDelete(project.id)}
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
            Tổng số: <strong>{totalElements}</strong> dự án
          </Typography>
          <Pagination
            count={totalPages}
            page={page + 1}
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
              Bạn có chắc chắn muốn xóa dự án này không?
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
              Bạn có chắc chắn muốn phê duyệt dự án này không?
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
          open={openPendingDialog}
          onClose={handleClosePendingDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Danh sách dự án chờ duyệt ({pendingCount})
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
                        <TableCell>Mã dự án</TableCell>
                        <TableCell>Tên dự án</TableCell>
                        <TableCell>Phòng ban</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ngày bắt đầu</TableCell>
                        <TableCell>Ngày kết thúc</TableCell>
                        <TableCell>Người quản lý</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>{project.code}</TableCell>
                          <TableCell>{project.name}</TableCell>
                          <TableCell>{departments[project.departmentId] || project.departmentId}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                backgroundColor: getStatusColor(project.state),
                                color: '#fff',
                                py: 0.5,
                                px: 1.5,
                                borderRadius: 1,
                                display: 'inline-block',
                                fontSize: '0.875rem'
                              }}
                            >
                              {PROJECT_STATES[project.state] || project.state}
                            </Box>
                          </TableCell>
                          <TableCell>{new Date(project.startDate).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{new Date(project.endDate).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{managers[project.managerId] || project.managerId}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/project/${project.id}`}
                              sx={{ mr: 1 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(project.id)}
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

// Cập nhật hàm helper để xác định màu sắc trạng thái
const getStatusColor = (state) => {
  switch (state) {
    case 1: // STATUS_PENDING
      return '#ed6c02'; // Orange
    case 2: // STATUS_APPROVED
      return '#2e7d32'; // Green
    case 3: // STATUS_REJECTED
      return '#d32f2f'; // Red
    case 4: // STATUS_IN_PROGRESS
      return '#1976d2'; // Blue
    case 5: // STATUS_COMPLETE
      return '#2e7d32'; // Green
    case 6: // STATUS_OVERDUE
      return '#d32f2f'; // Red
    default:
      return '#757575'; // Grey
  }
};

export default ProjectList;