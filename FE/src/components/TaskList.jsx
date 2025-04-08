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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';

const mockData = [
  { id: 1, code: 'CV001', name: 'Phát triển tính năng mới', taskType: 'project', project: 'Dự án A', department: 'Phòng kỹ thuật', type: 'Phát triển', status: 'Đang thực hiện', priority: 'Cao', manager: 'Nguyễn Văn A', assignee: 'Trần Thị B', active: true, updatedAt: '20/07/2023' },
  { id: 2, code: 'CV002', name: 'Sửa lỗi giao diện', taskType: 'project', project: 'Dự án B', department: 'Phòng kỹ thuật', type: 'Bảo trì', status: 'Hoàn thành', priority: 'Trung bình', manager: 'Lê Văn C', assignee: 'Phạm Thị D', active: true, updatedAt: '19/07/2023' },
  { id: 3, code: 'CV003', name: 'Tối ưu hóa hiệu suất', taskType: 'department', project: null, department: 'Phòng kế toán', type: 'Cải tiến', status: 'Chưa bắt đầu', priority: 'Thấp', manager: 'Nguyễn Văn A', assignee: 'Hoàng Văn E', active: false, updatedAt: '18/07/2023' },
  { id: 4, code: 'CV004', name: 'Kiểm thử hệ thống', taskType: 'department', project: null, department: 'Phòng hành chính', type: 'Kiểm thử', status: 'Đang thực hiện', priority: 'Cao', manager: 'Trần Thị F', assignee: 'Lê Thị G', active: true, updatedAt: '17/07/2023' },
];

const TaskList = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [taskType, setTaskType] = useState('all');
  const [taskStatus, setTaskStatus] = useState('all');
  const [taskPriority, setTaskPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>DANH SÁCH CÔNG VIỆC</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tên, mã công việc"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Loại công việc</InputLabel>
          <Select
            value={taskType}
            label="Loại công việc"
            onChange={(e) => setTaskType(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="department">Công việc phòng ban</MenuItem>
            <MenuItem value="project">Công việc dự án</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={taskStatus}
            label="Trạng thái"
            onChange={(e) => setTaskStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="not_started">Chưa bắt đầu</MenuItem>
            <MenuItem value="in_progress">Đang thực hiện</MenuItem>
            <MenuItem value="completed">Hoàn thành</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Mức độ ưu tiên</InputLabel>
          <Select
            value={taskPriority}
            label="Mức độ ưu tiên"
            onChange={(e) => setTaskPriority(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="high">Cao</MenuItem>
            <MenuItem value="medium">Trung bình</MenuItem>
            <MenuItem value="low">Thấp</MenuItem>
          </Select>
        </FormControl>
        <Button
          component={Link}
          to="/task/create"
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }}
        >
          Tạo công việc
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Mã công việc</TableCell>
              <TableCell>Tên công việc</TableCell>
              <TableCell>Loại công việc</TableCell>
              <TableCell>Dự án/Phòng ban</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Mức độ ưu tiên</TableCell>
              <TableCell>Người phụ trách</TableCell>
              <TableCell>Người thực hiện</TableCell>
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
                <TableCell>{row.taskType === 'project' ? 'Công việc dự án' : 'Công việc phòng ban'}</TableCell>
                <TableCell>{row.taskType === 'project' ? row.project : row.department}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.priority}</TableCell>
                <TableCell>{row.manager}</TableCell>
                <TableCell>{row.assignee}</TableCell>
                <TableCell>
                  <Switch checked={row.active} />
                </TableCell>
                <TableCell>{row.updatedAt}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" component={Link} to={`/task/detail/${row.id}`}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Stack>
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

export default TaskList;