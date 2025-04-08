import React, { useState } from 'react';
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const DepartmentTypeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentTypes, setDepartmentTypes] = useState([
    { id: 1, code: 'PB', name: 'Phòng ban', description: 'Đơn vị cấp phòng ban' },
    { id: 2, code: 'TT', name: 'Trung tâm', description: 'Đơn vị cấp trung tâm' },
    { id: 3, code: 'CN', name: 'Chi nhánh', description: 'Đơn vị cấp chi nhánh' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = (type = null) => {
    if (type) {
      setSelectedType(type);
      setFormData(type);
    } else {
      setSelectedType(null);
      setFormData({ code: '', name: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedType(null);
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
    if (selectedType) {
      // Update existing department type
      setDepartmentTypes((prev) =>
        prev.map((type) =>
          type.id === selectedType.id ? { ...type, ...formData } : type
        )
      );
    } else {
      // Add new department type
      const newType = {
        id: departmentTypes.length + 1,
        ...formData,
      };
      setDepartmentTypes((prev) => [...prev, newType]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setDepartmentTypes((prev) => prev.filter((type) => type.id !== id));
  };

  const filteredTypes = departmentTypes.filter(
    (type) =>
      type.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Danh sách loại phòng ban
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 250 }}
          placeholder="Tìm theo mã hoặc tên loại phòng ban"
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ml: 'auto' }}
          onClick={() => handleOpenDialog()}
        >
          Thêm loại phòng ban
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
            {filteredTypes.map((type) => (
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
          {selectedType ? 'Chỉnh sửa loại phòng ban' : 'Thêm loại phòng ban'}
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
            {selectedType ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentTypeList;