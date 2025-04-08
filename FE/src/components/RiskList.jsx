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
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';

const mockData = [
  { id: 1, code: 'RR001', name: 'Rủi ro tài chính', type: 'Tài chính', level: 'Cao', active: true, updatedAt: '20/07/2023' },
  { id: 2, code: 'RR002', name: 'Rủi ro vận hành', type: 'Vận hành', level: 'Trung bình', active: true, updatedAt: '19/07/2023' },
  { id: 3, code: 'RR003', name: 'Rủi ro thị trường', type: 'Thị trường', level: 'Thấp', active: false, updatedAt: '18/07/2023' },
  { id: 4, code: 'RR004', name: 'Rủi ro pháp lý', type: 'Pháp lý', level: 'Cao', active: true, updatedAt: '17/07/2023' },
];

const RiskList = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [riskType, setRiskType] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
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
            <MenuItem value="financial">Tài chính</MenuItem>
            <MenuItem value="operational">Vận hành</MenuItem>
            <MenuItem value="market">Thị trường</MenuItem>
            <MenuItem value="legal">Pháp lý</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={status}
            label="Trạng thái"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="active">Hoạt động</MenuItem>
            <MenuItem value="inactive">Không hoạt động</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }}
        >
          Tạo rủi ro
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
              <TableCell>Hoạt động</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
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
                <TableCell>
                  <Switch checked={row.active} />
                </TableCell>
                <TableCell>{row.updatedAt}</TableCell>
                <TableCell align="center">
                  <IconButton size="small">
                    <EditIcon />
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
    </Box>
  );
};

export default RiskList;