import React, { useState } from 'react';
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

const mockData = [
  { id: 1, username: 'user1', fullName: 'Nguyễn Văn A', email: 'nguyenvana@example.com', department: 'Phòng kế toán', role: 'Nhân viên', active: true, lastLogin: '20/07/2023' },
  { id: 2, username: 'user2', fullName: 'Trần Thị B', email: 'tranthib@example.com', department: 'Phòng hành chính', role: 'Trưởng phòng', active: true, lastLogin: '19/07/2023' },
  { id: 3, username: 'user3', fullName: 'Lê Văn C', email: 'levanc@example.com', department: 'Phòng kỹ thuật', role: 'Nhân viên', active: false, lastLogin: '18/07/2023' },
];

const AccountList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState(mockData);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const rowsPerPage = 10;

  const handleDelete = () => {
    setAccounts(accounts.filter(acc => acc.id !== selectedAccount.id));
    setOpenDeleteDialog(false);
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
          <InputLabel>Vai trò</InputLabel>
          <Select
            value={role}
            label="Vai trò"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="staff">Nhân viên</MenuItem>
            <MenuItem value="manager">Trưởng phòng</MenuItem>
            <MenuItem value="admin">Quản trị viên</MenuItem>
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
              <TableCell>Đăng nhập cuối</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>{row.fullName}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>
                  <Switch checked={row.active} />
                </TableCell>
                <TableCell>{row.lastLogin}</TableCell>
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
                <TextField
                  fullWidth
                  size="small"
                  label="Tên đăng nhập"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Họ tên"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phòng ban</InputLabel>
                  <Select label="Phòng ban">
                    <MenuItem value="accounting">Phòng kế toán</MenuItem>
                    <MenuItem value="hr">Phòng hành chính</MenuItem>
                    <MenuItem value="tech">Phòng kỹ thuật</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Vai trò</InputLabel>
                  <Select label="Vai trò">
                    <MenuItem value="staff">Nhân viên</MenuItem>
                    <MenuItem value="manager">Trưởng phòng</MenuItem>
                    <MenuItem value="admin">Quản trị viên</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {dialogType === 'create' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mật khẩu"
                    type="password"
                    required
                  />
                </Grid>
              )}
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