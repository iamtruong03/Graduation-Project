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
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import projectService from '../services/projectService';



const ProjectList = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAllProjects();
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách dự án');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await projectService.deleteProject(deleteId);
      await fetchProjects(); // Tải lại danh sách sau khi xóa
      setError(null);
    } catch (err) {
      setError('Không thể xóa dự án');
      console.error('Error deleting project:', err);
    } finally {
      setLoading(false);
      setOpenDialog(false);
      setDeleteId(null);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>DANH SÁCH DỰ ÁN</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Mã dự án"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
        />
        <TextField
          size="small"
          placeholder="Tên dự án"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={status}
            label="Trạng thái"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="active">Đang thực hiện</MenuItem>
            <MenuItem value="completed">Hoàn thành</MenuItem>
            <MenuItem value="pending">Chưa bắt đầu</MenuItem>
          </Select>
        </FormControl>
        <Button
          component={Link}
          to="/project/create"
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }}
        >
          Tạo dự án
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Mã dự án</TableCell>
              <TableCell>Tên dự án</TableCell>
              <TableCell>Người phụ trách</TableCell>
              <TableCell>Phòng ban thực hiện</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Người tạo</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error && (
              <TableRow>
                <TableCell colSpan={10}>
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                </TableCell>
              </TableRow>
            )}
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              projects.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.manager}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.startDate}</TableCell>
                  <TableCell>{row.endDate}</TableCell>
                  <TableCell>
                    <Switch checked={row.status === 'Đang thực hiện'} />
                  </TableCell>
                  <TableCell>{row.creator}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" component={Link} to={`/project/detail/${row.id}`} sx={{ mr: 1 }}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" component={Link} to={`/project/edit/${row.id}`} sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(projects.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Xác nhận xóa dự án
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;