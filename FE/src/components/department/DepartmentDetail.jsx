import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import departmentService from '../../services/departmentService';
import staffService from '../../services/staffService';

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parentId: '',
    status: 1
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchDepartmentDetail();
      fetchDepartmentStaff();
      fetchAllDepartments();
    }
  }, [id]);

  const fetchDepartmentDetail = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getDepartmentById(id);
      if (response.data) {
        const dept = response.data;
        setDepartment(dept);
        setFormData({
          code: dept.code || '',
          name: dept.name || '',
          description: dept.description || '',
          parentId: dept.parentDepartment?.id || '',
          status: dept.status || 1
        });
      }
    } catch (err) {
      setError('Không thể tải thông tin phòng ban');
      console.error('Error fetching department:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStaff = async () => {
    try {
      const response = await departmentService.getDepartmentStaff(id);
      if (response.data) {
        setDepartmentStaff(response.data);
      }
    } catch (err) {
      console.error('Error fetching department staff:', err);
    }
  };

  const fetchAllDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      if (response.data) {
        // Filter out current department to prevent circular reference
        setDepartments(response.data.filter(dept => dept.id !== parseInt(id)));
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

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.checked ? 1 : 0
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      code: department.code || '',
      name: department.name || '',
      description: department.description || '',
      parentId: department.parentDepartment?.id || '',
      status: department.status || 1
    });
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const updateData = {
        ...formData,
        parentId: formData.parentId || null
      };

      const response = await departmentService.updateDepartment(id, updateData);
      
      if (response.status === 200) {
        setIsEditing(false);
        await fetchDepartmentDetail(); // Refresh data
      } else {
        setError(response.message || 'Có lỗi xảy ra khi cập nhật phòng ban');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Không thể cập nhật phòng ban. Vui lòng thử lại sau.');
      }
      console.error('Error updating department:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !department) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!department) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không tìm thấy thông tin phòng ban</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
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
          <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
            Chi tiết phòng ban
          </Typography>
          
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={loading}
                sx={{
                  borderColor: '#929292',
                  color: '#929292',
                  '&:hover': {
                    borderColor: '#6f6f6f',
                    color: '#6f6f6f'
                  }
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
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
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
            >
              Chỉnh sửa
            </Button>
          )}
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
                Thông tin phòng ban
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Mã phòng ban
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      error={!!formErrors.code}
                      helperText={formErrors.code}
                      size="small"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {department.code}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Tên phòng ban
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      size="small"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {department.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Phòng ban cha
                  </Typography>
                  {isEditing ? (
                    <FormControl fullWidth size="small">
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
                  ) : (
                    <Typography variant="body1">
                      {department.parentDepartment?.name || 'Không có'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Trạng thái
                  </Typography>
                  {isEditing ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.status === 1}
                          onChange={handleStatusChange}
                          color="primary"
                        />
                      }
                      label={formData.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                    />
                  ) : (
                    <Chip
                      label={department.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                      color={department.status === 1 ? 'success' : 'error'}
                      size="small"
                    />
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Mô tả
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Typography variant="body1">
                      {department.description || 'Không có mô tả'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1">
                    {department.createdDate ? new Date(department.createdDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Ngày cập nhật
                  </Typography>
                  <Typography variant="body1">
                    {department.modifiedDate ? new Date(department.modifiedDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PeopleIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  Danh sách nhân viên ({departmentStaff.length})
                </Typography>
              </Box>

              {departmentStaff.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Tên</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Chức vụ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departmentStaff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>{staff.name}</TableCell>
                          <TableCell>{staff.position || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Chưa có nhân viên nào
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DepartmentDetail; 