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
  IconButton,
  Paper,
  Divider,
  Alert,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

  const [errors, setErrors] = useState({});

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['name', 'type', 'impactScope', 'projectName', 'department', 'analyst', 'analysisDate'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Trường này là bắt buộc';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      navigate('/risk/list');
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          borderBottom: '2px solid #1976d2',
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton 
              onClick={() => navigate('/risk/list')}
              sx={{ 
                mr: 1,
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#1976d2'
              }}
            >
              THÊM MỚI RỦI RO
            </Typography>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Mã rủi ro"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
              disabled
              size="small"
              sx={{
                backgroundColor: '#f5f5f5'
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tên rủi ro"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              size="small"
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.type}
            >
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
              {errors.type && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.type}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.impactScope}
            >
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
              {errors.impactScope && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.impactScope}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.projectName}
            >
              <InputLabel>Tên dự án</InputLabel>
              <Select
                name="projectName"
                value={formData.projectName}
                onChange={handleFormChange}
                label="Tên dự án"
              >
                <MenuItem value="Kiểm soát rủi ro tiếp xúc với chất độc hại">
                  Kiểm soát rủi ro tiếp xúc với chất độc hại
                </MenuItem>
              </Select>
              {errors.projectName && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.projectName}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.department}
            >
              <InputLabel>Đơn vị ghi nhận</InputLabel>
              <Select
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                label="Đơn vị ghi nhận"
              >
                <MenuItem value="Phòng quản lý rủi ro">Phòng quản lý rủi ro</MenuItem>
              </Select>
              {errors.department && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.department}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.analyst}
            >
              <InputLabel>Người phản ánh</InputLabel>
              <Select
                name="analyst"
                value={formData.analyst}
                onChange={handleFormChange}
                label="Người phản ánh"
              >
                <MenuItem value="Phạm Như Hoài">Phạm Như Hoài</MenuItem>
              </Select>
              {errors.analyst && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.analyst}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Ngày phản ánh"
              name="analysisDate"
              value={formData.analysisDate}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              required
              size="small"
              error={!!errors.analysisDate}
              helperText={errors.analysisDate}
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
              size="small"
            />
          </Grid>
        </Grid>

        <Box sx={{ 
          mt: 4, 
          pt: 2,
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2,
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={() => navigate('/risk/list')}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              borderColor: '#929292',
              color: '#929292',
              '&:hover': {
                borderColor: '#6f6f6f',
                color: '#6f6f6f',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            ĐÓNG
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            LƯU
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RiskCreate;