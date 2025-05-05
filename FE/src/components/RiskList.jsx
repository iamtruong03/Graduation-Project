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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>DANH SÁCH RỦI RO</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tên, mã rủi ro"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
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

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRisk}
          sx={{ ml: 'auto' }}
        >
          Thêm rủi ro
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Mã rủi ro</TableCell>
              <TableCell>Tên rủi ro</TableCell>
              <TableCell>Loại rủi ro</TableCell>
              <TableCell>Mức độ</TableCell>
              <TableCell>Ngày phản ánh</TableCell>
              <TableCell>Người phản ánh</TableCell>
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
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.level}</TableCell>
                <TableCell>{row.updatedAt}</TableCell>
                <TableCell>{row.reporter}</TableCell>
                <TableCell>{row.stage}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEdit(row)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
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
          count={Math.ceil(mockData.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Thay thế Dialog cũ bằng component RiskEdit */}
      <RiskEdit
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        risk={selectedRisk}
        onSave={(formData) => {
          console.log('Saving:', formData);
          setOpenEditDialog(false);
        }}
      />

      {/* Dialog Xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa rủi ro này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskList;