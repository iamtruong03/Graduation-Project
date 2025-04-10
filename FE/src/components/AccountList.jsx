import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Switch,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import staffService from '../services/staffService';
import departmentService from '../services/departmentService';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const AccountList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [positionId, setPositionId] = useState('all');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await staffService.getAllStaff();
        setAccounts(response.data);
        // Lấy role của người dùng hiện tại từ localStorage hoặc context
        const userRole = localStorage.getItem('userRole') || '';
        setCurrentUserRole(userRole);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách tài khoản');
        console.error('Error fetching accounts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [departments, setDepartments] = useState([]);

  const positionMap = {
    1: 'Nhân viên',
    2: 'Trưởng phòng',
    3: 'Phó phòng'
  };

  const roles = [
    { value: 'user', label: 'Người dùng' },
    { value: 'admin', label: 'Quản trị viên' }
  ];

  const departmentNames = {
    1: 'Phòng Nhân sự',
    2: 'Phòng Kỹ thuật',
    3: 'Phòng Kế toán',
    4: 'Phòng Marketing',
  };

  const [formData, setFormData] = useState({
    departmentId: '',
    positionId: '',
    phoneNumber: '',
    email: '',
    password: '',
    startDate: null,
    role: '',
    address: '',
    gender: ''
  });
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAllDepartments();
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleDelete = async () => {
    try {
      await staffService.deleteStaff(selectedAccount.id);
      setAccounts(accounts.filter(acc => acc.id !== selectedAccount.id));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Không thể xóa tài khoản');
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await staffService.createStaff(formData);
      setAccounts([...accounts, response.data]);
      setOpenDialog(false);
      setError(null);
    } catch (error) {
      console.error('Error creating staff:', error);
      setError('Không thể tạo tài khoản');
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>QUẢN LÝ TÀI KHOẢN</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tên đăng nhập, họ tên, email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Chức vụ</InputLabel>
          <Select
            value={positionId}
            label="Chức vụ"
            onChange={(e) => setPositionId(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value={1}>Nhân viên</MenuItem>
            <MenuItem value={2}>Trưởng phòng</MenuItem>
            <MenuItem value={3}>Giám đốc</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={status}
            label="Trạng thái"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="active">Hoạt động</MenuItem>
            <MenuItem value="inactive">Không hoạt động</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }}
          onClick={() => {
            setDialogType('create');
            setOpenDialog(true);
          }}
        >
          Tạo tài khoản
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phòng ban</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Hoạt động</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{departmentNames[row.departmentId] || '---'}</TableCell>
                <TableCell>{positionMap[row.positionId] || row.positionId}</TableCell>
                <TableCell>
                  <Switch checked={row.active} />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setDialogType('edit');
                      setSelectedAccount(row);
                      setOpenDialog(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setSelectedAccount(row);
                      setOpenDeleteDialog(true);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(accounts.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'create' ? 'Tạo tài khoản mới' : 'Chỉnh sửa tài khoản'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phòng ban</InputLabel>
                  <Select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleFormChange}
                    label="Phòng ban"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Chức vụ</InputLabel>
                  <Select
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleFormChange}
                    label="Chức vụ"
                  >
                    {Object.entries(positionMap).map(([id, name]) => (
                      <MenuItem key={id} value={Number(id)}>{name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={formData.startDate}
                    onChange={(newValue) => {
                      setFormData(prev => ({ ...prev, startDate: newValue }))
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" disabled={currentUserRole !== 'admin'}>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    label="Vai trò"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {currentUserRole !== 'admin' && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      Chỉ admin mới có quyền thay đổi vai trò
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    label="Giới tính"
                  >
                    <MenuItem value="male">Nam</MenuItem>
                    <MenuItem value="female">Nữ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary">
            {dialogType === 'create' ? 'Tạo' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa tài khoản "{selectedAccount?.username}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountList;