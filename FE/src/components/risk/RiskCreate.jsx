import React, { useState } from 'react';
import {
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const RiskCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: 'RISK_0001',
    name: '',
    type: '',
    impactScope: '',
    projectName: '',
    department: '',
    analyst: '',
    analysisDate: '',
    description: ''
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    navigate('/risk/list');
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Thêm mới rủi ro</Typography>
        <IconButton onClick={() => navigate('/risk/list')}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Mã rủi ro"
            name="code"
            value={formData.code}
            onChange={handleFormChange}
            disabled
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Tên rủi ro"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth required>
            <InputLabel>Loại rủi ro</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              label="Loại rủi ro"
            >
              <MenuItem value="Rủi ro sức khỏe">Rủi ro sức khỏe</MenuItem>
              <MenuItem value="Rủi ro môi trường">Rủi ro môi trường</MenuItem>
              <MenuItem value="Rủi ro an toàn">Rủi ro an toàn</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth required>
            <InputLabel>Phạm vi ảnh hưởng</InputLabel>
            <Select
              name="impactScope"
              value={formData.impactScope}
              onChange={handleFormChange}
              label="Phạm vi ảnh hưởng"
            >
              <MenuItem value="Dự án">Dự án</MenuItem>
              <MenuItem value="Phòng ban">Phòng ban</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth required>
            <InputLabel>Tên dự án</InputLabel>
            <Select
              name="projectName"
              value={formData.projectName}
              onChange={handleFormChange}
              label="Tên dự án"
            >
              <MenuItem value="Kiểm soát rủi ro tiếp xúc với chất độc hại">Kiểm soát rủi ro tiếp xúc với chất độc hại</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth required>
            <InputLabel>Đơn vị ghi nhận</InputLabel>
            <Select
              name="department"
              value={formData.department}
              onChange={handleFormChange}
              label="Đơn vị ghi nhận"
            >
              <MenuItem value="Phòng quản lý rủi ro">Phòng quản lý rủi ro</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth required>
            <InputLabel>Người phân tích</InputLabel>
            <Select
              name="analyst"
              value={formData.analyst}
              onChange={handleFormChange}
              label="Người phân tích"
            >
              <MenuItem value="Phạm Như Hoài">Phạm Như Hoài</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            type="date"
            label="Ngày phân tích"
            name="analysisDate"
            value={formData.analysisDate}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Mô tả chi tiết"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate('/risk/list')} variant="outlined">
          Đóng
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Lưu
        </Button>
      </Box>
    </Box>
  );
};

export default RiskCreate;