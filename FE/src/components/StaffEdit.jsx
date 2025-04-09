import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import staffService from '../services/staffService';

const StaffEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    status: ''
  });

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await staffService.getStaffById(id);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching staff data:', error);
      }
    };
    fetchStaffData();
  }, [id]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await staffService.updateStaff(id, formData);
      navigate('/staff/management');
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Chỉnh sửa thông tin nhân viên
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Mã nhân viên"
            name="code"
            value={formData.code}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Tên nhân viên"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Phòng ban"
            name="department"
            value={formData.department}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Chức vụ"
            name="position"
            value={formData.position}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
          />
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={formData.status}
              label="Trạng thái"
              name="status"
              onChange={handleFormChange}
            >
              <MenuItem value="Đang làm việc">Đang làm việc</MenuItem>
              <MenuItem value="Tạm nghỉ">Tạm nghỉ</MenuItem>
              <MenuItem value="Đã nghỉ việc">Đã nghỉ việc</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/staff/management')}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Lưu thay đổi
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default StaffEdit;