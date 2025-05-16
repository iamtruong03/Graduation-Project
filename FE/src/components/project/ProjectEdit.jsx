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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
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
      fileName: 'antoanmoitruong.pdf',
      updatedBy: 'Ngô Duy Anh',
      uploadDate: '2024-03-15'
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

  // State cho dialog thêm tài liệu
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [newAttachment, setNewAttachment] = useState({
    name: '',
    version: '',
    file: null,
    fileName: ''
  });

  // State cho dialog thêm công việc
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    startDate: null,
    endDate: null,
    assignee: '',
    supervisor: '',
    status: 'Nháp'
  });

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

  // Xử lý tài liệu đính kèm
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewAttachment(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
    }
  };

  const handleAddAttachment = () => {
    setOpenAttachmentDialog(true);
  };

  const handleCloseAttachmentDialog = () => {
    setOpenAttachmentDialog(false);
    setNewAttachment({
      name: '',
      version: '',
      file: null,
      fileName: ''
    });
  };

  const handleSaveAttachment = () => {
    const newDoc = {
      ...newAttachment,
      updatedBy: 'Người dùng hiện tại',
      uploadDate: new Date().toISOString()
    };
    setAttachments([...attachments, newDoc]);
    handleCloseAttachmentDialog();
  };

  const handleDeleteAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };

  const handleDownload = (file) => {
    // Gọi API để tải file
    console.log('Downloading file:', file);
  };

  // Xử lý công việc
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

  const handleSave = async () => {
    try {
      // Gọi API để lưu thông tin dự án
      navigate('/project/list');
    } catch (error) {
      console.error('Lỗi khi cập nhật dự án:', error);
    }
  };

  const handleCancel = () => {
    navigate('/project/list');
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
          CHỈNH SỬA KẾ HOẠCH
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Thông tin chung" />
            <Tab label="Công việc" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <>
            <Grid container spacing={3}>
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

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mt: 4,
              mb: 2,
              pt: 2,
              borderTop: '1px solid #e0e0e0'
            }}>
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                Tài liệu đính kèm
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleAddAttachment}
                sx={{
                  backgroundColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#1b5e20'
                  }
                }}
              >
                THÊM TÀI LIỆU
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ 
              mb: 3,
              borderRadius: 1,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Tên tài liệu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phiên bản</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tệp đính kèm</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Người cập nhật</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày tải lên</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attachments.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.version}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                          onClick={() => handleDownload(row.file)}
                        >
                          {row.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.updatedBy}</TableCell>
                      <TableCell>{new Date(row.uploadDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteAttachment(index)}
                        >
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

        <Box sx={{ 
          mt: 3, 
          pt: 2,
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2,
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button 
            variant="outlined" 
            onClick={handleCancel}
            sx={{
              borderColor: '#929292',
              color: '#929292',
              '&:hover': {
                borderColor: '#6f6f6f',
                color: '#6f6f6f',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            HỦY
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            LƯU
          </Button>
        </Box>
      </Paper>

      {/* Dialog thêm tài liệu */}
      <Dialog 
        open={openAttachmentDialog} 
        onClose={handleCloseAttachmentDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
          color: '#1976d2',
          fontWeight: 600
        }}>
          Thêm tài liệu mới
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên tài liệu"
                value={newAttachment.name}
                onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phiên bản"
                value={newAttachment.version}
                onChange={(e) => setNewAttachment({ ...newAttachment, version: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{
                  height: '40px'
                }}
              >
                Chọn tệp
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {newAttachment.fileName && (
                <Typography variant="body2" sx={{ mt: 1, color: '#1976d2' }}>
                  Đã chọn: {newAttachment.fileName}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleCloseAttachmentDialog}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            HỦY
          </Button>
          <Button
            onClick={handleSaveAttachment}
            variant="contained"
            disabled={!newAttachment.name || !newAttachment.version || !newAttachment.file}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            THÊM
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm/sửa công việc */}
      <Dialog 
        open={openTaskDialog} 
        onClose={handleCloseTaskDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 600
          }
        }}
      >
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