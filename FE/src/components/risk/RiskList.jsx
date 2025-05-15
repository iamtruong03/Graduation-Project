import React, { useState } from 'react';
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
  DialogContentText,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  TextareaAutosize
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';

const mockData = [
  {
    id: 1,
    code: 'RR001',
    name: 'Rủi ro về tiến độ dự án',
    type: 'Vận hành',
    level: 'Cao',
    stage: 'Đang xử lý',
    updatedAt: '2024-01-15',
    reporter: 'Nguyễn Văn A',
    department: 'Phòng Quản lý dự án',
    description: 'Dự án có nguy cơ chậm tiến độ do thiếu nhân lực',
    impactLevel: 'Cao',
    probability: 'Cao',
    priority: 'Cao',
    active: true
  },
  {
    id: 2,
    code: 'RR002',
    name: 'Rủi ro về chất lượng phần mềm',
    type: 'Kỹ thuật',
    level: 'Trung bình',
    stage: 'Mới ghi nhận',
    updatedAt: '2024-01-16',
    reporter: 'Trần Thị B',
    department: 'Phòng Kiểm thử',
    description: 'Phát hiện nhiều lỗi trong quá trình testing',
    impactLevel: 'Trung bình',
    probability: 'Cao',
    priority: 'Trung bình',
    active: true
  },
  {
    id: 3,
    code: 'RR003',
    name: 'Rủi ro về bảo mật dữ liệu',
    type: 'Bảo mật',
    level: 'Cao',
    stage: 'Đã đóng',
    updatedAt: '2024-01-17',
    reporter: 'Lê Văn C',
    department: 'Phòng An ninh mạng',
    description: 'Phát hiện lỗ hổng bảo mật trong hệ thống',
    impactLevel: 'Cao',
    probability: 'Thấp',
    priority: 'Cao',
    active: false
  },
  {
    id: 4,
    code: 'RR004',
    name: 'Rủi ro về chi phí phát triển',
    type: 'Tài chính',
    level: 'Trung bình',
    stage: 'Đang xử lý',
    updatedAt: '2024-01-18',
    reporter: 'Phạm Thị D',
    department: 'Phòng Tài chính',
    description: 'Chi phí phát triển vượt ngân sách dự kiến',
    impactLevel: 'Trung bình',
    probability: 'Trung bình',
    priority: 'Trung bình',
    active: true
  },
  {
    id: 5,
    code: 'RR005',
    name: 'Rủi ro về yêu cầu thay đổi',
    type: 'Nghiệp vụ',
    level: 'Thấp',
    stage: 'Mới ghi nhận',
    updatedAt: '2024-01-19',
    reporter: 'Hoàng Văn E',
    department: 'Phòng Phân tích',
    description: 'Khách hàng thường xuyên thay đổi yêu cầu',
    impactLevel: 'Thấp',
    probability: 'Cao',
    priority: 'Thấp',
    active: true
  }
];

import RiskEdit from './RiskEdit';

const RiskList = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [riskType, setRiskType] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    level: '',
    stage: '',
    impactScope: '',
    projectName: '',
    planVersion: '',
    department: '',
    reporter: '',
    reportDate: null,
    analyst: '',
    analysisDate: null,
    description: '',
    impactLevel: '',
    riskLevel: '',
    probability: '',
    priority: '',
    rootCause: '',
    impact: '',
    preventiveMeasures: '',
    remedialMeasures: ''
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleEdit = (risk) => {
    setSelectedRisk(risk);
    setOpenEditDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = (risk) => {
    setSelectedRisk(risk);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    // Thực hiện xóa rủi ro
    const newData = mockData.filter(risk => risk.id !== selectedRisk.id);
    // Cập nhật state hoặc gọi API xóa
    setOpenDeleteDialog(false);
    setSelectedRisk(null);
  };

  // Thêm state cho dialog thêm mới rủi ro
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  // Thêm hàm xử lý export
  const handleExport = () => {
    // Logic xuất file Excel/PDF
    const data = mockData.map(risk => ({
      'Mã rủi ro': risk.code,
      'Tên rủi ro': risk.name,
      'Loại': risk.type,
      'Mức độ': risk.level,
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

  const handleAddRisk = () => {
    setOpenEditDialog(true);
    setSelectedRisk(null);
    setFormData({
      code: '',
      name: '',
      type: '',
      level: '',
      impactLevel: '',
      riskLevel: '',
      probability: '',
      priority: '',
      rootCause: '',
      impact: '',
      preventiveMeasures: '',
      remedialMeasures: ''
    });
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
          DANH SÁCH RỦI RO
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
            placeholder="Tên, mã rủi ro"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
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
            <InputLabel>Mức độ</InputLabel>
            <Select
              value={riskLevel}
              label="Mức độ"
              onChange={(e) => setRiskLevel(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="high">Cao</MenuItem>
              <MenuItem value="medium">Trung bình</MenuItem>
              <MenuItem value="low">Thấp</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleExport}
            startIcon={<FileDownloadIcon />}
            sx={{ 
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#1b5e20'
              }
            }}
          >
            XUẤT DỮ LIỆU
          </Button>

          <Button
            variant="contained"
            component={Link}
            to="/risk/create"
            sx={{ 
              ml: 'auto',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            TẠO RỦI RO
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
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mã rủi ro</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên rủi ro</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Loại rủi ro</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mức độ</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày phản ánh</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Người phản ánh</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={9}>
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
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress sx={{ color: '#1976d2' }} />
                  </TableCell>
                </TableRow>
              ) : mockData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Không tìm thấy dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                mockData.map((row, index) => (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.type} 
                        size="small"
                        sx={{ 
                          backgroundColor: getRiskTypeColor(row.type),
                          color: '#fff'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.level} 
                        size="small"
                        sx={{ 
                          backgroundColor: getRiskLevelColor(row.level),
                          color: '#fff'
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.updatedAt}</TableCell>
                    <TableCell>{row.reporter}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.stage} 
                        size="small"
                        sx={{ 
                          backgroundColor: getRiskStageColor(row.stage),
                          color: '#fff'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(row)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(row)}
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
              Tổng {mockData.length} bản ghi
            </Typography>
            <Pagination
              count={Math.ceil(mockData.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Stack>
        </Box>
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
            Bạn có chắc chắn muốn xóa rủi ro này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
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
            onClick={handleConfirmDelete}
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