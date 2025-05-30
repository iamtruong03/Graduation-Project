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
  TextField,
  CircularProgress,
  Alert
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

const getStatusColor = (state) => {
  if (!state) return 'default';
  
  switch (state) {
    case 1: // Chưa bắt đầu
      return 'warning';
    case 2: // Đang thực hiện
      return 'info';
    case 3: // Hoàn thành
      return 'success';
    case 4: // Tạm dừng
      return 'warning';
    case 5: // Đã hủy
      return 'error';
    default:
      return 'default';
  }
};

const getStatusName = (state) => {
  switch (state) {
    case 1:
      return 'Chưa bắt đầu';
    case 2:
      return 'Đang thực hiện';
    case 3:
      return 'Hoàn thành';
    case 4:
      return 'Tạm dừng';
    case 5:
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

const getPriorityColor = (priorityId) => {
  if (!priorityId) return 'default';
  
  switch (priorityId) {
    case 3: // Cao
      return 'error';
    case 2: // Trung bình
      return 'warning';
    case 1: // Thấp
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityName = (priorityId) => {
  switch (priorityId) {
    case 3:
      return 'Cao';
    case 2:
      return 'Trung bình';
    case 1:
      return 'Thấp';
    default:
      return 'Không xác định';
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
  const [error, setError] = useState(null);

  // Fetch lists for dropdowns in edit mode
  const [projectList, setProjectList] = useState([]);
  const [assigneeList, setAssigneeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [approverList, setApproverList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [taskDataResponse, historyDataResponse] = await Promise.all([
          taskService.getTaskById(id),
          taskService.getTaskHistory(id)
        ]);
        
        const taskData = taskDataResponse?.data; // Access data property from response
        const historyData = historyDataResponse?.data; // Access data property from response

        if (taskData) {
           // Map API response to task state
          const mappedTask = {
            id: taskData.id,
            code: taskData.code,
            name: taskData.name,
            description: taskData.description || '',
            status: taskData.status,
            createDate: taskData.createDate,
            modifiedDate: taskData.modifiedDate,
            version: taskData.version,
            createBy: taskData.createBy,
            updateBy: taskData.updateBy,
            state: taskData.state,
            taskTypeId: taskData.taskTypeId,
            riskId: taskData.riskId,
            departmentId: taskData.departmentId,
            projectId: taskData.projectId,
            priorityId: taskData.priorityId,
            startDate: taskData.startDate,
            dueDate: taskData.dueDate,
            completedDate: taskData.completedDate,
            assigneeId: taskData.assigneeId,
            approverId: taskData.approverId,
            isApproved: taskData.isApproved,
            // Thêm các trường hiển thị
            statusName: getStatusName(taskData.state),
            priorityName: getPriorityName(taskData.priorityId),
            // Add placeholder for department/project name if needed and not returned by API
            departmentName: taskData.departmentName || null, // Assume API might return these
            projectName: taskData.projectName || null, // Assume API might return these
            assigneeName: taskData.assigneeName || null, // Assume API might return these
            approverName: taskData.approverName || null // Assume API might return these
          };
          
          setTask(mappedTask);
        } else {
          // Handle case where task data is null/undefined but request was successful
          setTask(null);
          setError('Không tìm thấy thông tin công việc cho ID này.');
        }

        if (historyData && historyData.data) { // historyData is response object, historyData.data is array
          setTaskHistory(historyData.data);
        } else {
          setTaskHistory([]);
        }

      } catch (err) {
        console.error('Error fetching task data:', err);
        setTask(null); // Ensure task state is null on error
        setError(err.response?.data?.message || err.message || 'Không thể tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch lists for dropdowns when entering edit mode
  useEffect(() => {
    if (isEditing) {
      fetchProjectList();
      fetchDepartmentList();
      fetchApproverList();
      if (editedTask?.departmentId) {
        fetchAssigneeListByDepartment(editedTask.departmentId);
      }
    }
  }, [isEditing, editedTask?.departmentId]);

  const fetchProjectList = async () => {
    try {
      const response = await taskService.getAllProjects(); // Assuming such a service method exists
      if (response.data) {
        setProjectList(response.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDepartmentList = async () => {
    try {
      const response = await taskService.getAllDepartments(); // Assuming such a service method exists
      if (response.data) {
        setDepartmentList(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchApproverList = async () => {
    try {
      const response = await taskService.getAllUsers(); // Assuming a service method to get all users
      if (response.data) {
        setApproverList(response.data);
      }
    } catch (error) {
      console.error('Error fetching approvers:', error);
    }
  };

  const fetchAssigneeListByDepartment = async (departmentId) => {
    if (!departmentId) {
      setAssigneeList([]);
      return;
    }
    try {
      const response = await taskService.getUsersByDepartment(departmentId); // Assuming a service method to get users by department
      if (response.data) {
        setAssigneeList(response.data);
      }
    } catch (error) {
      console.error('Error fetching assignees by department:', error);
      setAssigneeList([]);
    }
  };

  const handleClose = () => {
    navigate('/task/list');
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize editedTask with current task data, using correct backend field names
    setEditedTask({
      ...task,
      taskTypeId: task.taskTypeId || '',
      departmentId: task.departmentId || '',
      projectId: task.projectId || '',
      approverId: task.approverId || '',
      assigneeId: task.assigneeId || '',
      state: task.state || 1, // Default to 1 if null
      priorityId: task.priorityId || 2, // Default to 2 if null
      // Format dates for date inputs if they exist
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      completedDate: task.completedDate ? new Date(task.completedDate).toISOString().split('T')[0] : '',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTask(null);
    setError(null); // Clear any form errors
  };

  const handleSave = async () => {
    // Basic validation for required fields (adjust based on your requirements)
    if (!editedTask.name || !editedTask.code || !editedTask.assigneeId || !editedTask.startDate || !editedTask.dueDate || !editedTask.state || !editedTask.priorityId) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc (Mã, Tên, Người thực hiện, Ngày bắt đầu, Ngày kết thúc, Trạng thái, Mức độ ưu tiên).');
      return;
    }
    // Additional validation based on task type
    if (editedTask.taskTypeId === 2 && !editedTask.projectId) { // Assuming taskTypeId 2 is project task
      setError('Vui lòng chọn Dự án cho công việc dự án.');
      return;
    }
    if (editedTask.taskTypeId === 3 && !editedTask.departmentId) { // Assuming taskTypeId 3 is department task
      setError('Vui lòng chọn Phòng ban cho công việc phòng ban.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data to send to backend, ensuring correct format and fields
      const taskDataToUpdate = {
        id: editedTask.id,
        code: editedTask.code,
        name: editedTask.name,
        taskTypeId: editedTask.taskTypeId,
        projectId: editedTask.projectId,
        departmentId: editedTask.departmentId,
        approverId: editedTask.approverId,
        assigneeId: editedTask.assigneeId,
        state: editedTask.state,
        priorityId: editedTask.priorityId,
        description: editedTask.description,
        startDate: editedTask.startDate,
        dueDate: editedTask.dueDate,
        completedDate: editedTask.completedDate || null, // Include completedDate if available
        // Do not send createDate, modifiedDate, createBy, updateBy, version back
      };

      const response = await taskService.updateTask(editedTask.id, taskDataToUpdate);
      if (response) { // Assuming successful update returns a response
        // Refresh task data and history after successful update
        const [updatedTaskData, newHistory] = await Promise.all([
          taskService.getTaskById(id), // Fetch the updated task details
          taskService.getTaskHistory(id) // Fetch the updated history
        ]);
        setTask(updatedTaskData); // Update the main task state
        setTaskHistory(newHistory); // Update the history state
        setIsEditing(false);
      } else {
        setError('Cập nhật công việc không thành công. Vui lòng kiểm tra dữ liệu.');
      }

    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));

    // If department changes in edit mode, fetch assignees for that department
    if (name === 'departmentId') {
      fetchAssigneeListByDepartment(value);
      setEditedTask(prev => ({
        ...prev,
        assigneeId: '' // Clear selected assignee when department changes
      }));
    }
    // If taskType changes, clear project and department IDs
    if (name === 'taskTypeId') {
      setEditedTask(prev => ({
        ...prev,
        projectId: '',
        departmentId: '',
        assigneeId: '' // Clear assignee as well
      }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !task) { // Show error message if task failed to load initially
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleClose}>
          Quay lại
        </Button>
      </Box>
    );
  }

  // Don't render if task is null after loading
  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Không tìm thấy công việc.</Typography>
        <Button variant="contained" onClick={handleClose}>Quay lại</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Chi tiết công việc: {task.name}</Typography> {/* Display task name in title */}
          <Box sx={{ flexGrow: 1 }} />
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={loading}
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
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} // Show loading spinner on button
                onClick={handleSave}
                disabled={loading}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                {loading ? 'Đang lưu...' : 'LƯU'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />} // Removed loading check here
              onClick={handleEdit}
              disabled={task?.state !== 2} // Disable if state is not 'Đang thực hiện' (state 2)
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

        {error && ( // Show form errors here as well
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

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
                        value={editedTask?.name || ''} // Use editedTask and nullish coalescing
                        onChange={handleTaskChange}
                        size="small"
                        label="Tên công việc"
                        required
                      />
                    ) : (
                      task.name
                    )}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Chip
                      icon={<AssignmentIcon />}
                      label={isEditing ? editedTask?.code || '' : task?.code || ''}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    {isEditing ? (
                      <FormControl sx={{ minWidth: 150 }} size="small" required>
                        <InputLabel>Mức độ ưu tiên</InputLabel>
                        <Select
                          name="priorityId"
                          value={editedTask?.priorityId || ''}
                          onChange={handleTaskChange}
                        >
                          <MenuItem value={3}>Cao</MenuItem>
                          <MenuItem value={2}>Trung bình</MenuItem>
                          <MenuItem value={1}>Thấp</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        icon={<FlagIcon />}
                        label={task?.priorityName || getPriorityName(task?.priorityId) || 'N/A'}
                        color={getPriorityColor(task?.priorityId)}
                        variant="outlined"
                      />
                    )}
                    {isEditing ? (
                      <FormControl sx={{ minWidth: 150 }} size="small" required disabled={task?.state === 3}> {/* Disable if status is already Completed */}
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                          name="state"
                          value={editedTask?.state || ''}
                          onChange={handleTaskChange}
                        >
                          {task?.state !== 3 && ( // If current state is NOT Completed, allow changing to Completed or keep current
                            [1, 2, 4, 5].includes(task?.state) && <MenuItem value={task.state}>{getStatusName(task.state)}</MenuItem>
                          )}
                          {task?.state !== 3 && (
                            <MenuItem value={3}>Hoàn thành</MenuItem> // Always allow changing TO Completed
                          )}
                          {task?.state === 3 && ( // If current state IS Completed, only show Completed and disable
                            <MenuItem value={3}>Hoàn thành</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={task?.statusName || getStatusName(task?.state) || 'N/A'}
                        color={getStatusColor(task?.state)}
                        variant="outlined"
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
                        {/* Task Type is not editable based on previous changes */}
                        <Typography>
                          {task?.taskTypeId === 2 ? 'Công việc dự án' : task?.taskTypeId === 3 ? 'Công việc phòng ban' : 'Không xác định'}
                        </Typography>
                      </Box>

                      {task?.taskTypeId === 2 && ( // Conditionally render Project field based on taskTypeId
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Dự án
                          </Typography>
                          {isEditing ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Dự án</InputLabel>
                              <Select
                                name="projectId"
                                value={editedTask?.projectId || ''}
                                onChange={handleTaskChange}
                              >
                                {projectList.map(project => (
                                  <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography>
                              {task?.projectName || task?.projectId || 'N/A'}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {task?.taskTypeId === 3 && ( // Conditionally render Department field based on taskTypeId
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            <BusinessIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                            Phòng ban
                          </Typography>
                          {isEditing ? (
                            <FormControl fullWidth size="small" required>
                              <InputLabel>Phòng ban</InputLabel>
                              <Select
                                name="departmentId"
                                value={editedTask?.departmentId || ''}
                                onChange={handleTaskChange}
                              >
                                {departmentList.map(department => (
                                  <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography>
                              {task?.departmentName || task?.departmentId || 'N/A'}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      {/* Box cho Người thực hiện */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Người thực hiện
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small" required>
                            <InputLabel>Người thực hiện</InputLabel>
                            <Select
                              name="assigneeId" // Use assigneeId
                              value={editedTask?.assigneeId || ''} // Use editedTask assigneeId
                              onChange={handleTaskChange}
                            >
                              {assigneeList.map(assignee => (
                                <MenuItem key={assignee.id} value={assignee.id}>{assignee.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Stack direction="row" spacing={1} alignItems="center">
                            {/* Use assigneeName or assigneeId for display. Check if assigneeName exists before charAt */}
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {(task?.assigneeName && task?.assigneeName.length > 0) ? task.assigneeName.charAt(0) : (task?.assigneeId ? String(task.assigneeId).charAt(0) : '')}
                            </Avatar>
                            <Typography>{task?.assigneeName || task?.assigneeId || 'N/A'}</Typography>
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
                              value={editedTask?.startDate || ''}
                              onChange={handleTaskChange}
                              size="small"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              required
                            />
                            <TextField
                              type="date"
                              name="dueDate"
                              label="Ngày kết thúc"
                              value={editedTask?.dueDate || ''}
                              onChange={handleTaskChange}
                              size="small"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              required
                            />
                            {(editedTask?.state === 3 || task?.state === 3) && (
                              <TextField
                                type="date"
                                name="completedDate"
                                label="Ngày hoàn thành"
                                value={editedTask?.completedDate || ''}
                                onChange={handleTaskChange}
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required={isEditing && editedTask?.state === 3}
                              />
                            )}
                          </Stack>
                        ) : (
                          <Typography>
                            {task?.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'} - {task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                            {task?.completedDate && ` (Hoàn thành: ${new Date(task.completedDate).toLocaleDateString()})`}
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
                      value={editedTask?.description || ''}
                      onChange={handleTaskChange}
                      label="Mô tả chi tiết công việc"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {task?.description || 'Không có mô tả'}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar - Lịch sử trạng thái */}
          <Grid item xs={12} md={4}>
            {/* Pass correct status/state data to TaskHistory */}
            <TaskHistory history={taskHistory} />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TaskDetail;