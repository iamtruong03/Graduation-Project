import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import taskService from '../../services/taskService';
import TaskHistory from './TaskHistory';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Divider,
  Chip,
  IconButton,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const mockTask = {
  id: 1,
  code: 'CV001',
  name: 'Phát triển tính năng mới',
  taskType: 'project',
  project: 'Dự án A',
  department: 'Phòng kỹ thuật',
  type: 'Phát triển',
  status: 'Đang thực hiện',
  priority: 'Cao',
  manager: 'Nguyễn Văn A',
  assignee: 'Trần Thị B',
  description: 'Phát triển tính năng quản lý công việc mới cho hệ thống, bao gồm các chức năng thêm, sửa, xóa và phân công công việc.',
  active: true,
  startDate: '15/07/2023',
  dueDate: '30/07/2023',
  createdAt: '15/07/2023',
  updatedAt: '20/07/2023',
  progress: 60,
  statusHistory: [
    { status: 'Chưa bắt đầu', updatedAt: '15/07/2023', updatedBy: 'Nguyễn Văn A' },
    { status: 'Đang thực hiện', updatedAt: '16/07/2023', updatedBy: 'Trần Thị B' },
    { status: 'Tạm dừng', updatedAt: '18/07/2023', updatedBy: 'Nguyễn Văn A' },
    { status: 'Đang thực hiện', updatedAt: '20/07/2023', updatedBy: 'Trần Thị B' },
  ],
  attachments: [
    { id: 1, name: 'Tài liệu phân tích.docx', size: '2.5MB', uploadedAt: '15/07/2023' },
    { id: 2, name: 'Thiết kế giao diện.pdf', size: '5.1MB', uploadedAt: '16/07/2023' },
    { id: 3, name: 'Hướng dẫn sử dụng.pdf', size: '1.8MB', uploadedAt: '20/07/2023' },
  ]
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Đang thực hiện':
      return 'info';
    case 'Hoàn thành':
      return 'success';
    case 'Tạm dừng':
      return 'warning';
    case 'Đã hủy':
      return 'error';
    default:
      return 'grey';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Cao':
      return 'error';
    case 'Trung bình':
      return 'warning';
    case 'Thấp':
      return 'success';
    default:
      return 'default';
  }
};

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskData, historyData] = await Promise.all([
          taskService.getTaskById(id),
          taskService.getTaskHistory(id)
        ]);
        setTask(taskData);
        setTaskHistory(historyData);
      } catch (error) {
        console.error('Error fetching task data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleClose = () => {
    navigate('/task/list');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedTask({...task});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTask(null);
  };

  const handleSave = async () => {
    try {
      const updatedTask = await taskService.updateTask(id, editedTask);
      setTask(updatedTask);
      // Refresh history after update
      const newHistory = await taskService.getTaskHistory(id);
      setTaskHistory(newHistory);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Chi tiết công việc</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {isEditing ? (
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
          ) : (
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
          {/* Thông tin chính */}
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="name"
                        value={editedTask.name}
                        onChange={handleTaskChange}
                        size="small"
                      />
                    ) : (
                      task.name
                    )}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Chip
                      icon={<AssignmentIcon />}
                      label={task.code}
                      variant="outlined"
                    />
                    {isEditing ? (
                      <FormControl sx={{ minWidth: 150 }} size="small">
                        <Select
                          name="priority"
                          value={editedTask.priority}
                          onChange={handleTaskChange}
                        >
                          <MenuItem value="Cao">Cao</MenuItem>
                          <MenuItem value="Trung bình">Trung bình</MenuItem>
                          <MenuItem value="Thấp">Thấp</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        icon={<FlagIcon />}
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                      />
                    )}
                    {isEditing ? (
                      <FormControl sx={{ minWidth: 150 }} size="small">
                        <Select
                          name="status"
                          value={editedTask.status}
                          onChange={handleTaskChange}
                        >
                          <MenuItem value="Chưa bắt đầu">Chưa bắt đầu</MenuItem>
                          <MenuItem value="Đang thực hiện">Đang thực hiện</MenuItem>
                          <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                          <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status)}
                      />
                    )}
                  </Stack>
                </Box>

                <Divider />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Loại công việc
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              name="taskType"
                              value={editedTask.taskType}
                              onChange={handleTaskChange}
                            >
                              <MenuItem value="project">Công việc dự án</MenuItem>
                              <MenuItem value="department">Công việc phòng ban</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>
                            {task.taskType === 'project' ? 'Công việc dự án' : 'Công việc phòng ban'}
                          </Typography>
                        )}
                      </Box>

                      {(isEditing ? editedTask.taskType : task.taskType) === 'project' && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Dự án
                          </Typography>
                          {isEditing ? (
                            <FormControl fullWidth size="small">
                              <Select
                                name="project"
                                value={editedTask.project}
                                onChange={handleTaskChange}
                              >
                                <MenuItem value="Dự án A">Dự án A</MenuItem>
                                <MenuItem value="Dự án B">Dự án B</MenuItem>
                                <MenuItem value="Dự án C">Dự án C</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography>{task.project}</Typography>
                          )}
                        </Box>
                      )}

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <BusinessIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Phòng ban
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              name="department"
                              value={editedTask.department}
                              onChange={handleTaskChange}
                            >
                              <MenuItem value="Phòng kỹ thuật">Phòng kỹ thuật</MenuItem>
                              <MenuItem value="Phòng kinh doanh">Phòng kinh doanh</MenuItem>
                              <MenuItem value="Phòng nhân sự">Phòng nhân sự</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{task.department}</Typography>
                        )}
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Người phê duyệt
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              name="manager"
                              value={editedTask.manager}
                              onChange={handleTaskChange}
                            >
                              <MenuItem value="Nguyễn Văn A">Nguyễn Văn A</MenuItem>
                              <MenuItem value="Trần Thị B">Trần Thị B</MenuItem>
                              <MenuItem value="Lê Văn C">Lê Văn C</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {task.manager.charAt(0)}
                            </Avatar>
                            <Typography>{task.manager}</Typography>
                          </Stack>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Người thực hiện
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              name="assignee"
                              value={editedTask.assignee}
                              onChange={handleTaskChange}
                            >
                              <MenuItem value="Trần Thị B">Trần Thị B</MenuItem>
                              <MenuItem value="Phạm Văn C">Phạm Văn C</MenuItem>
                              <MenuItem value="Lê Thị D">Lê Thị D</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {task.assignee.charAt(0)}
                            </Avatar>
                            <Typography>{task.assignee}</Typography>
                          </Stack>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <ScheduleIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Thời gian
                        </Typography>
                        {isEditing ? (
                          <Stack direction="row" spacing={2}>
                            <TextField
                              type="date"
                              name="startDate"
                              label="Ngày bắt đầu"
                              value={editedTask.startDate}
                              onChange={handleTaskChange}
                              size="small"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                              type="date"
                              name="dueDate"
                              label="Ngày kết thúc"
                              value={editedTask.dueDate}
                              onChange={handleTaskChange}
                              size="small"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                            />
                          </Stack>
                        ) : (
                          <Typography>
                            {task.startDate} - {task.dueDate}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Mô tả công việc
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="description"
                      value={editedTask.description}
                      onChange={handleTaskChange}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {task.description}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar - Lịch sử trạng thái */}
          <Grid item xs={12} md={4}>
            <TaskHistory history={taskHistory} />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TaskDetail;