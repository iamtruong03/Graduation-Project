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
  DialogActions,
  Grid,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import departmentService from '../../services/departmentService';

const DepartmentList = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    parentId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const validateForm = () => {
    const errors = {};
    if (!formData.code) errors.code = 'Vui lòng nhập mã bộ phận';
    if (!formData.name) errors.name = 'Vui lòng nhập tên bộ phận';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCreateDepartment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await departmentService.createDepartment({
        ...formData,
        status: 1
      });
      
      await fetchDepartments(); // Tải lại danh sách sau khi tạo mới
      setOpenDialog(false);
      setFormData({ code: '', name: '', parentId: '' });
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo phòng ban');
      console.error('Error creating department:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await departmentService.updateDepartment(selectedDepartment.id, {
        ...formData,
        status: selectedDepartment.active ? 1 : 0
      });
      
      await fetchDepartments(); // Tải lại danh sách sau khi cập nhật
      setOpenDialog(false);
      setFormData({ code: '', name: '', parentId: '' });
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật phòng ban');
      console.error('Error updating department:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, searchName, status]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.searchDepartments(
        searchName,
        page - 1,
        rowsPerPage
      );
      
      const mappedDepartments = response.data.content.map(dept => ({
        id: dept.id,
        code: dept.code,
        name: dept.name,
        description: dept.description,
        active: dept.status === 1,
        parentName: dept.parentDepartment?.name || null,
        updatedAt: new Date(dept.modifiedDate).toLocaleDateString('vi-VN')
      }));
      
      setDepartments(mappedDepartments);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách phòng ban');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (department) => {
    setDialogType('edit');
    setSelectedDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
      parentId: departments.find(d => d.name === department.parentName)?.id || ''
    });
    setOpenDialog(true);
  };

  const handleViewDetail = (department) => {
    setDepartmentStaff([]);
    setSelectedDepartment(department);
    setOpenDetailDialog(true);
  };

  const handleDelete = async () => {
    try {
      await departmentService.deleteDepartment(selectedDepartment.id);
      setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
      setOpenDeleteDialog(false);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa phòng ban');
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
            sx={{ 
              ml: 'auto',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }} 
            onClick={() => {
              setDialogType('create');
              setOpenDialog(true);
            }}
          >
            Tạo phòng ban
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
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mã phòng ban</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên phòng ban</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên phòng ban cha</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày cập nhật</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {error && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                  </TableCell>
                </TableRow>
              )}
              {paginatedDepartments.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.parentName || '-'}</TableCell>
                  <TableCell>{row.updatedAt}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleViewDetail(row)} sx={{ mr: 1 }}><VisibilityIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleOpenEditDialog(row)} sx={{ mr: 1 }}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => {
                      setSelectedDepartment(row);
                      setOpenDeleteDialog(true);
                    }} color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
      </Paper>
    </Box>
);
};

export default DepartmentList;