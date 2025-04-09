import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import vi from 'date-fns/locale/vi';
import CloseIcon from '@mui/icons-material/Close';

const ProjectEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    manager: '',
    department: '',
    startDate: null,
    endDate: null,
    status: 'NEW',
  });

  const [departments] = useState([
    { id: 1, name: 'Phòng Kỹ thuật' },
    { id: 2, name: 'Phòng Kinh doanh' },
    { id: 3, name: 'Phòng Nhân sự' },
  ]);

  const [managers] = useState([
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' },
    { id: 3, name: 'Lê Văn C' },
  ]);

  const [statuses] = useState([
    { code: 'NEW', name: 'Mới' },
    { code: 'IN_PROGRESS', name: 'Đang thực hiện' },
    { code: 'COMPLETED', name: 'Hoàn thành' },
    { code: 'CANCELLED', name: 'Đã hủy' },
  ]);

  useEffect(() => {
    // TODO: Load project data by ID
    // Temporary mock data
    setFormData({
      code: 'PRJ001',
      name: 'Dự án A',
      manager: 1,
      department: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'IN_PROGRESS',
    });
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Implement project update logic here
    console.log('Form submitted:', formData);
    navigate('/project/list');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Cập nhật dự án</Typography>
        <IconButton
          color="primary"
          onClick={() => navigate('/project/list')}
          sx={{ p: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Mã dự án"
                name="code"
                value={formData.code}
                onChange={handleChange}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Tên dự án"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Người quản lý</InputLabel>
                <Select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  label="Người quản lý"
                >
                  {managers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Phòng ban thực hiện</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Phòng ban thực hiện"
                >
                  {departments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DatePicker
                  label="Ngày bắt đầu"
                  value={formData.startDate}
                  onChange={(value) => handleDateChange('startDate', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DatePicker
                  label="Ngày kết thúc"
                  value={formData.endDate}
                  onChange={(value) => handleDateChange('endDate', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Trạng thái"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.code} value={status.code}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/project/list')}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="contained">
                  Cập nhật
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectEdit;