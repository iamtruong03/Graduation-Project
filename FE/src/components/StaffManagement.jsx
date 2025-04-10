import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import staffService from '../services/staffService';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const departmentNames = {
    1: 'Phòng Nhân sự',
    2: 'Phòng Kỹ thuật',
    3: 'Phòng Kế toán',
    4: 'Phòng Marketing',
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const response = await staffService.getAllStaff();
      console.log('Dữ liệu từ API:', response.data);

      const rawData = response?.data || [];

      const formattedStaff = rawData.map((staff) => ({
        id: staff.id,
        code: staff.code,
        name: staff.name,
        position: staff.role,
        department: staff.departmentId ? departmentNames[staff.departmentId] || `Phòng ${staff.departmentId}` : '---',
        email: staff.email,
        phoneNumber: staff.phoneNumber,
        joinDate: staff.startDate
          ? new Date(staff.startDate).toLocaleDateString()
          : '---',
        status: staff.status,
        birthday: staff.birthday
          ? new Date(staff.birthday).toLocaleDateString()
          : '---',
        gender: staff.gender,
        address: staff.address
      }));

      setStaffList(formattedStaff);
      setDepartments(
        [...new Set(formattedStaff.map((s) => s.department))].map(
          (dept, idx) => ({ id: idx + 1, name: dept })
        )
      );
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhân viên:', err);
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleDepartmentChange = (e) => setSelectedDepartment(e.target.value);
  const handleStatusChange = (e) => setSelectedStatus(e.target.value);

  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    try {
      setStaffList((prev) =>
        prev.filter((staff) => staff.id !== selectedStaff.id)
      );
      setOpenDeleteDialog(false);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
      setError('Có lỗi xảy ra khi xóa nhân viên');
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !selectedDepartment || staff.department === selectedDepartment;

    const matchesStatus =
      selectedStatus === '' || staff.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Quản lý nhân sự
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 250 }}
          placeholder="Tìm theo tên hoặc mã nhân viên"
        />

        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Phòng ban</InputLabel>
          <Select
            value={selectedDepartment}
            label="Phòng ban"
            onChange={handleDepartmentChange}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.name}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={selectedStatus}
            label="Trạng thái"
            onChange={(e) => setSelectedStatus(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value={1}>Đang làm việc</MenuItem>
            <MenuItem value={0}>Tạm nghỉ</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/staff/create')}
          >
            Thêm nhân viên
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 3 }}>
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã NV</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Chức vụ</TableCell>
                <TableCell>Phòng ban</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>SĐT</TableCell>
                <TableCell>Ngày vào làm</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.code}</TableCell>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.position}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phoneNumber}</TableCell>
                  <TableCell>{staff.joinDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        staff.status === 1 ? 'Đang làm việc' : 'Tạm nghỉ'
                      }
                      color={staff.status === 1 ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/staff/edit/${staff.id}`)}
                    >
                      <EditIcon />
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa nhân viên{' '}
            <strong>{selectedStaff?.name}</strong> không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
