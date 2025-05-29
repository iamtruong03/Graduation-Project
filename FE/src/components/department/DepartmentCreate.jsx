import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import departmentService from '../../services/departmentService';

const DepartmentCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parentId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      if (response.data) {
        setDepartments(response.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) {
      errors.code = 'Mã phòng ban không được để trống';
    } else if (formData.code.length < 2) {
      errors.code = 'Mã phòng ban phải có ít nhất 2 ký tự';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Tên phòng ban không được để trống';
    } else if (formData.name.length < 3) {
      errors.name = 'Tên phòng ban phải có ít nhất 3 ký tự';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const departmentData = {
        ...formData,
        status: 1,
        parentId: formData.parentId || null
      };

      const response = await departmentService.createDepartment(departmentData);
      
      if (response.status === 200 || response.status === 201) {
        navigate('/department/list');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tạo phòng ban');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Không thể tạo phòng ban. Vui lòng thử lại sau.');
      }
      console.error('Error creating department:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: '#fff' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4, pb: 2, borderBottom: '2px solid #1976d2' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/department/list')}
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Quay lại
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            Tạo phòng ban mới
          </Typography>
        </Stack>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Mã phòng ban"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  error={!!formErrors.code}
                  helperText={formErrors.code}
                  sx={{
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Tên phòng ban"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  sx={{
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl 
                  fullWidth
                  sx={{
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }}
                >
                  <InputLabel>Phòng ban cha</InputLabel>
                  <Select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    label="Phòng ban cha"
                  >
                    <MenuItem value="">
                      <em>Không có</em>
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  sx={{
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/department/list')}
              disabled={loading}
              sx={{
                borderColor: '#666',
                color: '#666',
                '&:hover': {
                  borderColor: '#444',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default DepartmentCreate; 