import React, { useState, useEffect } from 'react';
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
  Alert as MuiAlert,
  Stack,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import departmentService from '../../services/departmentService';
import staffService from '../../services/staffService';
import riskService from '../../services/riskService';
import categoryService from '../../services/categoryService';

const RiskCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    riskTypeId: '',
    projectId: '',
    departmentId: '',
    impactLevelId: '',
    scopeId: '',
    possibilityId: '',
    priorityId: '',
    reflectorId: '',
    rootCause: '',
    impactAnalysis: '',
    remedy: '',
    precautions: '',
    reflectionDay: ''
  });
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [riskTypes, setRiskTypes] = useState([]);
  const [impactLevels, setImpactLevels] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách loại rủi ro
        const riskTypesResponse = await categoryService.getCategoriesByType('riskTypeId');
        if (riskTypesResponse && riskTypesResponse.data) {
          setRiskTypes(riskTypesResponse.data);
        }

        // Lấy danh sách mức độ ảnh hưởng
        const impactLevelsResponse = await categoryService.getCategoriesByType('impactLevelId');
        if (impactLevelsResponse && impactLevelsResponse.data) {
          setImpactLevels(impactLevelsResponse.data);
        }

        // Lấy danh sách dự án
        const projectResponse = await projectService.getProjectList();
        setProjects(projectResponse || []);

        // Lấy danh sách phòng ban
        const departmentResponse = await departmentService.getAll();
        const departmentData = departmentResponse?.data || [];
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setDepartments([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (formData.departmentId) {
        try {
          const response = await staffService.listUserByDep(formData.departmentId);
          const userData = response?.data || [];
          setUsers(Array.isArray(userData) ? userData : []);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách người dùng:', error);
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [formData.departmentId]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset người phản ánh khi đổi phòng ban
      ...(name === 'departmentId' && { reflectorId: '' })
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
    const requiredFields = ['code', 'name', 'riskTypeId', 'impactLevelId', 'scopeId', 'projectId', 'departmentId', 'reflectorId', 'reflectionDay'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Trường này là bắt buộc';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const riskData = {
          ...formData,
        };

        await riskService.createRisk(riskData);
        
        setSnackbar({
          open: true,
          message: 'Tạo rủi ro thành công!',
          severity: 'success'
        });
        
        // Chuyển về trang danh sách sau 1 giây
        setTimeout(() => {
          navigate('/risk/list');
        }, 1000);
      } catch (error) {
        console.error('Lỗi khi tạo rủi ro:', error);
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi tạo rủi ro: ' + (error.response?.data?.message || error.message),
          severity: 'error'
        });
      }
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
              required
              size="small"
              error={!!errors.code}
              helperText={errors.code}
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
              error={!!errors.riskTypeId}
            >
              <InputLabel>Loại rủi ro</InputLabel>
              <Select
                name="riskTypeId"
                value={formData.riskTypeId}
                onChange={handleFormChange}
                label="Loại rủi ro"
              >
                {riskTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.riskTypeId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.riskTypeId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.impactLevelId}
            >
              <InputLabel>Mức độ ảnh hưởng</InputLabel>
              <Select
                name="impactLevelId"
                value={formData.impactLevelId}
                onChange={handleFormChange}
                label="Mức độ ảnh hưởng"
              >
                {impactLevels.map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.impactLevelId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.impactLevelId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.scopeId}
            >
              <InputLabel>Phạm vi ảnh hưởng</InputLabel>
              <Select
                name="scopeId"
                value={formData.scopeId}
                onChange={handleFormChange}
                label="Phạm vi ảnh hưởng"
              >
                <MenuItem value={1}>Dự án</MenuItem>
                <MenuItem value={2}>Phòng ban</MenuItem>
              </Select>
              {errors.scopeId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.scopeId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.projectId}
            >
              <InputLabel>Tên dự án</InputLabel>
              <Select
                name="projectId"
                value={formData.projectId}
                onChange={handleFormChange}
                label="Tên dự án"
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.projectId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.projectId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.departmentId}
            >
              <InputLabel>Đơn vị ghi nhận</InputLabel>
              <Select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleFormChange}
                label="Đơn vị ghi nhận"
              >
                {Array.isArray(departments) && departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.departmentId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.departmentId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.reflectorId}
            >
              <InputLabel>Người phản ánh</InputLabel>
              <Select
                name="reflectorId"
                value={formData.reflectorId}
                onChange={handleFormChange}
                label="Người phản ánh"
                disabled={!formData.departmentId}
              >
                {Array.isArray(users) && users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.reflectorId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.reflectorId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Ngày phản ánh"
              name="reflectionDay"
              value={formData.reflectionDay}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              required
              size="small"
              error={!!errors.reflectionDay}
              helperText={errors.reflectionDay}
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

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.possibilityId}
            >
              <InputLabel>Khả năng xảy ra</InputLabel>
              <Select
                name="possibilityId"
                value={formData.possibilityId}
                onChange={handleFormChange}
                label="Khả năng xảy ra"
              >
                <MenuItem value={1}>Thấp</MenuItem>
                <MenuItem value={2}>Trung bình</MenuItem>
                <MenuItem value={3}>Cao</MenuItem>
              </Select>
              {errors.possibilityId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.possibilityId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl 
              fullWidth 
              required 
              size="small"
              error={!!errors.priorityId}
            >
              <InputLabel>Mức độ ưu tiên</InputLabel>
              <Select
                name="priorityId"
                value={formData.priorityId}
                onChange={handleFormChange}
                label="Mức độ ưu tiên"
              >
                <MenuItem value={1}>Thấp</MenuItem>
                <MenuItem value={2}>Trung bình</MenuItem>
                <MenuItem value={3}>Cao</MenuItem>
              </Select>
              {errors.priorityId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.priorityId}
                </Typography>
              )}
            </FormControl>
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

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={1000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default RiskCreate;