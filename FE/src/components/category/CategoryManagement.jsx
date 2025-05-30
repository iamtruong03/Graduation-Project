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
  Grid,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Add as AddIcon } from '@mui/icons-material';
import categoryService from '../../services/categoryService';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryType, setCategoryType] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Thêm state mới cho form
  const [formData, setFormData] = useState({
    type: '',
    code: '',
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const handleOpenCreateDialog = () => {
    setDialogType('create');
    setSelectedCategory(null);
    setFormData({
      type: '',
      code: '',
      name: '',
      description: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (category) => {
    setDialogType('edit');
    setSelectedCategory(category);
    setFormData({
      type: category.type,
      code: category.code,
      name: category.name,
      description: category.description
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (category) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setFormData({
      type: '',
      code: '',
      name: '',
      description: ''
    });
    setFormErrors({});
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

  const validateForm = () => {
    const errors = {};
    if (!formData.type) errors.type = 'Vui lòng chọn loại danh mục';
    if (!formData.code) errors.code = 'Vui lòng nhập mã danh mục';
    if (!formData.name) errors.name = 'Vui lòng nhập tên danh mục';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Thêm API call để lưu danh mục
      console.log('Submitting form data:', formData);
      
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      handleCloseDialog();
      // TODO: Refresh danh sách danh mục
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu danh mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Xóa lỗi khi user bắt đầu nhập
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Fetch API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = {
        search: searchTerm,
        type: categoryType !== 'all' ? categoryType : undefined
      };
      const response = await categoryService.searchCategories(filter, page - 1, rowsPerPage);
      setCategories(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [searchTerm, categoryType, page]);

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            color: '#1976d2',
            borderBottom: '2px solid #1976d2',
            pb: 1
          }}
        >
          QUẢN LÝ DANH MỤC
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm kiếm theo mã, tên danh mục"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon color="action" />
            }}
            sx={{ 
              minWidth: 250,
              backgroundColor: '#fff'
            }}
          />
          
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 200,
              backgroundColor: '#fff'
            }}
          >
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
            onClick={handleOpenCreateDialog}
            startIcon={<AddIcon />}
            sx={{ 
              ml: 'auto',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            THÊM DANH MỤC
          </Button>
        </Stack>

        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 1,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>STT</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mã danh mục</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên danh mục</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Loại danh mục</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mô tả</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 2,
                        '& .MuiAlert-icon': {
                          color: '#d32f2f'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress sx={{ color: '#1976d2' }} />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Không tìm thấy dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((row, index) => (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.type === 'task_type' ? 'Loại công việc' : 'Loại phòng ban'} 
                        size="small"
                        sx={{ 
                          backgroundColor: row.type === 'task_type' ? '#1976d2' : '#9c27b0',
                          color: '#fff'
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: '#fff',
          borderRadius: 1,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" color="text.secondary">
              Tổng {categories.length} bản ghi
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* Dialog thêm/sửa danh mục */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
          color: '#1976d2',
          fontWeight: 600
        }}>
          {dialogType === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" error={!!formErrors.type}>
                <InputLabel>Loại danh mục</InputLabel>
                <Select
                  label="Loại danh mục"
                  value={formData.type}
                  onChange={handleInputChange('type')}
                >
                  <MenuItem value="task_type">Loại công việc</MenuItem>
                  <MenuItem value="department_type">Loại phòng ban</MenuItem>
                </Select>
                {formErrors.type && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {formErrors.type}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Mã danh mục"
                value={formData.code}
                onChange={handleInputChange('code')}
                error={!!formErrors.code}
                helperText={formErrors.code}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Tên danh mục"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Mô tả"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange('description')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleCloseDialog}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : dialogType === 'create' ? 'Thêm' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#d32f2f',
          pb: 1
        }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa danh mục này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{
              '&:hover': {
                backgroundColor: '#c62828'
              }
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;