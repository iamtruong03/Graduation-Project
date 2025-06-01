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
import documentService from '../../services/documentService';
import { PROJECT_STATES, PROJECT_TYPES } from '../../utils/constants';
import ProjectHistory from './ProjectHistory';
import TaskProjectList from './TaskProjectList';
import taskService from '../../services/taskService';
import categoryService from '../../services/categoryService';

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
  const [projectTypes, setProjectTypes] = useState({});
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    code: '',
    name: '',
    documentTypeId: '',
    projectId: id
  });
  const [documentTypes] = useState([
    { id: 1, name: 'Quy định' },
    { id: 2, name: 'Tài liệu Dự án' },
    { id: 3, name: 'Báo cáo' }
  ]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    documentTypeId: '',
    description: ''
  });
  const [departmentUsers, setDepartmentUsers] = useState([]);

  // Lấy uid từ token
  const currentManagerId = (() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Không tìm thấy token trong localStorage');
      return null;
    }
    try {
      // Giải mã token để lấy sub (user id)
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      console.log('Token data:', tokenData);
      const userId = Number(tokenData.sub);
      if (isNaN(userId)) {
        console.error('sub không phải là số hợp lệ:', tokenData.sub);
        return null;
      }
      console.log('User ID from token:', userId);
      return userId;
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
      return null;
    }
  })();

  const fetchDocuments = async () => {
    try {
      const response = await documentService.searchDocuments({
        search: "",
        projectId: id
      });
      
      if (response.status === 200) {
        setProject(prev => ({
          ...prev,
          attachments: response.data.content || []
        }));
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectResponse, historyResponse, tasksResponse, projectTypesResponse] = await Promise.all([
          projectService.getProjectById(id),
          projectService.getProjectHistory(id),
          taskService.getTasksByProjectId(id),
          categoryService.getCategoriesByType('projectTypeId')
        ]);

        if (projectResponse && projectResponse.status === 200) {
          const projectData = {
            ...projectResponse.data,
            attachments: [], // Khởi tạo mảng rỗng, sẽ được cập nhật sau
            tasks: tasksResponse?.data || []
          };
          setProject(projectData);
          setEditedProject(projectData);

          // Log để debug
          console.log('Current Manager ID (from token sub):', currentManagerId);
          console.log('Project Manager ID:', projectData.managerId);
          console.log('Is Manager:', currentManagerId === Number(projectData.managerId));
          console.log('Current User ID type:', typeof currentManagerId);
          console.log('Project Manager ID type:', typeof projectData.managerId);

          // Lấy thông tin phòng ban và danh sách người phụ trách
          if (projectData.departmentId) {
            try {
              const [deptResponse, userResponse] = await Promise.all([
                departmentService.getDepartmentById(projectData.departmentId),
                staffService.listUserByDep(projectData.departmentId)
              ]);

              if (deptResponse && deptResponse.data) {
                setDepartments([deptResponse.data]);
              }

              if (userResponse && userResponse.data) {
                setManagers(userResponse.data);
                setDepartmentUsers(userResponse.data); // Lưu danh sách người dùng
                // Log danh sách managers để debug
                console.log('Managers loaded:', userResponse.data);
              }
            } catch (err) {
              console.error('Error fetching department and managers:', err);
            }
          }
        }

        if (Array.isArray(historyResponse)) {
          setProjectHistory(historyResponse);
        }

        if (projectTypesResponse && projectTypesResponse.data) {
          const typeMap = {};
          projectTypesResponse.data.forEach(type => {
            typeMap[type.id] = type.name;
          });
          setProjectTypes(typeMap);
        }

        // Lấy danh sách tài liệu sau khi đã lấy thông tin dự án
        await fetchDocuments();

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
        updateBy: currentManagerId
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

  const handleDeleteAttachment = (docId) => {
    // Kiểm tra quyền xóa - chỉ manager mới được xóa
    if (currentManagerId !== Number(project.managerId)) {
      setSnackbar({
        open: true,
        message: 'Chỉ quản lý dự án mới được phép xóa tài liệu',
        severity: 'error'
      });
      return;
    }

    // Xử lý xóa tài liệu
    const updatedAttachments = project.attachments.filter(doc => doc.id !== docId);
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

  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true);
      await taskService.changeStatus(taskId);

      // Cập nhật lại danh sách task
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
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Không thể xóa công việc',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (task) => {
    try {
      // Kiểm tra trạng thái task
      if (task.state !== 2) {
        setSnackbar({
          open: true,
          message: 'Chỉ có thể chỉnh sửa công việc khi đang ở trạng thái thực hiện',
          severity: 'error'
        });
        return;
      }

      setSelectedTask(task);
      setNewTask({
        code: task.code || '',
        name: task.name,
        departmentId: project.departmentId,
        assigneeId: task.assigneeId || '',
        priorityId: task.priorityId || '',
        taskTypeId: 2,
        projectId: id,
        state: task.state || '',
        description: task.description || '',
        startDate: task.startDate ? format(new Date(task.startDate), 'yyyy-MM-dd') : '',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      });

      // Lấy danh sách người thực hiện theo phòng ban của dự án
      if (project.departmentId) {
        const response = await staffService.listUserByDep(project.departmentId);
        if (response && response.data) {
          setManagers(response.data);
        }
      }

      // Gọi API lấy thông tin task mới nhất
      const taskResponse = await taskService.getTaskById(task.id);
      if (taskResponse && taskResponse.data) {
        setSelectedTask(taskResponse.data);
        setNewTask({
          ...taskResponse.data,
          startDate: taskResponse.data.startDate ? format(new Date(taskResponse.data.startDate), 'yyyy-MM-dd') : '',
          dueDate: taskResponse.data.dueDate ? format(new Date(taskResponse.data.dueDate), 'yyyy-MM-dd') : '',
        });
      }

      setOpenTaskDialog(true);
    } catch (error) {
      console.error('Error in handleEditTask:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin công việc',
        severity: 'error'
      });
    }
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

  const handleSaveTask = async () => {
    try {
      setLoading(true);
      const taskData = {
        code: newTask.code || '',
        name: newTask.name || '',
        taskTypeId: 2,
        departmentId: project.departmentId,
        assigneeId: newTask.assigneeId,
        priorityId: newTask.priorityId || 2,
        projectId: id,
        state: newTask.state || 2,
        description: newTask.description || '',
        startDate: newTask.startDate || '',
        dueDate: newTask.dueDate || '',
      };

      // Log dữ liệu để debug
      console.log('Task data being sent:', taskData);
      console.log('Current Manager ID:', currentManagerId);
      console.log('Project Manager ID:', project.managerId);
      console.log('Is Manager:', currentManagerId === Number(project.managerId));

      // Validate dữ liệu trước khi gửi
      if (!taskData.name || !taskData.assigneeId || !taskData.startDate || !taskData.dueDate) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
          severity: 'error'
        });
        return;
      }

      // Kiểm tra quyền tạo task khi taskTypeId == 2
      if (taskData.taskTypeId === 2) {
        if (currentManagerId !== Number(project.managerId)) {
          setSnackbar({
            open: true,
            message: 'Chỉ có quản lý dự án mới được phép tạo công việc',
            severity: 'error'
          });
          return;
        }
      }

      // Đảm bảo các trường số là number
      taskData.taskTypeId = Number(taskData.taskTypeId);
      taskData.departmentId = Number(taskData.departmentId);
      taskData.assigneeId = Number(taskData.assigneeId);
      taskData.priorityId = Number(taskData.priorityId);
      taskData.projectId = Number(taskData.projectId);

      let response;
    if (selectedTask) {
        // Xử lý cập nhật task
        console.log('Updating task with ID:', selectedTask.id);
        response = await taskService.updateTask(selectedTask.id, taskData);
    } else {
        // Xử lý thêm task mới
        console.log('Creating new task');
        response = await taskService.createTask(taskData);
      }

      if (response && response.data) {
        // Cập nhật lại danh sách task
        const updatedTasks = selectedTask
          ? project.tasks.map(task => task.id === selectedTask.id ? response.data : task)
          : [...project.tasks, response.data];

    setProject({
      ...project,
      tasks: updatedTasks
    });

    handleCloseTaskDialog();
    setSnackbar({
      open: true,
      message: selectedTask ? 'Cập nhật công việc thành công' : 'Thêm công việc mới thành công',
      severity: 'success'
    });
      }
    } catch (error) {
      console.error('Error saving task:', error);
      console.error('Error response data:', error.response?.data);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Không thể lưu công việc',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        file: file,
        name: file.name
      }));
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      console.log('Uploading document with data:', uploadForm);

      // Kiểm tra quyền thêm tài liệu - chỉ manager mới được thêm
      if (currentManagerId !== Number(project.managerId)) {
        setSnackbar({
          open: true,
          message: 'Chỉ quản lý dự án mới được phép thêm tài liệu',
          severity: 'error'
        });
        return;
      }

      const response = await documentService.uploadDocument(uploadForm.file, {
        name: uploadForm.name,
        code: uploadForm.code,
        documentTypeId: uploadForm.documentTypeId,
        projectId: uploadForm.projectId
      });
      
      console.log('Upload response:', response);

      if (response.status === 200) {
        setOpenUploadDialog(false);
        setUploadForm({
          file: null,
          code: '',
          name: '',
          documentTypeId: '',
          projectId: id
        });
        setSnackbar({
          open: true,
          message: 'Tải lên tài liệu thành công',
          severity: 'success'
        });
        // Refresh danh sách tài liệu
        await fetchDocuments();
      }
    } catch (err) {
      setError('Không thể tải lên tài liệu');
      console.error('Error uploading document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = (doc) => {
    // Kiểm tra quyền sửa - chỉ manager mới được sửa
    if (currentManagerId !== Number(project.managerId)) {
      setSnackbar({
        open: true,
        message: 'Chỉ quản lý dự án mới được phép sửa tài liệu',
        severity: 'error'
      });
      return;
    }

    setSelectedDocument(doc);
    setEditForm({
      name: doc.name,
      code: doc.code,
      documentTypeId: doc.documentTypeId,
      description: doc.description || ''
    });
    setOpenEditDialog(true);
  };

  const handleUpdateDocument = async () => {
    try {
      setLoading(true);
      // Chỉ cập nhật các trường được chỉ định và giữ nguyên các trường khác
      const updateData = {
        ...selectedDocument,
        code: editForm.code,
        name: editForm.name,
        description: editForm.description,
        documentTypeId: editForm.documentTypeId
      };
      const response = await documentService.updateDocument(selectedDocument.id, updateData);
      
      if (response.status === 200) {
        // Hiển thị thông báo thành công
        setError(null);
        setSnackbar({
          open: true,
          message: 'Cập nhật tài liệu thành công',
          severity: 'success'
        });
        // Refresh thông tin tài liệu
        const updatedDoc = await documentService.getDocumentById(selectedDocument.id);
        setSelectedDocument(updatedDoc.data);
        fetchDocuments(); // Refresh danh sách
        setOpenEditDialog(false);
      }
    } catch (err) {
      setError('Không thể cập nhật tài liệu');
      console.error('Error updating document:', err);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm để lấy tên người tạo
  const getCreatorName = (createBy) => {
    const creator = departmentUsers.find(user => String(user.id) === String(createBy));
    return creator ? creator.name : createBy;
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
                    Người quản lý
                  </Typography>
                  {isEditing ? (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                      name="managerId"
                        value={editedProject.managerId || ''}
                      onChange={handleProjectChange}
                      >
                        <MenuItem value="">-- Chọn người quản lý --</MenuItem>
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
                        {Object.entries(projectTypes).map(([id, name]) => (
                          <MenuItem key={id} value={Number(id)}>{name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body1">
                      {projectTypes[project.projectTypeId] || project.projectTypeId}
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
                {project.state === 2 && currentManagerId === Number(project.managerId) && (
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => {
                      // Kiểm tra quyền thêm tài liệu trước khi mở dialog
                      if (currentManagerId !== Number(project.managerId)) {
                        setSnackbar({
                          open: true,
                          message: 'Chỉ quản lý dự án mới được phép thêm tài liệu',
                          severity: 'error'
                        });
                        return;
                      }
                      setOpenUploadDialog(true);
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

              <Dialog
                open={openUploadDialog}
                onClose={() => setOpenUploadDialog(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Tải lên tài liệu</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ height: 100 }}
                      >
                        {uploadForm.file ? uploadForm.file.name : 'Chọn tệp để tải lên'}
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange}
                        />
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mã tài liệu"
                        value={uploadForm.code}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, code: e.target.value }))}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tên tài liệu"
                        value={uploadForm.name}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Phân loại</InputLabel>
                        <Select
                          label="Phân loại"
                          value={uploadForm.documentTypeId}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, documentTypeId: e.target.value }))}
                        >
                          {documentTypes.map(type => (
                            <MenuItem key={type.id} value={type.id}>
                              {type.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Dự án"
                        value={project.name}
                        disabled
                        sx={{
                          '& .MuiInputBase-input': {
                            color: 'text.primary'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenUploadDialog(false)}>Hủy</Button>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!uploadForm.file || !uploadForm.name || !uploadForm.documentTypeId || loading}
                  >
                    {loading ? 'Đang tải lên...' : 'Tải lên'}
                  </Button>
                </DialogActions>
              </Dialog>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Mã tài liệu</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tên tài liệu</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Loại tài liệu</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Phiên bản</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Người tạo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                      {project.state === 2 && currentManagerId === Number(project.managerId) && (
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {project.attachments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.code}</TableCell>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>
                          {documentTypes.find(type => type.id === doc.documentTypeId)?.name || 'Không xác định'}
                        </TableCell>
                        <TableCell>{doc.version}</TableCell>
                        <TableCell>{getCreatorName(doc.createBy)}</TableCell>
                        <TableCell>{formatDate(doc.createDate)}</TableCell>
                        {project.state === 2 && currentManagerId === Number(project.managerId) && (
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleDownload(doc.filePath)}
                              >
                                <CloudDownloadIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditDocument(doc)}
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
            <TaskProjectList
              tasks={project.tasks}
              projectState={project.state}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              formatDate={formatDate}
              getPriorityColor={getPriorityColor}
              managers={managers}
              isManager={currentManagerId !== null && currentManagerId === Number(project.managerId)}
            />
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

      {/* Dialog sửa tài liệu */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
          color: '#1976d2',
          fontWeight: 600
        }}>
          Chỉnh sửa tài liệu
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã tài liệu"
                value={editForm.code}
                onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên tài liệu"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phân loại</InputLabel>
                <Select
                  label="Phân loại"
                  value={editForm.documentTypeId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, documentTypeId: e.target.value }))}
                >
                  {documentTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả tài liệu"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setOpenEditDialog(false)}>
            HỦY
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateDocument}
            disabled={!editForm.name || !editForm.code || !editForm.documentTypeId || loading}
          >
            {loading ? 'ĐANG CẬP NHẬT...' : 'LƯU'}
          </Button>
        </DialogActions>
      </Dialog>

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