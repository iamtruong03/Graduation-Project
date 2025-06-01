import React, { useState, useEffect } from 'react';
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
  Alert as MuiAlert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import taskService from '../../services/taskService';
import staffService from '../../services/staffService';
import departmentService from '../../services/departmentService';

const TaskCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    taskTypeId: 3,
    departmentId: '',
    assigneeId: '',
    priorityId: 2,
    description: '',
    startDate: '',
    dueDate: '',
  });
  const [assigneeList, setAssigneeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [approverList, setApproverList] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchApprovers();
    fetchDepartments();
  }, []);

  const fetchApprovers = async () => {
    try {
      const response = await staffService.getAll();
      if (response.data) {
        setApproverList(response.data);
      }
    } catch (error) {
      console.error('Error fetching approvers:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      if (response.data) {
        setDepartmentList(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAssigneesByDepartment = async (departmentId) => {
    if (!departmentId) {
      setAssigneeList([]);
      return;
    }
    try {
      const response = await staffService.listUserByDep(departmentId);
      if (response.data) {
        setAssigneeList(response.data);
      }
    } catch (error) {
      console.error('Error fetching assignees by department:', error);
      setAssigneeList([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'departmentId') {
      fetchAssigneesByDepartment(value);
      setFormData(prev => ({
        ...prev,
        assigneeId: ''
      }));
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (!formData.departmentId) {
        setSnackbar({
          open: true,
          message: 'Vui lòng chọn Phòng ban.',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      if (!formData.assigneeId) {
        setSnackbar({
          open: true,
          message: 'Vui lòng chọn Người thực hiện.',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      const taskData = {
        code: formData.code,
        name: formData.name,
        taskTypeId: formData.taskTypeId,
        departmentId: formData.departmentId,
        assigneeId: formData.assigneeId,
        state: 1,
        priorityId: formData.priorityId,
        description: formData.description,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
      };

      const response = await taskService.createTask(taskData);
      if (response) {
        setSnackbar({
          open: true,
          message: 'Tạo công việc thành công',
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/task/list');
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: 'Tạo công việc không thành công. Vui lòng kiểm tra dữ liệu.',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo công việc',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>TẠO CÔNG VIỆC MỚI</Typography>
      <Paper sx={{ p: 3 }}>
        {error && (
          <MuiAlert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </MuiAlert>
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
                <InputLabel>Phòng ban</InputLabel>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  label="Phòng ban"
                  onChange={handleChange}
                >
                  <MenuItem value="">-- Chọn phòng ban --</MenuItem>
                  {departmentList.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Người thực hiện</InputLabel>
                <Select
                  name="assigneeId"
                  value={formData.assigneeId}
                  label="Người thực hiện"
                  onChange={handleChange}
                >
                  <MenuItem value="">-- Chọn người thực hiện --</MenuItem>
                  {assigneeList.map((assignee) => (
                    <MenuItem key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Mức độ ưu tiên</InputLabel>
                <Select
                  name="priorityId"
                  value={formData.priorityId}
                  label="Mức độ ưu tiên"
                  onChange={handleChange}
                >
                  <MenuItem value={3}>Cao</MenuItem>
                  <MenuItem value={2}>Trung bình</MenuItem>
                  <MenuItem value={1}>Thấp</MenuItem>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

export default TaskCreate;