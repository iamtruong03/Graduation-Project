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
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import departmentService from '../../services/departmentService';

const DepartmentList = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    parentId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const validateForm = () => {
    const errors = {};
    if (!formData.code) errors.code = 'Vui lòng nhập mã bộ phận';
    if (!formData.name) errors.name = 'Vui lòng nhập tên bộ phận';
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

  const handleCreateDepartment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await departmentService.createDepartment({
        ...formData,
        status: 1
      });
      
      await fetchDepartments(); // Tải lại danh sách sau khi tạo mới
      setOpenDialog(false);
      setFormData({ code: '', name: '', parentId: '' });
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo phòng ban');
      console.error('Error creating department:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await departmentService.updateDepartment(selectedDepartment.id, {
        ...formData,
        status: selectedDepartment.active ? 1 : 0
      });
      
      await fetchDepartments(); // Tải lại danh sách sau khi cập nhật
      setOpenDialog(false);
      setFormData({ code: '', name: '', parentId: '' });
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật phòng ban');
      console.error('Error updating department:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, searchName, status]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.searchDepartments(
        searchName,
        page - 1,
        rowsPerPage
      );
      
      const mappedDepartments = response.data.content.map(dept => ({
        id: dept.id,
        code: dept.code,
        name: dept.name,
        description: dept.description,
        active: dept.status === 1,
        parentName: dept.parentDepartment?.name || null,
        updatedAt: new Date(dept.modifiedDate).toLocaleDateString('vi-VN')
      }));
      
      setDepartments(mappedDepartments);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách phòng ban');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (department) => {
    setDialogType('edit');
    setSelectedDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
      parentId: departments.find(d => d.name === department.parentName)?.id || ''
    });
    setOpenDialog(true);
  };

  const handleViewDetail = (department) => {
    setDepartmentStaff([]);
    setSelectedDepartment(department);
    setOpenDetailDialog(true);
  };

  const handleDelete = async () => {
    try {
      await departmentService.deleteDepartment(selectedDepartment.id);
      setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
      setOpenDeleteDialog(false);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa phòng ban');
      console.error('Error deleting department:', err);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedDepartments = departments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>DANH SÁCH PHÒNG BAN</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tên, mã phòng ban"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          InputProps={{ endAdornment: <SearchIcon color="action" /> }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái hoạt động</InputLabel>
          <Select
            value={status}
            label="Trạng thái hoạt động"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="active">Hoạt động</MenuItem>
            <MenuItem value="inactive">Không hoạt động</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" sx={{ ml: 'auto' }} onClick={() => {
          setDialogType('create');
          setOpenDialog(true);
        }}>
          Tạo phòng ban
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Mã phòng ban</TableCell>
              <TableCell>Tên phòng ban</TableCell>
              <TableCell>Tên phòng ban cha</TableCell>
              <TableCell>Hoạt động</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                </TableCell>
              </TableRow>
            )}
            {paginatedDepartments.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.parentName || '-'}</TableCell>
                <TableCell><Switch checked={row.active} /></TableCell>
                <TableCell>{row.updatedAt}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleViewDetail(row)} sx={{ mr: 1 }}><VisibilityIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleOpenEditDialog(row)} sx={{ mr: 1 }}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => {
                    setSelectedDepartment(row);
                    setOpenDeleteDialog(true);
                  }} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'create' ? 'Tạo phòng ban mới' : 'Chỉnh sửa phòng ban'}
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mã phòng ban"
                  required
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  error={!!formErrors.code}
                  helperText={formErrors.code}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tên phòng ban"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phòng ban cha</InputLabel>
                  <Select
                    label="Phòng ban cha"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Không có</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={dialogType === 'create' ? handleCreateDepartment : handleUpdateDepartment}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (dialogType === 'create' ? 'Tạo' : 'Lưu')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết phòng ban</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Thông tin cơ bản</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography><strong>Mã phòng ban:</strong> {selectedDepartment?.code}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>Tên phòng ban:</strong> {selectedDepartment?.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>Phòng ban cha:</strong> {selectedDepartment?.parentName || 'Không có'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>Trạng thái:</strong> {selectedDepartment?.active ? 'Hoạt động' : 'Không hoạt động'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="subtitle1" gutterBottom>Danh sách nhân viên</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Mã nhân viên</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Chức vụ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departmentStaff.map((staff, index) => (
                  <TableRow key={staff.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{staff.code}</TableCell>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.position}</TableCell>
                  </TableRow>
                ))}
                {departmentStaff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Không có nhân viên</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa phòng ban</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa phòng ban "{selectedDepartment?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentList;