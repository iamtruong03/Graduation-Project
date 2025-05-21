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
  CircularProgress,
  Autocomplete,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import projectService from '../../services/projectService';
import departmentService from '../../services/departmentService';
import staffService from '../../services/staffService';
import { projectSchema } from '../../utils/validation';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const [project, setProject] = useState({
    code: '',
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    managerId: '',
    departmentId: '',
    projectTypeId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách phòng ban
        const deptResponse = await departmentService.getAll();
        if (deptResponse.data) {
          setDepartments(deptResponse.data);
        }

        // Lấy danh sách người quản lý
        const userResponse = await staffService.listUserChildDep();
        if (userResponse.data) {
          setManagers(userResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
    };

    fetchData();
  }, []);

  const validateField = async (name, value) => {
    try {
      await projectSchema.validateAt(name, { [name]: value });
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    } catch (err) {
      setValidationErrors(prev => ({ ...prev, [name]: err.message }));
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const handleDateChange = (name, value) => {
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate all fields
      await projectSchema.validate(project, { abortEarly: false });

      const projectData = {
        ...project,
        state: '1'
      };

      const response = await projectService.createProject(projectData);
      
      if (response.data.status === 200) {
        setOpenSnackbar(true);
        // Đợi 1 giây trước khi chuyển trang để người dùng thấy thông báo
        setTimeout(() => {
          navigate('/project/list');
        }, 1000);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi tạo dự án');
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = {};
        err.inner.forEach(error => {
          errors[error.path] = error.message;
        });
        setValidationErrors(errors);
      } else if (err.response) {
        // Xử lý lỗi từ API
        setError(err.response.data.message || 'Có lỗi xảy ra khi tạo dự án');
      } else {
        console.error('Error creating project:', err);
        setError('Không thể tạo dự án. Vui lòng thử lại sau.');
      }
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
            onClick={() => navigate('/project/list')}
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
            Tạo dự án mới
          </Typography>
        </Stack>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                color: '#d32f2f'
              }
            }}
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
                  label="Mã dự án"
                  name="code"
                  value={project.code}
                  onChange={handleChange}
                  error={!!validationErrors.code}
                  helperText={validationErrors.code}
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
                  label="Tên dự án"
                  name="name"
                  value={project.name}
                  onChange={handleChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
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
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  multiline
                  rows={4}
                  value={project.description}
                  onChange={handleChange}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={project.startDate}
                    onChange={(value) => handleDateChange('startDate', value)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required
                        error={!!validationErrors.startDate}
                        helperText={validationErrors.startDate}
                        sx={{
                          backgroundColor: '#fff',
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#1976d2',
                            }
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Ngày kết thúc"
                    value={project.endDate}
                    onChange={(value) => handleDateChange('endDate', value)}
                    minDate={project.startDate || null}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required
                        error={!!validationErrors.endDate}
                        helperText={validationErrors.endDate || (project.endDate && project.startDate && project.endDate < project.startDate ? 'Ngày kết thúc phải sau ngày bắt đầu' : '')}
                        sx={{
                          backgroundColor: '#fff',
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#1976d2',
                            }
                          }
                        }}
                      />
                    )}
                    shouldDisableDate={(date) => {
                      if (!project.startDate) return false;
                      return date < project.startDate;
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  required
                  error={!!validationErrors.projectTypeId}
                >
                  <InputLabel>Loại dự án</InputLabel>
                  <Select
                    name="projectTypeId"
                    value={project.projectTypeId}
                    onChange={handleChange}
                    label="Loại dự án"
                    sx={{
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  >
                    <MenuItem value={1}>Phát triển phần mềm</MenuItem>
                    <MenuItem value={2}>Mobile</MenuItem>
                    <MenuItem value={3}>Web</MenuItem>
                  </Select>
                  {validationErrors.projectTypeId && (
                    <Typography variant="caption" color="error">
                      {validationErrors.projectTypeId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  required
                  error={!!validationErrors.managerId}
                >
                  <InputLabel>Người quản lý</InputLabel>
                  <Select
                    name="managerId"
                    value={project.managerId}
                    onChange={handleChange}
                    label="Người quản lý"
                    sx={{
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  >
                    {managers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.managerId && (
                    <Typography variant="caption" color="error">
                      {validationErrors.managerId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  required
                  error={!!validationErrors.departmentId}
                >
                  <InputLabel>Phòng ban</InputLabel>
                  <Select
                    name="departmentId"
                    value={project.departmentId}
                    onChange={handleChange}
                    label="Phòng ban"
                    sx={{
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.departmentId && (
                    <Typography variant="caption" color="error">
                      {validationErrors.departmentId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/project/list')}
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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          Tạo dự án thành công!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ProjectCreate;