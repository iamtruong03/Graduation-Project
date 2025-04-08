import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const TaskStatusList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statuses, setStatuses] = useState([
    { id: 1, code: 'NEW', name: 'Mới', color: '#4caf50' },
    { id: 2, code: 'IN_PROGRESS', name: 'Đang thực hiện', color: '#2196f3' },
    { id: 3, code: 'REVIEW', name: 'Đang kiểm tra', color: '#ff9800' },
    { id: 4, code: 'DONE', name: 'Hoàn thành', color: '#9c27b0' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    color: '#000000',
  });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = (status = null) => {
    if (status) {
      setSelectedStatus(status);
      setFormData(status);
    } else {
      setSelectedStatus(null);
      setFormData({ code: '', name: '', color: '#000000' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStatus(null);
    setFormData({ code: '', name: '', color: '#000000' });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (selectedStatus) {
      // Update existing status
      setStatuses((prev) =>
        prev.map((status) =>
          status.id === selectedStatus.id ? { ...status, ...formData } : status
        )
      );
    } else {
      // Add new status
      const newStatus = {
        id: statuses.length + 1,
        ...formData,
      };
      setStatuses((prev) => [...prev, newStatus]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setStatuses((prev) => prev.filter((status) => status.id !== id));
  };

  const filteredStatuses = statuses.filter(
    (status) =>
      status.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Danh sách trạng thái công việc
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 250 }}
          placeholder="Tìm theo mã hoặc tên trạng thái"
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ml: 'auto' }}
          onClick={() => handleOpenDialog()}
        >
          Thêm trạng thái
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã trạng thái</TableCell>
              <TableCell>Tên trạng thái</TableCell>
              <TableCell>Màu sắc</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStatuses.map((status) => (
              <TableRow key={status.id}>
                <TableCell>{status.code}</TableCell>
                <TableCell>{status.name}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 100,
                      height: 24,
                      backgroundColor: status.color,
                      borderRadius: 1,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(status)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(status.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedStatus ? 'Chỉnh sửa trạng thái' : 'Thêm trạng thái'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Mã trạng thái"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              label="Tên trạng thái"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              label="Màu sắc"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleFormChange}
              sx={{ '& input': { p: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedStatus ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskStatusList;