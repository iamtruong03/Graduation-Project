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
  Alert as MuiAlert,
  Snackbar,
  Stack,
  Divider
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import vi from 'date-fns/locale/vi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import projectService from '../../services/projectService';
import departmentService from '../../services/departmentService';
import staffService from '../../services/staffService';
import { PROJECT_STATES, PROJECT_TYPES } from '../../utils/constants';
import ProjectHistory from './ProjectHistory';
import taskService from '../../services/taskService';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState({
    attachments: [],
    tasks: []
  });
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({
    attachments: [],
    tasks: [],
    completedDate: null
  });
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    assignee: '',
    startDate: '',
    endDate: '',
    priority: 'MEDIUM',
    status: 'NEW',
  });
  const [newAttachment, setNewAttachment] = useState({
    name: '',
    version: '',
    file: null,
    fileName: ''
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [projectHistory, setProjectHistory] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectResponse, historyResponse] = await Promise.all([
          projectService.getProjectById(id),
          projectService.getProjectHistory(id)
        ]);

        console.log('Project Response:', projectResponse);

        if (projectResponse && projectResponse.status === 200) {
          const projectData = {
            ...projectResponse.data,
            attachments: projectResponse.data.attachments || [],
            tasks: projectResponse.data.tasks || []
          };
          setProject(projectData);
          setEditedProject(projectData);

          // Lấy thông tin phòng ban và danh sách người phụ trách
          if (projectData.departmentId) {
            try {
              const [deptResponse, userResponse] = await Promise.all([
                departmentService.getDepartmentById(projectData.departmentId),
                staffService.listUserByDep(projectData.departmentId)
              ]);

              console.log('Department Response:', deptResponse);
              console.log('User Response:', userResponse);

              if (deptResponse && deptResponse.data) {
                setDepartments([deptResponse.data]);
              }

              if (userResponse && userResponse.data) {
                console.log('Setting managers:', userResponse.data);
                setManagers(userResponse.data);
              }
            } catch (err) {
              console.error('Error fetching department and managers:', err);
            }
          }
        } else {
          setError('Không thể tải thông tin dự án');
        }

        if (Array.isArray(historyResponse)) {
          setProjectHistory(historyResponse);
        } else {
          setProjectHistory([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Có lỗi xảy ra khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusColor = (state) => {
    switch (state) {
      case 0: return '#ed6c02'; // Chờ duyệt
      case 1: return '#d32f2f'; // Từ chối
      case 2: return '#1976d2'; // Đang thực hiện
      case 3: return '#2e7d32'; // Hoàn thành
      case 4: return '#d32f2f'; // Quá hạn
      case 5: return '#d32f2f'; // Đã hủy
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'Cao':
        return '#d32f2f'; // Red
      case 'MEDIUM':
      case 'Trung bình':
        return '#ed6c02'; // Orange
      case 'LOW':
      case 'Thấp':
        return '#2e7d32'; // Green
      default:
        return '#757575'; // Grey
    }
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
    setSelectedTask(null);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setNewTask({
      code: '',
      name: '',
      departmentId: project.departmentId,
      assigneeId: '',
      priorityId: '',
      taskTypeId: 2,
      projectId: id,
      description: '',
      startDate: '',
      dueDate: '',
    });
    // Lấy danh sách người thực hiện theo phòng ban của dự án
    if (project.departmentId) {
      staffService.listUserByDep(project.departmentId)
        .then(response => {
          if (response.data) {
            setManagers(response.data);
          }
        })
        .catch(err => {
          console.error('Error fetching assignees:', err);
        });
    }
    setOpenTaskDialog(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setNewTask({
      code: task.code || '',
      name: task.name,
      departmentId: project.departmentId,
      assigneeId: task.assigneeId || '',
      priorityId: task.priorityId || 2,
      taskTypeId: 2,
      projectId: id,
      description: task.description || '',
      startDate: task.startDate || '',
      dueDate: task.dueDate || '',
    });
    // Lấy danh sách người thực hiện theo phòng ban của dự án
    if (project.departmentId) {
      staffService.listUserByDep(project.departmentId)
        .then(response => {
          if (response) {
            setManagers(response.data);
          }
        })
        .catch(err => {
          console.error('Error fetching assignees:', err);
        });
    }
    setOpenTaskDialog(true);
  };

  const handleEdit = () => {
    // Kiểm tra trạng thái project
    if (project.state !== 2) {
      setSnackbar({
        open: true,
        message: 'Chỉ có thể chỉnh sửa dự án khi đang ở trạng thái "Đang thực hiện"',
        severity: 'error'
      });
      return;
    }
    setIsEditing(true);
    // Chuyển đổi chuỗi ngày thành đối tượng Date
    const editedProjectData = {
      ...project,
      startDate: project.startDate ? new Date(project.startDate) : null,
      endDate: project.endDate ? new Date(project.endDate) : null,
      completedDate: project.completedDate ? new Date(project.completedDate) : null
    };
    setEditedProject(editedProjectData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProject({ ...project });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const projectDataToSave = {
        ...editedProject,
        startDate: editedProject.startDate ? editedProject.startDate.toISOString() : null,
        endDate: editedProject.endDate ? editedProject.endDate.toISOString() : null,
        completedDate: editedProject.completedDate ? editedProject.completedDate.toISOString() : null,
        updateBy: localStorage.getItem('userId')
      };

      const response = await projectService.updateProject(id, projectDataToSave);

      if (response.status === 200 || response.message === "Success") {
        // Gọi lại API getProjectById và getProjectHistory
        try {
          const [projectResponse, historyResponse] = await Promise.all([
            projectService.getProjectById(id),
            projectService.getProjectHistory(id)
          ]);

          if (projectResponse && projectResponse.status === 200) {
            const projectData = {
              ...projectResponse.data,
              attachments: projectResponse.data.attachments || [],
              tasks: projectResponse.data.tasks || []
            };
            setProject(projectData);
            setEditedProject(projectData);
          }

          if (Array.isArray(historyResponse)) {
            setProjectHistory(historyResponse);
          }

          setIsEditing(false);
          setSnackbar({
            open: true,
            message: 'Cập nhật dự án thành công!',
            severity: 'success'
          });
        } catch (fetchError) {
          console.error('Error fetching updated data:', fetchError);
          setSnackbar({
            open: true,
            message: 'Cập nhật thành công nhưng không thể tải lại dữ liệu',
            severity: 'warning'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Có lỗi xảy ra khi cập nhật dự án',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.message || 'Không thể cập nhật dự án',
        severity: 'error'
      });
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (event) => {
    const { name, value } = event.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));

    // Nếu thay đổi phòng ban, cập nhật lại danh sách người quản lý
    if (name === 'departmentId') {
      try {
        const [deptResponse, userResponse] = await Promise.all([
          departmentService.getDepartmentById(value),
          staffService.listUserByDep(value)
        ]);

        if (deptResponse) {
          setDepartments([deptResponse.data]);
        }

        if (userResponse) {
          setManagers(userResponse.data);
          // Reset người quản lý khi đổi phòng ban
          setEditedProject(prev => ({
            ...prev,
            managerId: ''
          }));
        }
      } catch (err) {
        console.error('Error fetching department and managers:', err);
        setError('Không thể tải danh sách người quản lý');
      }
    }
  };

  const handleDateChange = (name, value) => {
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDownload = (fileName) => {
    console.log('Downloading:', fileName);
    // Implement download logic here
  };

  const handleAddAttachment = () => {
    setOpenAttachmentDialog(true);
  };

  const handleEditAttachment = (attachment) => {
    setSelectedAttachment(attachment);
    setNewAttachment({
      name: attachment.name,
      version: attachment.version,
      file: null,
      fileName: attachment.fileName
    });
    setOpenAttachmentDialog(true);
  };

  const handleDeleteAttachment = (attachmentId) => {
    const updatedAttachments = project.attachments.filter(doc => doc.id !== attachmentId);
    setProject({
      ...project,
      attachments: updatedAttachments
    });
    setSnackbar({
      open: true,
      message: 'Xóa tài liệu thành công',
      severity: 'success'
    });
  };

  const handleSaveAttachment = () => {
    let updatedAttachments;
    if (selectedAttachment) {
      updatedAttachments = project.attachments.map(doc =>
        doc.id === selectedAttachment.id
          ? {
            ...doc,
            name: newAttachment.name,
            version: newAttachment.version,
            fileName: newAttachment.file ? newAttachment.file.name : doc.fileName,
            updatedBy: 'Người dùng hiện tại',
            uploadDate: new Date().toISOString()
          }
          : doc
      );
    } else {
      const newDoc = {
        ...newAttachment,
        id: project.attachments.length + 1,
        updatedBy: 'Người dùng hiện tại',
        uploadDate: new Date().toISOString()
      };
      updatedAttachments = [...project.attachments, newDoc];
    }

    setProject({
      ...project,
      attachments: updatedAttachments
    });
    handleCloseAttachmentDialog();
    setSnackbar({
      open: true,
      message: selectedAttachment ? 'Cập nhật tài liệu thành công' : 'Thêm tài liệu mới thành công',
      severity: 'success'
    });
  };

  const handleCloseAttachmentDialog = () => {
    setOpenAttachmentDialog(false);
    setNewAttachment({
      name: '',
      version: '',
      file: null,
      fileName: ''
    });
    setSelectedAttachment(null);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = project.tasks.filter(task => task.id !== taskId);
    setProject({
      ...project,
      tasks: updatedTasks
    });
    setSnackbar({
      open: true,
      message: 'Xóa công việc thành công',
      severity: 'success'
    });
  };

  const handleSaveTask = async () => {
    try {
      setLoading(true);
      const taskData = {
        code: newTask.code,
        name: newTask.name,
        taskTypeId: 2,
        departmentId: project.departmentId,
        assigneeId: newTask.assigneeId,
        priorityId: newTask.priorityId || 2,
        projectId: id,
        description: newTask.description,
        startDate: newTask.startDate,
        dueDate: newTask.dueDate,
      };

      if (selectedTask) {
        // Xử lý cập nhật task
        const response = await taskService.updateTask(selectedTask.id, taskData);
        if (response && response.data) {
          const updatedTasks = project.tasks.map(task =>
            task.id === selectedTask.id ? response.data : task
          );
          setProject({
            ...project,
            tasks: updatedTasks
          });
        }
      } else {
        // Xử lý thêm task mới
        const response = await taskService.createTask(taskData);
        if (response && response.data) {
          setProject({
            ...project,
            tasks: [...project.tasks, response.data]
          });
        }
      }
      handleCloseTaskDialog();
      setSnackbar({
        open: true,
        message: selectedTask ? 'Cập nhật công việc thành công' : 'Thêm công việc mới thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbar({
        open: true,
        message: error.response?.message || 'Không thể lưu công việc',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate('/project/list')}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Chi tiết dự án</Typography>
            {isEditing ? (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  name="state"
                  value={editedProject.state}
                  onChange={handleProjectChange}
                  sx={{
                    bgcolor: getStatusColor(editedProject.state),
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    height: '32px',
                    '& .MuiSelect-select': {
                      py: 0.5
                    }
                  }}
                >
                  <MenuItem value={2}>Đang thực hiện</MenuItem>
                  <MenuItem value={3}>Hoàn thành</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Chip
                label={PROJECT_STATES[project.state]}
                size="small"
                sx={{
                  bgcolor: getStatusColor(project.state),
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  height: '32px'
                }}
              />
            )}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          {project.state === 2 && isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
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
                startIcon={<SaveIcon />}
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
            </>
          ) : project.state === 2 && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
            >
              CHỈNH SỬA
            </Button>
          )}
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã dự án
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="code"
                      value={editedProject.code}
                      onChange={handleProjectChange}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1">{project.code}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tên dự án
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="name"
                      value={editedProject.name}
                      onChange={handleProjectChange}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1">{project.name}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Người phụ trách
                  </Typography>
                  {isEditing ? (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        name="managerId"
                        value={editedProject.managerId || ''}
                        onChange={handleProjectChange}
                      >
                        <MenuItem value="">-- Chọn người phụ trách --</MenuItem>
                        {managers && managers.length > 0 && managers.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body1">
                      {(() => {
                        console.log('Managers:', managers);
                        console.log('Project Manager ID:', project.managerId);
                        const manager = managers && managers.length > 0 ? 
                          managers.find(m => String(m.id) === String(project.managerId)) : null;
                        console.log('Found Manager:', manager);
                        return manager ? manager.name : 'Chưa có người phụ trách';
                      })()}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phòng ban thực hiện
                  </Typography>
                  {isEditing ? (
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Phòng ban</InputLabel>
                      <Select
                        name="departmentId"
                        value={project.departmentId}
                        label="Phòng ban"
                        disabled
                        sx={{
                          '& .MuiSelect-select': {
                            color: 'text.primary'
                          }
                        }}
                      >
                        <MenuItem value={project.departmentId}>
                          {departments.find(d => d.id === project.departmentId)?.name || 'Chưa có phòng ban'}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body1">
                      {departments.find(d => d.id === project.departmentId)?.name || 'Chưa có phòng ban'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại dự án
                  </Typography>
                  {isEditing ? (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        name="projectTypeId"
                        value={editedProject.projectTypeId}
                        onChange={handleProjectChange}
                      >
                        {Object.entries(PROJECT_TYPES).map(([key, value]) => (
                          <MenuItem key={key} value={Number(key)}>{value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body1">
                      {PROJECT_TYPES[project.projectTypeId]}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày bắt đầu
                  </Typography>
                  {isEditing ? (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={editedProject.startDate}
                        onChange={(newValue) => handleDateChange('startDate', newValue)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { mt: 1 },
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  ) : (
                    <Typography variant="body1">{formatDate(project.startDate)}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày kết thúc
                  </Typography>
                  {isEditing ? (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={editedProject.endDate}
                        onChange={(newValue) => handleDateChange('endDate', newValue)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { mt: 1 },
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  ) : (
                    <Typography variant="body1">{formatDate(project.endDate)}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày hoàn thành thực tế
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(project.completedDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="description"
                      value={editedProject.description}
                      onChange={handleProjectChange}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {project.description}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Phần tài liệu đính kèm */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Tài liệu đính kèm
                </Typography>
                {project.state === 2 && (
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => {
                      setSelectedAttachment(null);
                      handleAddAttachment();
                    }}
                    sx={{
                      backgroundColor: '#2e7d32',
                      '&:hover': {
                        backgroundColor: '#1b5e20'
                      }
                    }}
                  >
                    THÊM TÀI LIỆU
                  </Button>
                )}
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Tên tài liệu</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Phiên bản</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tệp đính kèm</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Người cập nhật</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ngày tải lên</TableCell>
                      {project.state === 2 && (
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {project.attachments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>{doc.version}</TableCell>
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
                            onClick={() => handleDownload(doc.fileName)}
                          >
                            {doc.fileName}
                          </Typography>
                        </TableCell>
                        <TableCell>{doc.updatedBy}</TableCell>
                        <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                        {project.state === 2 && (
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditAttachment(doc)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteAttachment(doc.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Phần lịch sử quy trình */}
            <ProjectHistory history={projectHistory} />

            {/* Phần danh sách công việc */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Danh sách công việc
                </Typography>
                {project.state === 2 && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedTask(null);
                      setOpenTaskDialog(true);
                    }}
                    sx={{
                      backgroundColor: '#2e7d32',
                      '&:hover': {
                        backgroundColor: '#1b5e20'
                      }
                    }}
                  >
                    THÊM
                  </Button>
                )}
              </Box>

              <Stack spacing={2}>
                {project.tasks.map((task) => (
                  <Paper
                    key={task.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        borderColor: '#bdbdbd'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: '#2196f3',
                          cursor: 'pointer',
                          '&:hover': {
                            color: '#1976d2',
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => navigate(`/task/detail/${task.id}`)}
                      >
                        {task.name}
                      </Typography>
                      {project.state === 2 && (
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditTask(task)}
                            sx={{
                              color: 'primary.main',
                              p: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(33, 150, 243, 0.08)'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTask(task.id)}
                            sx={{
                              color: 'error.main',
                              p: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(244, 67, 54, 0.08)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </Box>

                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                          Thực hiện:
                        </Typography>
                        <Typography variant="body2">
                          {task.assignee}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                          Thời gian:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(task.startDate)} - {formatDate(task.endDate)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                          Độ ưu tiên:
                        </Typography>
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={{
                            height: '24px',
                            fontSize: '0.75rem',
                            bgcolor: getPriorityColor(task.priority),
                            color: 'white',
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog thêm/sửa công việc */}
      {project.state === 2 && (
        <Dialog
          open={openTaskDialog}
          onClose={handleCloseTaskDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{
            pb: 2,
            borderBottom: '1px solid #e0e0e0',
            color: '#1976d2',
            fontWeight: 600
          }}>
            {selectedTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mã công việc"
                  name="code"
                  value={newTask.code || ''}
                  onChange={(e) => setNewTask({ ...newTask, code: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tên công việc"
                  name="name"
                  value={newTask.name || ''}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Phòng ban</InputLabel>
                  <Select
                    name="departmentId"
                    value={project.departmentId}
                    label="Phòng ban"
                    disabled
                    sx={{
                      '& .MuiSelect-select': {
                        color: 'text.primary'
                      }
                    }}
                  >
                    <MenuItem value={project.departmentId}>
                      {departments.find(d => d.id === project.departmentId)?.name || 'Chưa có phòng ban'}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Người thực hiện</InputLabel>
                  <Select
                    name="assigneeId"
                    value={newTask.assigneeId || ''}
                    label="Người thực hiện"
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                  >
                    <MenuItem value="">-- Chọn người thực hiện --</MenuItem>
                    {managers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
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
                    value={newTask.priorityId || 2}
                    label="Mức độ ưu tiên"
                    onChange={(e) => setNewTask({ ...newTask, priorityId: e.target.value })}
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
                  value={newTask.startDate || ''}
                  onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
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
                  value={newTask.dueDate || ''}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Mô tả chi tiết công việc"
                  name="description"
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'inherit'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={handleCloseTaskDialog}>
              HỦY
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveTask}
              disabled={!newTask.name || !newTask.assigneeId || !newTask.startDate || !newTask.dueDate}
            >
              {selectedTask ? 'LƯU' : 'THÊM'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog thêm/sửa tài liệu */}
      {project.state === 2 && (
        <Dialog
          open={openAttachmentDialog}
          onClose={handleCloseAttachmentDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{
            pb: 2,
            borderBottom: '1px solid #e0e0e0',
            color: '#1976d2',
            fontWeight: 600
          }}>
            {selectedAttachment ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên tài liệu"
                  value={newAttachment.name}
                  onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Chọn tệp
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewAttachment({
                          ...newAttachment,
                          file: file,
                          fileName: file.name
                        });
                      }
                    }}
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
            <Button onClick={handleCloseAttachmentDialog}>
              HỦY
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAttachment}
              disabled={!newAttachment.name || !newAttachment.version || (!selectedAttachment && !newAttachment.file)}
            >
              {selectedAttachment ? 'LƯU' : 'THÊM'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={1000}
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

export default ProjectDetail;