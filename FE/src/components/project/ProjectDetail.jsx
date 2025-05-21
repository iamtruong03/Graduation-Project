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

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState({
    attachments: [],
    tasks: []
  });
  const [departments, setDepartments] = useState({});
  const [managers, setManagers] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({
    attachments: [],
    tasks: []
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectResponse, deptResponse, userResponse, historyResponse] = await Promise.all([
          projectService.getProjectById(id),
          departmentService.getAll(),
          staffService.listUserChildDep(),
          projectService.getProjectHistory(id)
        ]);

        console.log('History Response:', historyResponse);

        if (projectResponse && projectResponse.status === 200) {
          const projectData = {
            ...projectResponse.data,
            attachments: projectResponse.data.attachments || [],
            tasks: projectResponse.data.tasks || []
          };
          setProject(projectData);
          setEditedProject(projectData);
        } else {
          setError('Không thể tải thông tin dự án');
        }

        if (deptResponse.data) {
          const deptMap = {};
          deptResponse.data.forEach(dept => {
            deptMap[dept.id] = dept.name;
          });
          setDepartments(deptMap);
        }

        if (userResponse.data) {
          const userMap = {};
          userResponse.data.forEach(user => {
            userMap[user.id] = user.name;
          });
          setManagers(userMap);
        }

        console.log('History Response:', historyResponse);
        if (Array.isArray(historyResponse)) {
          console.log('Setting project history with data:', historyResponse);
          setProjectHistory(historyResponse);
        } else {
          console.log('Invalid history response, setting empty array');
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
      case 1: return '#ed6c02'; // Chờ duyệt
      case 2: return '#2e7d32'; // Đã duyệt
      case 3: return '#d32f2f'; // Từ chối
      case 4: return '#1976d2'; // Đang thực hiện
      case 5: return '#2e7d32'; // Hoàn thành
      case 6: return '#d32f2f'; // Quá hạn
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

  const handleCreateTask = () => {
    // Thêm task mới vào danh sách
    const newTaskWithId = {
      ...newTask,
      id: project.tasks.length + 1,
      startDate: new Date(newTask.startDate).toISOString(),
      endDate: new Date(newTask.endDate).toISOString(),
    };
    setProject({
      ...project,
      tasks: [...project.tasks, newTaskWithId],
    });
    handleCloseTaskDialog();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProject({...project});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProject({...project});
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await projectService.updateProjectState(
        id,
        editedProject.state,
        editedProject.updatedBy,
        'Cập nhật thông tin dự án'
      );
      if (response.success) {
        setProject(response.data);
        setIsEditing(false);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Không thể cập nhật dự án');
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (event) => {
    const { name, value } = event.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
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
  };

  const handleSaveAttachment = () => {
    let updatedAttachments;
    if (selectedAttachment) {
      // Cập nhật tài liệu hiện có
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
      // Thêm tài liệu mới
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

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setNewTask({
      name: task.name,
      assignee: task.assignee,
      startDate: task.startDate,
      endDate: task.endDate,
      priority: task.priority,
      status: task.status
    });
    setOpenTaskDialog(true);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = project.tasks.filter(task => task.id !== taskId);
    setProject({
      ...project,
      tasks: updatedTasks
    });
  };

  const handleSaveTask = () => {
    let updatedTasks;
    if (selectedTask) {
      // Cập nhật công việc hiện có
      updatedTasks = project.tasks.map(task =>
        task.id === selectedTask.id
          ? { ...newTask, id: task.id }
          : task
      );
    } else {
      // Thêm công việc mới
      const newTaskWithId = {
        ...newTask,
        id: project.tasks.length + 1
      };
      updatedTasks = [...project.tasks, newTaskWithId];
    }

    setProject({
      ...project,
      tasks: updatedTasks
    });
    handleCloseTaskDialog();
  };

  const handleSubmitApproval = async () => {
    try {
      setLoading(true);
      const response = await projectService.submitForApproval(id, project.approvers);
      if (response.success) {
        setProject(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Không thể gửi phê duyệt');
      console.error('Error submitting approval:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await projectService.approveProject(id, 'CURRENT_USER'); // Thay thế bằng user thực tế
      if (response.success) {
        setProject(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Không thể phê duyệt dự án');
      console.error('Error approving project:', error);
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
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Chi tiết dự án</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {project.state === 4 && isEditing ? (
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
          ) : project.state === 4 && (
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
                    <TextField
                      fullWidth
                      name="managerId"
                      value={editedProject.managerId}
                      onChange={handleProjectChange}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  ) : (
            <Typography variant="body1">{managers[project.managerId] || project.managerId}</Typography>
                  )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Phòng ban thực hiện
            </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="departmentId"
                      value={editedProject.departmentId}
                      onChange={handleProjectChange}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  ) : (
            <Typography variant="body1"> {departments[project.departmentId] || project.departmentId}</Typography>
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
              Trạng thái
            </Typography>
                  {isEditing ? (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        name="state"
                        value={editedProject.state}
                        onChange={handleProjectChange}
                      >
                        {Object.entries(PROJECT_STATES).map(([key, value]) => (
                          <MenuItem key={key} value={Number(key)}>{value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
            <Chip
              label={PROJECT_STATES[project.state]}
              size="small"
              sx={{
                bgcolor: getStatusColor(project.state),
                color: 'white',
                mt: 0.5,
              }}
            />
                  )}
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
                {project.state === 4 && (
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
                      {project.state === 4 && (
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
                        {project.state === 4 && (
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
                {project.state === 4 && (
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
                      {project.state === 4 && (
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
                          Trạng thái:
                        </Typography>
                        <Chip
                          label={task.status}
                          size="small"
                          sx={{
                            height: '24px',
                            fontSize: '0.75rem',
                            bgcolor: getStatusColor(task.status),
                            color: 'white',
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
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
      {project.state === 4 && (
        <Dialog 
          open={openTaskDialog} 
          onClose={handleCloseTaskDialog}
          maxWidth="sm"
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
            <Grid container spacing={2}>
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
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={newTask.status}
                    label="Trạng thái"
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    <MenuItem value="NEW">Mới</MenuItem>
                    <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                    <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
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
              disabled={!newTask.name || !newTask.assignee || !newTask.startDate || !newTask.endDate}
            >
              {selectedTask ? 'LƯU' : 'THÊM'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog thêm/sửa tài liệu */}
      {project.state === 4 && (
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
                <TextField
                  fullWidth
                  label="Phiên bản"
                  value={newAttachment.version}
                  onChange={(e) => setNewAttachment({ ...newAttachment, version: e.target.value })}
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
    </Box>
  );
};

export default ProjectDetail;