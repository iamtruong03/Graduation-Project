import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Mock data - sẽ được thay thế bằng dữ liệu thực từ API
  const departments = [
    { id: 1, name: 'Phòng Kỹ thuật' },
    { id: 2, name: 'Phòng Kinh doanh' },
    { id: 3, name: 'Phòng Nhân sự' },
  ];

  const staffList = [
    {
      id: 1,
      code: 'NV001',
      name: 'Nguyễn Văn A',
      position: 'Trưởng phòng',
      department: 'Phòng Kỹ thuật',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      status: 'Đang làm việc',
      joinDate: '2023-01-01',
    },
    // Thêm dữ liệu mẫu khác
  ];

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
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
            <MenuItem value="Đã nghỉ việc">Đã nghỉ việc</MenuItem>
            <MenuItem value="Tạm nghỉ">Tạm nghỉ</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Tooltip title="Nhập từ Excel">
            <Button variant="outlined" startIcon={<CloudUploadIcon />}>
              Nhập
            </Button>
          </Tooltip>
          <Tooltip title="Xuất ra Excel">
            <Button variant="outlined" startIcon={<CloudDownloadIcon />}>
              Xuất
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
          >
            Thêm nhân viên
          </Button>
        </Box>
      </Box>

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
                  <IconButton size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StaffManagement;