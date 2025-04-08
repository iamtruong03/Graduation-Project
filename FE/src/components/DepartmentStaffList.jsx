import React, { useState, useEffect } from 'react';
import staffService from '../services/staffService';
import departmentService from '../services/departmentService';
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const DepartmentStaffList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tạm thời sử dụng dữ liệu mẫu
    const mockDepartments = [
      { id: 1, name: 'Phòng Kỹ thuật' },
      { id: 2, name: 'Phòng Kinh doanh' },
      { id: 3, name: 'Phòng Nhân sự' }
    ];

    const mockStaff = [
      { id: 1, name: 'Nguyễn Văn A', code: 'NV001', department: 1, status: 'active' },
      { id: 2, name: 'Trần Thị B', code: 'NV002', department: 2, status: 'active' },
      { id: 3, name: 'Lê Văn C', code: 'NV003', department: 3, status: 'inactive' }
    ];

    setDepartments(mockDepartments);
    setStaffList(mockStaff);
    setLoading(false);
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

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
        Danh sách nhân sự theo phòng ban
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

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ml: 'auto' }}
        >
          Thêm nhân viên
        </Button>
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
                <TableCell>{staff.status}</TableCell>
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

export default DepartmentStaffList;