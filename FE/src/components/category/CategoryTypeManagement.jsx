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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import categoryTypeService from '../../services/categoryTypeService';

const CategoryTypeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchCategoryTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = {
        search: searchTerm
      };
      const response = await categoryTypeService.searchCategoryTypes(filter, page - 1, rowsPerPage);
      setCategoryTypes(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Không thể tải danh sách loại danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTypes();
    // eslint-disable-next-line
  }, [searchTerm, page]);

  const handleOpenCreateDialog = () => {
    setDialogType('create');
    setSelectedCategory(null);
    setFormData({
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

  const validateForm = () => {
    const errors = {};
    if (!formData.code) errors.code = 'Vui lòng nhập mã loại danh mục';
    if (!formData.name) errors.name = 'Vui lòng nhập tên loại danh mục';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        status: dialogType === 'create' ? 1 : selectedCategory.status // 1 là trạng thái active
      };

      if (dialogType === 'create') {
        await categoryTypeService.createCategoryType(submitData);
      } else {
        await categoryTypeService.updateCategoryType(selectedCategory.id, submitData);
      }
      
      // Refresh danh sách sau khi thêm/sửa
      await fetchCategoryTypes();
      handleCloseDialog();
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu loại danh mục: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await categoryTypeService.deleteCategoryType(selectedCategory.id);
      
      // Refresh danh sách sau khi xóa
      await fetchCategoryTypes();
      handleCloseDeleteDialog();
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa loại danh mục: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (category) => {
    setLoading(true);
    try {
      await categoryTypeService.changeStatus(category.id);
      // Refresh danh sách sau khi thay đổi trạng thái
      await fetchCategoryTypes();
    } catch (err) {
      setError('Có lỗi xảy ra khi thay đổi trạng thái: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

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
          QUẢN LÝ LOẠI DANH MỤC
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
            placeholder="Tìm kiếm theo mã, tên loại danh mục"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon color="action" />
            }}
            sx={{ 
              minWidth: 300,
              backgroundColor: '#fff'
            }}
          />

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
            THÊM LOẠI DANH MỤC
          </Button>
        </Stack>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

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
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mã loại danh mục</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên loại danh mục</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mô tả</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categoryTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Không tìm thấy dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categoryTypes.map((category, index) => (
                  <TableRow 
                    key={category.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{category.code}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(category)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(category)}
                        sx={{ mr: 1 }}
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
          <Typography variant="body2" color="text.secondary">
            Tổng số: {categoryTypes.length} loại danh mục
          </Typography>
        </Box>
      </Paper>

      {/* Dialog thêm/sửa loại danh mục */}
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
          {dialogType === 'create' ? 'Thêm loại danh mục mới' : 'Chỉnh sửa loại danh mục'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Mã loại danh mục"
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
                label="Tên loại danh mục"
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
          <Typography>
            Bạn có chắc chắn muốn xóa loại danh mục "{selectedCategory?.name}" không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
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
            onClick={handleDelete}
            disabled={loading}
            color="error"
            variant="contained"
            sx={{
              '&:hover': {
                backgroundColor: '#c62828'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryTypeManagement; 