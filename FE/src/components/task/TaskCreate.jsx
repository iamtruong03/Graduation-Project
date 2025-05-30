import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Typography,
  Paper,
  Grid,
  TextareaAutosize,
  Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import taskService from '../../services/taskService';

const TaskCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    taskType: '',
    project: '',
    department: '',
    manager: '',
    assignee: '',
    status: 'not_started',
    priority: '',
    description: '',
    startDate: '',
    dueDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskService.createTask(formData);
      if (response) {
        navigate('/task/list');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo công việc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>TẠO CÔNG VIỆC MỚI</Typography>
      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Mã công việc"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Tên công việc"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Loại công việc</InputLabel>
                <Select
                  name="taskType"
                  value={formData.taskType}
                  label="Loại công việc"
                  onChange={handleChange}
                >
                  <MenuItem value="department">Công việc phòng ban</MenuItem>
                  <MenuItem value="project">Công việc dự án</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.taskType === 'project' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Dự án</InputLabel>
                  <Select
                    name="project"
                    value={formData.project}
                    label="Dự án"
                    onChange={handleChange}
                  >
                    <MenuItem value="project1">Dự án A</MenuItem>
                    <MenuItem value="project2">Dự án B</MenuItem>
                    <MenuItem value="project3">Dự án C</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Phòng ban</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  label="Phòng ban"
                  onChange={handleChange}
                >
                  <MenuItem value="dept1">Phòng kế toán</MenuItem>
                  <MenuItem value="dept2">Phòng hành chính</MenuItem>
                  <MenuItem value="dept3">Phòng kỹ thuật</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Người phụ trách</InputLabel>
                <Select
                  name="manager"
                  value={formData.manager}
                  label="Người phụ trách"
                  onChange={handleChange}
                >
                  <MenuItem value="manager1">Nguyễn Văn A</MenuItem>
                  <MenuItem value="manager2">Trần Thị B</MenuItem>
                  <MenuItem value="manager3">Lê Văn C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Người thực hiện</InputLabel>
                <Select
                  name="assignee"
                  value={formData.assignee}
                  label="Người thực hiện"
                  onChange={handleChange}
                >
                  <MenuItem value="assignee1">Trần Thị B</MenuItem>
                  <MenuItem value="assignee2">Phạm Thị D</MenuItem>
                  <MenuItem value="assignee3">Hoàng Văn E</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Trạng thái"
                  onChange={handleChange}
                >
                  <MenuItem value="not_started">Chưa bắt đầu</MenuItem>
                  <MenuItem value="in_progress">Đang thực hiện</MenuItem>
                  <MenuItem value="completed">Hoàn thành</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Mức độ ưu tiên</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Mức độ ưu tiên"
                  onChange={handleChange}
                >
                  <MenuItem value="high">Cao</MenuItem>
                  <MenuItem value="medium">Trung bình</MenuItem>
                  <MenuItem value="low">Thấp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Ngày bắt đầu"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Ngày kết thúc"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextareaAutosize
                minRows={4}
                placeholder="Mô tả chi tiết công việc"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderColor: '#ccc',
                  borderRadius: '4px',
                  fontFamily: 'inherit'
                }}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/task/list"
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Đang tạo...' : 'Tạo'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskCreate;