import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import vi from 'date-fns/locale/vi';
import CloseIcon from '@mui/icons-material/Close';
import projectService from '../../services/projectService';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    assignee: '',
    startDate: '',
    endDate: '',
    priority: 'MEDIUM',
    status: 'NEW',
  });

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(id);
        if (response && response.data) {
          setProject(response.data);
          setError(null);
        } else {
          setError('Không thể tải thông tin dự án: Dữ liệu không hợp lệ');
        }
      } catch (err) {
        setError('Không thể tải thông tin dự án: ' + (err.response?.data?.message || err.message));
        console.error('Error fetching project details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Không tìm thấy thông tin dự án</Alert>
      </Box>
    );
  }
  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return '#4caf50';
      case 'IN_PROGRESS':
        return '#2196f3';
      case 'COMPLETED':
        return '#9c27b0';
      case 'CANCELLED':
        return '#f44336';
      default:
        return '#000000';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return '#f44336';
      case 'MEDIUM':
        return '#ff9800';
      case 'LOW':
        return '#4caf50';
      default:
        return '#000000';
    }
  };

  const formatDate = (date) => {
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setNewTask({
      name: '',
      assignee: '',
      startDate: '',
      endDate: '',
      priority: 'MEDIUM',
      status: 'NEW',
    });
  };

  const handleCreateTask = () => {
    // Thêm task mới vào danh sách
    const newTaskWithId = {
      ...newTask,
      id: project.tasks.length + 1,
      startDate: new Date(newTask.startDate),
      endDate: new Date(newTask.endDate),
    };
    setProject({
      ...project,
      tasks: [...project.tasks, newTaskWithId],
    });
    handleCloseTaskDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Chi tiết dự án</Typography>
        <IconButton
          color="primary"
          onClick={() => navigate('/project/list')}
          sx={{ p: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Mã dự án
            </Typography>
            <Typography variant="body1">{project.code}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Tên dự án
            </Typography>
            <Typography variant="body1">{project.name}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
            Người phụ trách
            </Typography>
            <Typography variant="body1">{project.manager}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Phòng ban thực hiện
            </Typography>
            <Typography variant="body1">{project.department}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Ngày bắt đầu
            </Typography>
            <Typography variant="body1">{formatDate(project.startDate)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Ngày kết thúc
            </Typography>
            <Typography variant="body1">{formatDate(project.endDate)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Trạng thái
            </Typography>
            <Chip
              label={project.status}
              size="small"
              sx={{
                bgcolor: getStatusColor(project.status),
                color: 'white',
                mt: 0.5,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Danh sách công việc</Typography>
        <Button
          variant="contained"
          onClick={() => setOpenTaskDialog(true)}
        >
          Thêm công việc
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên công việc</TableCell>
              <TableCell>Người thực hiện</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Độ ưu tiên</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {project.tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Button
                    color="primary"
                    onClick={() => navigate(`/task/detail/${task.id}`)}
                    sx={{ p: 0, textTransform: 'none' }}
                  >
                    {task.name}
                  </Button>
                </TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell>{formatDate(task.startDate)}</TableCell>
                <TableCell>{formatDate(task.endDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      bgcolor: getPriorityColor(task.priority),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(task.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm công việc mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên công việc"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Người thực hiện"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày bắt đầu"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày kết thúc"
                value={newTask.endDate}
                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Độ ưu tiên</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Độ ưu tiên"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <MenuItem value="HIGH">Cao</MenuItem>
                  <MenuItem value="MEDIUM">Trung bình</MenuItem>
                  <MenuItem value="LOW">Thấp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Hủy</Button>
          <Button onClick={handleCreateTask} variant="contained" color="primary">
            Tạo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;