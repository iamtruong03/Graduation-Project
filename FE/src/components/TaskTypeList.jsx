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

const TaskTypeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [taskTypes, setTaskTypes] = useState([
    { id: 1, code: 'DEV', name: 'Phát triển', description: 'Công việc phát triển phần mềm' },
    { id: 2, code: 'TEST', name: 'Kiểm thử', description: 'Công việc kiểm thử phần mềm' },
    { id: 3, code: 'DOC', name: 'Tài liệu', description: 'Công việc viết tài liệu' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = (taskType = null) => {
    if (taskType) {
      setSelectedTaskType(taskType);
      setFormData(taskType);
    } else {
      setSelectedTaskType(null);
      setFormData({ code: '', name: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTaskType(null);
    setFormData({ code: '', name: '', description: '' });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (selectedTaskType) {
      // Update existing task type
      setTaskTypes((prev) =>
        prev.map((type) =>
          type.id === selectedTaskType.id ? { ...type, ...formData } : type
        )
      );
    } else {
      // Add new task type
      const newTaskType = {
        id: taskTypes.length + 1,
        ...formData,
      };
      setTaskTypes((prev) => [...prev, newTaskType]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setTaskTypes((prev) => prev.filter((type) => type.id !== id));
  };

  const filteredTaskTypes = taskTypes.filter(
    (type) =>
      type.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Danh sách loại công việc
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 250 }}
          placeholder="Tìm theo mã hoặc tên loại công việc"
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ml: 'auto' }}
          onClick={() => handleOpenDialog()}
        >
          Thêm loại công việc
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã loại</TableCell>
              <TableCell>Tên loại</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTaskTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.code}</TableCell>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.description}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(type)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(type.id)}
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
          {selectedTaskType ? 'Chỉnh sửa loại công việc' : 'Thêm loại công việc'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Mã loại"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              label="Tên loại"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTaskType ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskTypeList;