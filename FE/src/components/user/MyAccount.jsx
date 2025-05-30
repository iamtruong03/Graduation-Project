import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import api from '../../services/api';
import staffService from '../../services/staffService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, isValid } from 'date-fns';

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [alert, setAlert] = useState(null);

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
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await api.get('/user/current-user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response && response.data) {
          let departmentName = '';
          if (response.data.departmentId) {
            try {
              const deptResponse = await api.get(`/department/${response.data.departmentId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              if (deptResponse && deptResponse.data) {
                departmentName = deptResponse.data.name;
              }
            } catch (error) {
              console.error('Error fetching department:', error);
            }
          }

          let birthday = null;
          if (response.data.birthday) {
            try {
              birthday = parse(response.data.birthday, 'yyyy-MM-dd', new Date());
              if (!isValid(birthday)) {
                birthday = null;
              }
            } catch (error) {
              console.error('Error parsing birthday:', error);
              birthday = null;
            }
          }

          const userData = {
            id: response.data.id,
            username: response.data.code || '',
            fullName: response.data.name || '',
            birthday: birthday,
            gender: response.data.gender || '',
            email: response.data.email || '',
            department: departmentName || '',
            departmentId: response.data.departmentId || '',
            role: response.data.role || '',
            positionId: response.data.positionId || '',
            phone: response.data.phoneNumber || '',
            address: response.data.address || '',
            startDate: response.data.startDate || '',
            password: response.data.password || '',
          };

          setUser(userData);
          setFormData(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setAlert({
          type: 'error',
          message: 'Không thể lấy thông tin người dùng. Vui lòng thử lại sau.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(user);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const userId = user.id;
      
      if (!userId) {
        throw new Error('Không tìm thấy ID người dùng');
      }
      
      const formattedBirthday = formData.birthday ? format(formData.birthday, 'yyyy-MM-dd') : null;
      
      const userData = {
        code: formData.username,
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        birthday: formattedBirthday,
        gender: formData.gender,
        departmentId: formData.departmentId,
        role: formData.role,
        positionId: formData.positionId,
        address: formData.address,
        startDate: formData.startDate,
        password: formData.password,
        status: 1
      };

      await staffService.updateStaff(userId, userData);
      
      setUser(formData);
      setIsEditing(false);
      setAlert({
        type: 'success',
        message: 'Cập nhật thông tin thành công!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại sau.'
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({
        type: 'error',
        message: 'Mật khẩu mới không khớp!'
      });
      return;
    }

    try {
      await api.post('/user/update-password', {
        password: passwordForm.password,
        newPassword: passwordForm.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setAlert({
        type: 'success',
        message: 'Đổi mật khẩu thành công!'
      });
      setOpenPasswordDialog(false);
      setPasswordForm({
        password: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại sau.'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">THÔNG TIN TÀI KHOẢN</Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateProfile}
            >
              Lưu
            </Button>
          </Stack>
        )}
      </Box>
      
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ tên"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày sinh"
                  value={formData.birthday}
                  onChange={(newValue) => handleInputChange('birthday', newValue)}
                  format="dd/MM/yyyy"
                  disabled={!isEditing}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: false
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="Giới tính"
                  disabled={!isEditing}
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phòng ban"
                value={formData.department}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vai trò"
                value={roleOptions.find(r => r.id === Number(formData.role))?.name || '---'}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chức vụ"
                value={positionOptions.find(p => p.id === formData.positionId)?.name || '---'}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                multiline
                rows={2}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>

          {!isEditing && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenPasswordDialog(true)}
              sx={{ mt: 3 }}
            >
              Đổi mật khẩu
            </Button>
          )}
        </Paper>
      ) : (
        <Alert severity="error">Không thể tải thông tin người dùng</Alert>
      )}

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                type="password"
                label="Mật khẩu hiện tại"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  password: e.target.value
                })}
              />
              <TextField
                fullWidth
                type="password"
                label="Mật khẩu mới"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value
                })}
              />
              <TextField
                fullWidth
                type="password"
                label="Xác nhận mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value
                })}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Hủy</Button>
          <Button onClick={handleChangePassword} variant="contained" color="primary">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAccount;