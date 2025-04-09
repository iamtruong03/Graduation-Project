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
  Tooltip,
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
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
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

  const mockStaffData = [
    {
      id: 1,
      code: 'NV001',
      name: 'Nguyễn Văn A',
      position: 'Trưởng phòng',
      department: 'Phòng Kỹ thuật',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      joinDate: '01/01/2023',
      status: 'Đang làm việc'
    },
    {
      id: 2,
      code: 'NV002',
      name: 'Trần Thị B',
      position: 'Nhân viên',
      department: 'Phòng Nhân sự',
      email: 'tranthib@example.com',
      phone: '0901234568',
      joinDate: '15/02/2023',
      status: 'Đang làm việc'
    },
    {
      id: 3,
      code: 'NV003',
      name: 'Lê Văn C',
      position: 'Phó phòng',
      department: 'Phòng Kinh doanh',
      email: 'levanc@example.com',
      phone: '0901234569',
      joinDate: '01/03/2023',
      status: 'Tạm nghỉ'
    },
    {
      id: 4,
      code: 'NV004',
      name: 'Phạm Thị D',
      position: 'Nhân viên',
      department: 'Phòng Kỹ thuật',
      email: 'phamthid@example.com',
      phone: '0901234570',
      joinDate: '01/04/2023',
      status: 'Đang làm việc'
    },
    {
      id: 5,
      code: 'NV005',
      name: 'Hoàng Văn E',
      position: 'Nhân viên',
      department: 'Phòng Kinh doanh',
      email: 'hoangvane@example.com',
      phone: '0901234571',
      joinDate: '15/04/2023',
      status: 'Đã nghỉ việc'
    }
  ];

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = () => {
    try {
      setLoading(true);
      // Sử dụng dữ liệu mẫu thay vì gọi API
      setStaffList(mockStaffData);
      // Lấy danh sách phòng ban duy nhất từ dữ liệu mẫu
      const uniqueDepartments = [...new Set(mockStaffData.map(staff => staff.department))]
        .map((dept, index) => ({ id: index + 1, name: dept }));
      setDepartments(uniqueDepartments);
      setError(null);
    } catch (error) {
      console.error('Error loading mock data:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    try {
      // Xóa nhân viên khỏi danh sách mẫu
      setStaffList(prevList => prevList.filter(staff => staff.id !== selectedStaff.id));
      setOpenDeleteDialog(false);
      setError(null);
    } catch (error) {
      console.error('Error deleting staff from mock data:', error);
      setError('Có lỗi xảy ra khi xóa nhân viên');
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || staff.department === selectedDepartment;
    const matchesStatus = !selectedStatus || staff.status === selectedStatus;
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
            onChange={handleStatusChange}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Đang làm việc">Đang làm việc</MenuItem>
            <MenuItem value="Tạm nghỉ">Tạm nghỉ</MenuItem>
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
        <Typography color="error" sx={{ my: 3 }}>{error}</Typography>
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
              <TableCell>Số điện thoại</TableCell>
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
                <TableCell>{staff.phone}</TableCell>
                <TableCell>{staff.joinDate}</TableCell>
                <TableCell>
                  <Chip
                    label={staff.status}
                    color={staff.status === 'Đang làm việc' ? 'success' : 
                          staff.status === 'Đã nghỉ việc' ? 'error' : 'warning'}
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
        <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa nhân viên {selectedStaff?.name} không?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'create' ? 'Thêm nhân viên mới' : 'Chỉnh sửa thông tin nhân viên'}
        </DialogTitle>
        <DialogContent>
          {/* Form sẽ được thêm vào đây */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary">
            {dialogType === 'create' ? 'Thêm' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;