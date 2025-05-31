import React, { useState, useEffect } from 'react';
import { FileDownload as FileDownloadIcon, Add as AddIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert as MuiAlert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import riskService from '../../services/riskService';
import categoryService from '../../services/categoryService';
import staffService from '../../services/staffService';

const RiskList = () => {
  const [risks, setRisks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [riskType, setRiskType] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rowsPerPage = 10;
  const [riskTypes, setRiskTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [impactLevels, setImpactLevels] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch API
  const fetchRisks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await riskService.searchRisks({ search: searchName }, page - 1, rowsPerPage);
      setRisks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Không thể tải danh sách rủi ro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
    // eslint-disable-next-line
  }, [page, searchName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách loại rủi ro
        const riskTypesResponse = await categoryService.getCategoriesByType('riskTypeId');
        if (riskTypesResponse && riskTypesResponse.data) {
          setRiskTypes(riskTypesResponse.data);
        }

        // Lấy danh sách mức độ ảnh hưởng
        const impactLevelsResponse = await categoryService.getCategoriesByType('impactLevelId');
        if (impactLevelsResponse && impactLevelsResponse.data) {
          setImpactLevels(impactLevelsResponse.data);
        }

        // Lấy danh sách người dùng
        const usersResponse = await staffService.getListUser();
        if (usersResponse && usersResponse.data) {
          setUsers(usersResponse.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };
    fetchData();
  }, []);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDelete = (risk) => {
    setSelectedRisk(risk);
    setOpenDeleteDialog(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleConfirmDelete = async () => {
    try {
      await riskService.deleteRisk(selectedRisk.id);
      setSnackbar({
        open: true,
        message: 'Xóa rủi ro thành công',
        severity: 'success'
      });
      setOpenDeleteDialog(false);
      setSelectedRisk(null);
      fetchRisks(); // Refresh lại danh sách sau khi xóa
    } catch (error) {
      console.error('Lỗi khi xóa rủi ro:', error);
      setSnackbar({
        open: true,
        message: 'Không thể xóa rủi ro: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  // Thêm hàm xử lý export
  const handleExport = async () => {
    try {
      setLoading(true);
      const filter = {
        search: searchName,
        riskType: riskType !== 'all' ? riskType : undefined,
        impactLevel: riskLevel !== 'all' ? riskLevel : undefined
      };
      
      const response = await riskService.exportRisks(filter);
      
      // Tạo blob từ response data
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Tạo URL để tải file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Lấy tên file từ header content-disposition
      let fileName = 'DanhSachRuiRo.xlsx';
      const contentDisposition = response.headers?.['content-disposition'];
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = decodeURIComponent(fileNameMatch[1]);
        }
      }
      
      // Thiết lập thuộc tính cho link tải
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Kích hoạt tải file
      link.click();
      
      // Dọn dẹp
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setError(null);
    } catch (err) {
      console.error('Error exporting risks:', err);
      setError('Không thể xuất dữ liệu rủi ro: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  // Hàm helper để chuyển đổi ID thành tên hiển thị
  const getRiskTypeName = (typeId) => {
    const riskType = riskTypes.find(type => type.id === typeId);
    return riskType ? riskType.name : 'Chưa xác định';
  };

  const getImpactLevelName = (levelId) => {
    const impactLevel = impactLevels.find(level => level.id === levelId);
    return impactLevel ? impactLevel.name : 'Chưa xác định';
  };

  const getStateName = (stateId) => {
    switch (stateId) {
      case 2: return 'Đang xử lý';
      case 3: return 'Đã đóng';
      case 5: return 'Đã hủy';
      default: return 'Chưa xác định';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getReflectorName = (reflectorId) => {
    if (!reflectorId) return 'Chưa có';
    const user = users.find(user => String(user.id) === String(reflectorId));
    return user ? user.name : 'Chưa có';
  };

  const getRiskTypeColor = (typeId) => {
    const riskType = riskTypes.find(type => type.id === typeId);
    if (!riskType) return '#757575'; // Màu xám mặc định
    
    // Lấy màu từ thuộc tính color của riskType
    return riskType.color || '#757575';
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: '#fff' }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={2} 
          sx={{ 
            mb: 4,
            pb: 2,
            borderBottom: '2px solid #1976d2'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              flex: 1
            }}
          >
            DANH SÁCH RỦI RO
          </Typography>

          <Button
            variant="contained"
            component={Link}
            to="/risk/create"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#1b5e20'
              }
            }}
          >
            TẠO RỦI RO MỚI
          </Button>
        </Stack>

        {error && (
          <MuiAlert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </MuiAlert>
        )}

        <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <TextField
              size="small"
              placeholder="Tên, mã rủi ro"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                sx: { backgroundColor: '#fff' }
              }}
              sx={{
                minWidth: 300,
                flex: 1
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 200,
                backgroundColor: '#fff'
              }}
            >
              <InputLabel>Loại rủi ro</InputLabel>
              <Select
                value={riskType}
                label="Loại rủi ro"
                onChange={(e) => setRiskType(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {riskTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 200,
                backgroundColor: '#fff'
              }}
            >
              <InputLabel>Mức độ ảnh hưởng</InputLabel>
              <Select
                value={riskLevel}
                label="Mức độ ảnh hưởng"
                onChange={(e) => setRiskLevel(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {impactLevels.map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={handleExport}
              startIcon={<FileDownloadIcon />}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                },
                minWidth: 140
              }}
            >
              XUẤT DỮ LIỆU
            </Button>
          </Stack>
        </Paper>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>STT</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mã rủi ro</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Tên rủi ro</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Loại rủi ro</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mức độ ảnh hưởng</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày phản ánh</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Người phản ánh</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#1976d2' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : risks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                risks.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1976d2',
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                        component={Link}
                        to={`/risk/detail/${row.id}`}
                      >
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRiskTypeName(row.riskTypeId)}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getImpactLevelName(row.impactLevelId)}
                        size="small"
                        sx={{
                          backgroundColor: getRiskLevelColor(getImpactLevelName(row.impactLevelId)),
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(row.reflectionDay)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getReflectorName(row.reflectorId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStateName(row.state)}
                        size="small"
                        sx={{
                          backgroundColor: getRiskStageColor(getStateName(row.state)),
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/risk/detail/${row.id}`}
                          sx={{ 
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)'
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(row)}
                          sx={{ 
                            color: '#d32f2f',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.04)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{
          mt: 3,
          p: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" color="text.secondary">
            Tổng {risks.length} rủi ro
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>
      </Paper>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa rủi ro này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={1000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

// Thêm các hàm helper để xác định màu sắc
const getRiskLevelColor = (level) => {
  switch (level) {
    case 'Cao':
      return '#d32f2f'; // Red
    case 'Trung bình':
      return '#ed6c02'; // Orange
    case 'Thấp':
      return '#2e7d32'; // Green
    default:
      return '#757575'; // Grey
  }
};

const getRiskStageColor = (stage) => {
  switch (stage) {
    case 'Đang xử lý':
      return '#2196f3'; // Màu xanh dương
    case 'Đã đóng':
      return '#4caf50'; // Màu xanh lá
    case 'Đã hủy':
      return '#f44336'; // Màu đỏ
    default:
      return '#757575'; // Màu xám
  }
};

export default RiskList;