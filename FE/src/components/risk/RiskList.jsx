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
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CheckCircle as ApproveIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import riskService from '../../services/riskService';

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
  const [pendingRisks, setPendingRisks] = useState([]);
  const [openPendingDialog, setOpenPendingDialog] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [approveId, setApproveId] = useState(null);
  const rowsPerPage = 10;

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

  const fetchPendingRisks = async () => {
    try {
      setLoading(true);
      const response = await riskService.getPendingApprovalRisks({
        page: pendingPage,
        size: rowsPerPage,
        search: searchName
      });
      if (response.status === 200) {
        const { content, totalPages, totalElements } = response.data;
        setPendingRisks(content);
        setPendingTotalPages(totalPages);
        setPendingCount(totalElements);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (err) {
      console.error('Error fetching pending risks:', err);
      setError('Không thể tải danh sách rủi ro chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await riskService.getPendingApprovalRisks({
        page: 0,
        size: 1
      });
      if (response.status === 200) {
        setPendingCount(response.data.totalElements);
      }
    } catch (err) {
      console.error('Error fetching pending count:', err);
    }
  };

  useEffect(() => {
    fetchRisks();
    fetchPendingCount();
    // eslint-disable-next-line
  }, [page, searchName]);

  useEffect(() => {
    if (openPendingDialog) {
      fetchPendingRisks();
    }
  }, [openPendingDialog, pendingPage]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDelete = (risk) => {
    setSelectedRisk(risk);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    // Thực hiện xóa rủi ro
    const newData = risks.filter(risk => risk.id !== selectedRisk.id);
    // Cập nhật state hoặc gọi API xóa
    setOpenDeleteDialog(false);
    setSelectedRisk(null);
  };

  const handleApprove = (id) => {
    setApproveId(id);
    setOpenApproveDialog(true);
  };

  const handleConfirmApprove = async () => {
    try {
      setLoading(true);
      const response = await riskService.approveRisk(approveId, localStorage.getItem('userId'));
      if (response.success) {
        await fetchRisks();
        await fetchPendingRisks();
        await fetchPendingCount();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Không thể phê duyệt rủi ro');
      console.error('Error approving risk:', err);
    } finally {
      setLoading(false);
      setOpenApproveDialog(false);
      setApproveId(null);
    }
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setApproveId(null);
  };

  const handleClosePendingDialog = () => {
    setOpenPendingDialog(false);
  };

  const handlePendingPageChange = (event, newPage) => {
    setPendingPage(newPage - 1);
  };

  // Thêm hàm xử lý export
  const handleExport = () => {
    // Logic xuất file Excel/PDF
    const data = risks.map(risk => ({
      'Mã rủi ro': risk.code,
      'Tên rủi ro': risk.name,
      'Loại': risk.type,
      'Mức độ ảnh hưởng': risk.level,
      'Trạng thái': risk.stage,
      'Người báo cáo': risk.reporter,
      'Phòng ban': risk.department,
      'Mô tả': risk.description
    }));

    // Tạo và tải xuống file
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách rủi ro");
    XLSX.writeFile(workbook, "danh-sach-rui-ro.xlsx");
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

          <Badge badgeContent={pendingCount} color="error">
            <Button
              variant="contained"
              onClick={() => setOpenPendingDialog(true)}
              startIcon={<AssignmentIcon />}
              sx={{ 
                backgroundColor: '#ff9800',
                '&:hover': {
                  backgroundColor: '#f57c00'
                },
                mr: 1
              }}
            >
              RỦI RO CHỜ DUYỆT
            </Button>
          </Badge>

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
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
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
                <MenuItem value="operation">Vận hành</MenuItem>
                <MenuItem value="technical">Kỹ thuật</MenuItem>
                <MenuItem value="security">Bảo mật</MenuItem>
                <MenuItem value="financial">Tài chính</MenuItem>
                <MenuItem value="business">Nghiệp vụ</MenuItem>
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
                <MenuItem value="high">Cao</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="low">Thấp</MenuItem>
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
                        label={row.riskTypeName || row.type}
                        size="small"
                        sx={{
                          backgroundColor: getRiskTypeColor(row.riskTypeName || row.type),
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.impactLevelName || row.level}
                        size="small"
                        sx={{
                          backgroundColor: getRiskLevelColor(row.impactLevelName || row.level),
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.reflectionDay || row.updatedAt}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.reflectorName || row.reporter}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.stateName || row.stage}
                        size="small"
                        sx={{
                          backgroundColor: getRiskStageColor(row.stateName || row.stage),
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
                        
                        {row.stage === 'pending' && (
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(row.id)}
                            sx={{ 
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)'
                              }
                            }}
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                        )}
                        
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

      {/* Approve Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={handleCloseApproveDialog}
      >
        <DialogTitle>Xác nhận phê duyệt</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn phê duyệt rủi ro này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog}>Hủy</Button>
          <Button onClick={handleConfirmApprove} color="success" autoFocus>
            Phê duyệt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pending Risks Dialog */}
      <Dialog
        open={openPendingDialog}
        onClose={handleClosePendingDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Danh sách rủi ro chờ duyệt ({pendingCount})
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã rủi ro</TableCell>
                      <TableCell>Tên rủi ro</TableCell>
                      <TableCell>Loại rủi ro</TableCell>
                      <TableCell>Mức độ ảnh hưởng</TableCell>
                      <TableCell>Ngày phản ánh</TableCell>
                      <TableCell>Người phản ánh</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRisks.map((risk) => (
                      <TableRow key={risk.id}>
                        <TableCell>{risk.code}</TableCell>
                        <TableCell>{risk.name}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: getRiskTypeColor(risk.riskTypeName || risk.type),
                              color: '#fff',
                              py: 0.5,
                              px: 1.5,
                              borderRadius: 1,
                              display: 'inline-block',
                              fontSize: '0.875rem'
                            }}
                          >
                            {risk.riskTypeName || risk.type}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: getRiskLevelColor(risk.impactLevelName || risk.level),
                              color: '#fff',
                              py: 0.5,
                              px: 1.5,
                              borderRadius: 1,
                              display: 'inline-block',
                              fontSize: '0.875rem'
                            }}
                          >
                            {risk.impactLevelName || risk.level}
                          </Box>
                        </TableCell>
                        <TableCell>{risk.reflectionDay || risk.updatedAt}</TableCell>
                        <TableCell>{risk.reflectorName || risk.reporter}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: getRiskStageColor(risk.stateName || risk.stage),
                              color: '#fff',
                              py: 0.5,
                              px: 1.5,
                              borderRadius: 1,
                              display: 'inline-block',
                              fontSize: '0.875rem'
                            }}
                          >
                            {risk.stateName || risk.stage}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/risk/detail/${risk.id}`}
                            sx={{ mr: 1 }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(risk.id)}
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                  count={pendingTotalPages}
                  page={pendingPage + 1}
                  onChange={handlePendingPageChange}
                  color="primary"
                  size="small"
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePendingDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Thêm các hàm helper để xác định màu sắc
const getRiskTypeColor = (type) => {
  switch (type) {
    case 'Vận hành':
      return '#1976d2'; // Blue
    case 'Kỹ thuật':
      return '#9c27b0'; // Purple
    case 'Bảo mật':
      return '#2e7d32'; // Green
    case 'Tài chính':
      return '#ed6c02'; // Orange
    case 'Nghiệp vụ':
      return '#9c27b0'; // Purple
    default:
      return '#757575'; // Grey
  }
};

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
      return '#1976d2'; // Blue
    case 'Mới ghi nhận':
      return '#ed6c02'; // Orange
    case 'Đã đóng':
      return '#2e7d32'; // Green
    default:
      return '#757575'; // Grey
  }
};

export default RiskList;