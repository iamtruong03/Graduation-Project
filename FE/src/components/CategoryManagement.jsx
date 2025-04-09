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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const mockData = [
  { id: 1, code: 'TASK_TYPE_01', name: 'Phát triển', type: 'task_type', description: 'Công việc phát triển tính năng mới', active: true },
  { id: 2, code: 'TASK_TYPE_02', name: 'Bảo trì', type: 'task_type', description: 'Công việc bảo trì hệ thống', active: true },
  { id: 3, code: 'DEPT_TYPE_01', name: 'Phòng ban chuyên môn', type: 'department_type', description: 'Phòng ban thực hiện các công việc chuyên môn', active: true },
  { id: 4, code: 'DEPT_TYPE_02', name: 'Phòng ban hỗ trợ', type: 'department_type', description: 'Phòng ban hỗ trợ hoạt động', active: false },
];

const CategoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryType, setCategoryType] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleOpenCreateDialog = () => {
    setDialogType('create');
    setSelectedCategory(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (category) => {
    setDialogType('edit');
    setSelectedCategory(category);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (category) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCategory(null);
  };

  const handleDelete = () => {
    // Thực hiện xóa danh mục
    setOpenDeleteDialog(false);
    setSelectedCategory(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        QUẢN LÝ DANH MỤC
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm theo mã, tên danh mục"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Loại danh mục</InputLabel>
          <Select
            value={categoryType}
            label="Loại danh mục"
            onChange={(e) => setCategoryType(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="task_type">Loại công việc</MenuItem>
            <MenuItem value="department_type">Loại phòng ban</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }}
          onClick={handleOpenCreateDialog}
        >
          Thêm danh mục
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Mã danh mục</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Loại danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {row.type === 'task_type' ? 'Loại công việc' : 'Loại phòng ban'}
                </TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>
                  {row.active ? 'Hoạt động' : 'Không hoạt động'}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEditDialog(row)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleOpenDeleteDialog(row)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog thêm/sửa danh mục */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogType === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Loại danh mục</InputLabel>
                  <Select
                    label="Loại danh mục"
                    defaultValue={selectedCategory?.type || ''}
                  >
                    <MenuItem value="task_type">Loại công việc</MenuItem>
                    <MenuItem value="department_type">Loại phòng ban</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mã danh mục"
                  defaultValue={selectedCategory?.code || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tên danh mục"
                  defaultValue={selectedCategory?.name || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mô tả"
                  multiline
                  rows={3}
                  defaultValue={selectedCategory?.description || ''}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {dialogType === 'create' ? 'Thêm' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa danh mục này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;