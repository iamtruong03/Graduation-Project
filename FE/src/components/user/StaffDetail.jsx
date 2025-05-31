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
  Alert as MuiAlert,
  Snackbar,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as WcIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import staffService from '../../services/staffService';
import departmentService from '../../services/departmentService';
import { validateEmail, validatePhone, getEmailError, getPhoneError } from '../../utils/validation';
import AddressSelect from '../common/AddressSelect';

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [staff, setStaff] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    departmentId: '',
    positionId: '',
    email: '',
    phoneNumber: '',
    status: 1,
    birthday: '',
    gender: '',
    address: '',
    startDate: '',
    role: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    phoneNumber: ''
  });

  const positionOptions = [
    { id: 1, name: 'Quản lý' },
    { id: 2, name: 'Nhân viên' }
  ];

  const roleOptions = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];

  const genderOptions = [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
    { value: 'OTHER', label: 'Khác' }
  ];

  useEffect(() => {
    if (id) {
      fetchStaffDetail();
      fetchDepartments();
    }
  }, [id]);

  const fetchStaffDetail = async () => {
    try {
      setLoading(true);
      const response = await staffService.getUserById(id);
      if (response.data) {
        const staffData = response.data;
        setStaff(staffData);
        setFormData({
          code: staffData.code || '',
          name: staffData.name || '',
          departmentId: staffData.departmentId || '',
          positionId: staffData.positionId || '',
          email: staffData.email || '',
          phoneNumber: staffData.phoneNumber || '',
          status: staffData.status || 1,
          birthday: staffData.birthday || '',
          gender: staffData.gender || '',
          address: staffData.address || '',
          startDate: staffData.startDate || '',
          role: staffData.role || ''
        });
      }
    } catch (err) {
      setError('Không thể tải thông tin nhân viên');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      if (response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng ban:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate email and phone
    if (name === 'email') {
      setFormErrors(prev => ({
        ...prev,
        email: getEmailError(value)
      }));
    }
    if (name === 'phoneNumber') {
      setFormErrors(prev => ({
        ...prev,
        phoneNumber: getPhoneError(value)
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      code: staff.code || '',
      name: staff.name || '',
      departmentId: staff.departmentId || '',
      positionId: staff.positionId || '',
      email: staff.email || '',
      phoneNumber: staff.phoneNumber || '',
      status: staff.status || 1,
      birthday: staff.birthday || '',
      gender: staff.gender || '',
      address: staff.address || '',
      startDate: staff.startDate || '',
      role: staff.role || ''
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    // Validate before saving
    const emailError = getEmailError(formData.email);
    const phoneError = getPhoneError(formData.phoneNumber);

    if (emailError || phoneError) {
      setFormErrors({
        email: emailError,
        phoneNumber: phoneError
      });
      setSnackbar({
        open: true,
        message: 'Vui lòng kiểm tra lại thông tin',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { role, ...updateData } = formData;
      // Địa chỉ đã được format từ AddressSelect
      const response = await staffService.updateStaff(id, updateData);
      
      if (response.status === 200) {
        setIsEditing(false);
        await fetchStaffDetail();
        setSnackbar({
          open: true,
          message: 'Cập nhật thông tin nhân viên thành công',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Có lỗi xảy ra khi cập nhật nhân viên',
          severity: 'error'
        });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setSnackbar({
          open: true,
          message: err.response.data.message,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể cập nhật nhân viên. Vui lòng thử lại sau.',
          severity: 'error'
        });
      }
      console.error('Error updating staff:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !staff) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!staff) {
    return (
      <Box sx={{ p: 3 }}>
        <MuiAlert severity="error">Không tìm thấy thông tin nhân viên</MuiAlert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/staff/management')}
            variant="text"
          >
            Quay lại
          </Button>
          <Typography variant="h5" sx={{ flex: 1 }}>
        Chi tiết nhân viên
          </Typography>
          
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
          Chỉnh sửa
        </Button>
          )}
        </Stack>

        {error && (
          <MuiAlert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </MuiAlert>
        )}

        <Grid container spacing={3}>
          {/* Thông tin cơ bản */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2, 
                pb: 1, 
                borderBottom: '1px solid #e0e0e0' 
              }}>
                <PersonIcon sx={{ color: '#1976d2', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  Thông tin cơ bản
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Vai trò
                    </Typography>
                    <Chip
                      label={roleOptions.find(r => r.id === Number(staff.role))?.name || '---'}
                      color="primary"
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        backgroundColor: '#1976d2',
                        '& .MuiChip-label': {
                          px: 2
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Mã nhân viên
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        size="small"
                        sx={{ backgroundColor: 'white' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.code}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Họ và tên
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        size="small"
                        sx={{ backgroundColor: 'white' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.name}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Giới tính
                    </Typography>
                    {isEditing ? (
                      <FormControl fullWidth size="small" sx={{ backgroundColor: 'white' }}>
                        <Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          {genderOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {genderOptions.find(g => g.value === staff.gender)?.label || '---'}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Ngày sinh
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        size="small"
                        sx={{ backgroundColor: 'white' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.birthday ? new Date(staff.birthday).toLocaleDateString('vi-VN') : '---'}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Thông tin công việc */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2, 
                pb: 1, 
                borderBottom: '1px solid #e0e0e0' 
              }}>
                <WorkIcon sx={{ color: '#1976d2', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  Thông tin công việc
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Phòng ban
                    </Typography>
                    {isEditing ? (
                      <FormControl fullWidth size="small" sx={{ backgroundColor: 'white' }}>
                        <Select
                          name="departmentId"
                          value={formData.departmentId}
                          onChange={handleInputChange}
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {departments.find(d => d.id === staff.departmentId)?.name || '---'}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Chức vụ
                    </Typography>
                    {isEditing ? (
                      <FormControl fullWidth size="small" sx={{ backgroundColor: 'white' }}>
                        <Select
                          name="positionId"
                          value={formData.positionId}
                          onChange={handleInputChange}
                        >
                          {positionOptions.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {positionOptions.find(p => p.id === staff.positionId)?.name || '---'}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Ngày vào làm
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        size="small"
                        sx={{ backgroundColor: 'white' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.startDate ? new Date(staff.startDate).toLocaleDateString('vi-VN') : '---'}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Thông tin liên hệ */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0', color: '#1976d2' }}>
                Thông tin liên hệ
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Email
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      size="small"
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {staff.email}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Số điện thoại
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      size="small"
                      error={!!formErrors.phoneNumber}
                      helperText={formErrors.phoneNumber}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {staff.phoneNumber}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Địa chỉ
                  </Typography>
                  {isEditing ? (
                    <AddressSelect
                      value={formData.address}
                      onChange={(value) => handleInputChange({ target: { name: 'address', value } })}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {staff.address || '---'}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

export default StaffDetail;