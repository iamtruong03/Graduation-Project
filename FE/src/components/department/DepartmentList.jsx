import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert as MuiAlert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import departmentService from '../../services/departmentService';

const DepartmentList = () => {
  const [searchName, setSearchName] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchDepartments();
  }, [page, searchName]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      // Lấy danh sách phòng ban theo tìm kiếm
      const searchResponse = await departmentService.searchDepartments(
        searchName,
        page - 1,
        rowsPerPage
      );

      // Lấy danh sách tất cả phòng ban đang hoạt động để map parentId
      const allDeptsResponse = await departmentService.getActiveDepartments();
      
      const mappedDepartments = searchResponse.data.content.map(dept => {
        // Tìm phòng ban cha dựa trên parentId từ danh sách tất cả phòng ban
        const parentDept = allDeptsResponse.find(d => d.id === dept.parentId);
        return {
          id: dept.id,
          code: dept.code,
          name: dept.name,
          description: dept.description,
          active: dept.status === 1,
          parentName: parentDept ? parentDept.name : 'Không có',
          updatedAt: new Date(dept.modifiedDate).toLocaleDateString('vi-VN')
        };
      });
      
      setDepartments(mappedDepartments);
      setTotalPages(searchResponse.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách phòng ban');
      console.error('Error fetching departments:', err);
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

  const handleDelete = async () => {
    try {
      await departmentService.deleteDepartment(selectedDepartment.id);
      setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: 'Xóa phòng ban thành công',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng ban',
        severity: 'error'
      });
      console.error('Error deleting department:', err);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedDepartments = departments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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
          DANH SÁCH PHÒNG BAN
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
            placeholder="Tên, mã phòng ban"
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
      
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ 
              ml: 'auto',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }} 
            onClick={() => navigate('/department/create')}
          >
            Tạo phòng ban
          </Button>
        </Stack>
    
        {error && (
          <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>
        )}

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
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mã phòng ban</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên phòng ban</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên phòng ban cha</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày cập nhật</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDepartments.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.parentName || '-'}</TableCell>
                    <TableCell>{row.updatedAt}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/department/detail/${row.id}`)} 
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedDepartment(row);
                          setOpenDeleteDialog(true);
                        }} 
                        color="error"
                      >
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
              Tổng {departments.length} bản ghi
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa phòng ban "{selectedDepartment?.name}" không?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
            <Button onClick={handleDelete} color="error" autoFocus>
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

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
    </Box>
  );
};

export default DepartmentList;