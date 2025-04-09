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
import departmentService from '../services/departmentService';

const mockData = [
  { id: 1, code: 'KT01', name: 'Phòng kế toán', parentName: 'Phòng kế toán', active: true, updatedAt: '16/07/2021' },
  { id: 2, code: 'KT', name: 'Phòng kế toán', parentName: null, active: true, updatedAt: '16/07/2021' },
  { id: 3, code: 'HC02', name: 'Tổ hành hành chính', parentName: 'Phòng hành chính', active: true, updatedAt: '16/07/2021' },
  { id: 4, code: 'HC01', name: 'Phòng hành chính', parentName: null, active: true, updatedAt: '16/07/2021' }
];

const DepartmentList = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState(mockData);
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const rowsPerPage = 10;



  const handleViewDetail = (department) => {
    setDepartmentStaff([]);
    setSelectedDepartment(department);
    setOpenDetailDialog(true);
  };

  const handleDelete = () => {
    setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
    setOpenDeleteDialog(false);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>DANH SÁCH BỘ PHẬN</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tên, mã bộ phận"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
        />
        <TextField
          size="small"
          placeholder="Tên bộ phận cha"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
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
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }}
          onClick={() => {
            setDialogType('create');
            setOpenDialog(true);
          }}
        >
          Tạo bộ phận
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Mã bộ phận</TableCell>
              <TableCell>Tên bộ phận</TableCell>
              <TableCell>Tên bộ phận cha</TableCell>
              <TableCell>Hoạt động</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.parentName || '-'}</TableCell>
                <TableCell>
                  <Switch checked={row.active} />
                </TableCell>
                <TableCell>{row.updatedAt}</TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small"
                    onClick={() => handleViewDetail(row)}
                    sx={{ mr: 1 }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setDialogType('edit');
                      setSelectedDepartment(row);
                      setOpenDialog(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setSelectedDepartment(row);
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
          count={Math.ceil(mockData.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>



      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'create' ? 'Tạo bộ phận mới' : 'Chỉnh sửa bộ phận'}
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mã bộ phận"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tên bộ phận"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Bộ phận cha</InputLabel>
                  <Select
                    label="Bộ phận cha"
                  >
                    <MenuItem value="">Không có</MenuItem>
                    <MenuItem value="dept1">Phòng kế toán</MenuItem>
                    <MenuItem value="dept2">Phòng hành chính</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary">
            {dialogType === 'create' ? 'Tạo' : 'Lưu'}
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