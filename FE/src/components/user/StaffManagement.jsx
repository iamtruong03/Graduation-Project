import React, { useState, useEffect } from 'react';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Pagination,
  Alert as MuiAlert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import staffService from '../../services/staffService';
import departmentService from '../../services/departmentService';
import { Stack } from '@mui/material';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [positionId, setPositionId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const positionOptions = [
    { id: 1, name: 'Quản lý' },
    { id: 2, name: 'Nhân viên' }
  ];

  const genderOptions = [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
    { value: 'OTHER', label: 'Khác' }
  ];

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [departmentList, setDepartmentList] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStaffList();
  }, [page, size, searchTerm, selectedDepartment, selectedStatus, positionId, departmentList]);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const filter = {
        search: searchTerm || '',
        departmentId: selectedDepartment === '' ? null : Number(selectedDepartment),
        positionId: positionId === '' ? null : Number(positionId)
      };

      const pageable = {
        page: page,
        size: size
      };

      const response = await staffService.searchStaff(filter, pageable);
      console.log('Dữ liệu từ API:', response.data);

      const rawData = response?.data?.content || [];

      const formattedStaff = rawData.map((staff) => ({
        id: staff.id,
        code: staff.code,
        name: staff.name,
        position: positionOptions.find(p => p.id === staff.positionId)?.name || '---',
        departmentId: staff.departmentId,
        departmentName: departmentList.find(d => d.id === staff.departmentId)?.name || '---',
        email: staff.email,
        phoneNumber: staff.phoneNumber,
        joinDate: staff.startDate
          ? new Date(staff.startDate).toLocaleDateString()
          : '---',
        status: staff.status,
        birthday: staff.birthday
          ? new Date(staff.birthday).toLocaleDateString()
          : '---',
        gender: genderOptions.find(g => g.value === staff.gender)?.label || '---',
        address: staff.address
      }));

      setStaffList(formattedStaff);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhân viên:', err);
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      if (response.data) {
        setDepartmentList(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng ban:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filter = {
      search: e.target.value,
      departmentId: selectedDepartment,
      positionId: positionId,
      page: 0,
      size: 10,
      sort: ['id,desc']
    };
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    const filter = {
      search: searchTerm,
      departmentId: e.target.value,
      positionId: positionId,
      page: 0,
      size: 10,
      sort: ['id,desc']
    };
    // Thiếu gọi fetchStaffList() ở đây
  };
  const handleStatusChange = (e) => setSelectedStatus(e.target.value);

  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setOpenDeleteDialog(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDeleteConfirm = async () => {
    try {
      await staffService.deleteStaff(selectedStaff.id);
      setStaffList((prev) =>
        prev.filter((staff) => staff.id !== selectedStaff.id)
      );
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: 'Xóa nhân viên thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Có lỗi xảy ra khi xóa nhân viên',
        severity: 'error'
      });
    }
  };

  // Thay đổi cách xử lý filter trực tiếp bằng cách gọi API search
  const filteredStaff = staffList;

  const handlePositionChange = (e) => {
    setPositionId(e.target.value);
    const filter = {
      search: searchTerm,
      departmentId: selectedDepartment,
      positionId: e.target.value,
      page: 0,
      size: 10,
      sort: ['id,desc']
    };
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
          QUẢN LÝ NHÂN SỰ
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
            label="Tìm kiếm"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              width: { xs: '100%', sm: 250 },
              backgroundColor: 'white'
            }}
            placeholder="Tìm theo tên hoặc mã nhân viên"
          />

          <FormControl
            size="small"
            sx={{
              width: { xs: '100%', sm: 200 },
              backgroundColor: 'white'
            }}
          >
            <InputLabel>Phòng ban</InputLabel>
            <Select
              value={selectedDepartment}
              label="Phòng ban"
              onChange={handleDepartmentChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {departmentList.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: { xs: '100%', sm: 200 },
              backgroundColor: 'white'
            }}
          >
            <InputLabel>Chức vụ</InputLabel>
            <Select
              value={positionId}
              label="Chức vụ"
              onChange={handlePositionChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {positionOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={() => navigate('/staff/create')}
            sx={{
              ml: 'auto',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            THÊM NHÂN VIÊN
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
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mã nhân viên</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Họ tên</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Số điện thoại</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Phòng ban</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Chức vụ</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày vào làm</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={10}>
                    <MuiAlert
                      severity="error"
                      sx={{
                        mb: 2,
                        '& .MuiAlert-icon': {
                          color: '#d32f2f'
                        }
                      }}
                    >
                      {error}
                    </MuiAlert>
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress sx={{ color: '#1976d2' }} />
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Không tìm thấy dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff, index) => (
                  // Sửa lại thứ tự hiển thị trong TableRow
                  <TableRow
                    key={staff.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell>{staff.code}</TableCell>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.phoneNumber}</TableCell>
                    <TableCell>
                      {staff.departmentName}
                    </TableCell>
                    <TableCell>{staff.position}</TableCell>
                    <TableCell>{staff.joinDate}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/staff/detail/${staff.id}`)}
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(staff)}
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
      </Paper>

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
            Tổng {staffList.length} bản ghi
          </Typography>
          <Pagination
            count={Math.ceil(staffList.length / size)}
            page={page + 1}
            onChange={(e, p) => setPage(p - 1)}
            color="primary"
            size="small"
          />
        </Stack>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa nhân viên này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
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
    </Box>
  );
};

export default StaffManagement;
