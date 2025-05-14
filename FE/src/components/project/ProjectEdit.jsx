import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { useParams, useNavigate } from 'react-router-dom';

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    code: 'KH001',
    name: 'Kế hoạch AT Môi trường',
    type: 'An Toàn Môi trường',
    scope: 'Tổ chức',
    level: 'Cấp 1',
    department: 'P101 - An toàn môi trường',
    manager: 'Ngô Duy Anh',
    startDate: '2025-03-15T08:30:00',
    endDate: '2025-04-20T17:30:00',
    description: 'Bảo vệ môi trường và giảm thiểu tác động tiêu cực từ hoạt động sản xuất, thi công.'
  });

  const [attachments, setAttachments] = useState([
    {
      name: 'An toàn môi trường',
      version: '1.0',
      file: 'antoanmoitruong.pdf',
      updatedBy: 'Ngô Duy Anh'
    }
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Cập nhật tài liệu hướng dẫn an toàn',
      startDate: '2025-03-20',
      endDate: '2025-03-22',
      assignee: 'Nguyễn Văn B',
      supervisor: 'Trần Văn A',
      status: 'Nháp'
    }
  ]);

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

  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    startDate: null,
    endDate: null,
    assignee: '',
    supervisor: '',
    status: 'Nháp'
  });

  const handleSave = async () => {
    try {
      // Gọi API để lưu thông tin dự án
      // await projectService.updateProject(id, formData);
      navigate('/project/list');
    } catch (error) {
      console.error('Lỗi khi cập nhật dự án:', error);
    }
  };

  const handleCancel = () => {
    navigate('/project/list');
  };

  const handleAddTask = () => {
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setNewTask({
      name: '',
      startDate: null,
      endDate: null,
      assignee: '',
      supervisor: '',
      status: 'Nháp'
    });
  };

  const handleSaveTask = () => {
    setTasks([...tasks, { ...newTask, id: tasks.length + 1 }]);
    handleCloseTaskDialog();
  };

  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    setNewTask(taskToEdit);
    setOpenTaskDialog(true);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Thông tin chung" />
            <Tab label="Công việc" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Mã kế hoạch"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Tên kế hoạch"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Loại kế hoạch"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Phạm vi"
                  name="scope"
                  value={formData.scope}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Mức độ nghiêm trọng"
                  name="level"
                  value={formData.level}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Người chịu trách nhiệm"
                  name="manager"
                  value={formData.manager}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Ngày bắt đầu"
                    value={formData.startDate}
                    onChange={(newValue) => handleFormChange({
                      target: { name: 'startDate', value: newValue }
                    })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Ngày kết thúc"
                    value={formData.endDate}
                    onChange={(newValue) => handleFormChange({
                      target: { name: 'endDate', value: newValue }
                    })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Mô tả"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Tài liệu đính kèm</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên</TableCell>
                    <TableCell>Phiên bản</TableCell>
                    <TableCell>Tệp đính kèm</TableCell>
                    <TableCell>Người cập nhật</TableCell>
                    <TableCell>Tác động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attachments.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.version}</TableCell>
                      <TableCell>{row.file}</TableCell>
                      <TableCell>{row.updatedBy}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {currentTab === 1 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTask}
              >
                Thêm công việc
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên công việc</TableCell>
                    <TableCell>Ngày bắt đầu</TableCell>
                    <TableCell>Ngày kết thúc</TableCell>
                    <TableCell>Người thực hiện</TableCell>
                    <TableCell>Người giám sát</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.startDate}</TableCell>
                      <TableCell>{task.endDate}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>{task.supervisor}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditTask(task.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteTask(task.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={handleCancel}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </Box>
      </Paper>

      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog}>
        <DialogTitle>
          {newTask.id ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
        </DialogTitle>
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
            <Grid item xs={6}>
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
                label="Người giám sát"
                value={newTask.supervisor}
                onChange={(e) => setNewTask({ ...newTask, supervisor: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Hủy</Button>
          <Button onClick={handleSaveTask} variant="contained">
            {newTask.id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectEdit;