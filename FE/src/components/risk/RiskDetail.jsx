import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import vi from 'date-fns/locale/vi';
import riskService from '../../services/riskService';
import RiskHistory from './RiskHistory';
import RiskActionList from './RiskActionList';
import staffService from '../../services/staffService';
import categoryService from '../../services/categoryService';
import departmentService from '../../services/departmentService';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';

const getRiskLevelColor = (level) => {
  switch (level) {
    case 'Rất cao':
      return '#d32f2f'; // Màu đỏ đậm
    case 'Cao':
      return '#f44336'; // Màu đỏ
    case 'Trung bình':
      return '#ff9800'; // Màu cam
    case 'Thấp':
      return '#4caf50'; // Màu xanh lá
    case 'Chưa xác định':
      return '#757575'; // Màu xám
    default:
      return '#757575'; // Màu xám mặc định
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Đang xử lý':
      return '#2196f3'; // Màu xanh dương
    case 'Đã đóng':
      return '#4caf50'; // Màu xanh lá
    case 'Đã hủy':
      return '#f44336'; // Màu đỏ
    default:
      return '#757575'; // Màu xám
  }
};


const RiskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [risk, setRisk] = useState({
    code: '',
    name: '',
    description: '',
    status: 1,
    riskTypeId: null,
    projectId: null,
    approverId: null,
    departmentId: null,
    impactLevelId: null,
    scopeId: null,
    possibilityId: null,
    priorityId: null,
    reflectorId: null,
    rootCause: '',
    impactAnalysis: '',
    remedy: '',
    precautions: '',
    reflectionDay: null,
    preventiveActions: [],
    analysis: {
      rootCause: '',
      impact: '',
      preventiveMeasures: '',
      remedialMeasures: ''
    }
  });
  const [riskHistory, setRiskHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRisk, setEditedRisk] = useState(null);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newAction, setNewAction] = useState({
    name: '',
    assignee: '',
    startDate: '',
    endDate: '',
    priority: 'MEDIUM',
    status: 'NEW'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [managers, setManagers] = useState([]);
  const [riskTypes, setRiskTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [impactLevels, setImpactLevels] = useState([]);
  const [department, setDepartment] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách loại rủi ro
        const riskTypesResponse = await categoryService.getCategoriesByType('riskTypeId');
        if (riskTypesResponse && riskTypesResponse.data) {
          setRiskTypes(riskTypesResponse.data);
        }

        // Lấy danh sách mức độ ảnh hưởng
        const impactLevelsResponse = await categoryService.getCategoriesByType('impactLevelId');
        if (impactLevelsResponse && impactLevelsResponse.data) {
          setImpactLevels(impactLevelsResponse.data);
        }

        // Lấy danh sách người dùng
        const usersResponse = await staffService.getListUser();
        if (usersResponse && usersResponse.data) {
          setUsers(usersResponse.data);
        }

        // Lấy thông tin chi tiết rủi ro
        const riskData = await riskService.getRiskById(id);
        if (riskData) {
          // Chuyển đổi dữ liệu phẳng thành cấu trúc có analysis
          const formattedRisk = {
            ...riskData,
            preventiveActions: [],
            analysis: {
              rootCause: riskData.rootCause || '',
              impact: riskData.impactAnalysis || '',
              preventiveMeasures: riskData.precautions || '',
              remedialMeasures: riskData.remedy || ''
            }
          };
          setRisk(formattedRisk);

          // Lấy thông tin dự án nếu có projectId
          if (riskData.projectId) {
            try {
              const projectResponse = await projectService.getProjectById(riskData.projectId);
              if (projectResponse && projectResponse.data) {
                setProject(projectResponse.data);
              }
            } catch (err) {
              console.error('Error fetching project:', err);
            }
          }
        }

        // Lấy lịch sử rủi ro
        const historyData = await riskService.getRiskHistory(id);
        if (historyData) {
          setRiskHistory(historyData);
        }

        // Lấy danh sách công việc liên quan
        const tasksData = await taskService.getTasksByRiskId(id);
        if (tasksData && tasksData.data) {
          setRisk(prev => ({
            ...prev,
            preventiveActions: tasksData.data || []
          }));
        }

        // Lấy thông tin đơn vị ghi nhận
        if (riskData?.departmentId) {
          try {
            const departmentResponse = await departmentService.getDepartmentById(riskData.departmentId);
            if (departmentResponse && departmentResponse.data) {
              setDepartment(departmentResponse.data);
            }
          } catch (err) {
            console.error('Error fetching department:', err);
          }
        }

        // Lấy danh sách người thực hiện theo phòng ban
        if (riskData?.departmentId) {
          try {
            const userResponse = await staffService.listUserByDep(riskData.departmentId);
            if (userResponse && userResponse.data) {
              setManagers(userResponse.data);
            }
          } catch (err) {
            console.error('Error fetching managers:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin rủi ro. Vui lòng thử lại sau.',
          severity: 'error'
        });
      }
    };

    fetchData();
  }, [id]);

  // Các hàm helper để chuyển đổi ID thành tên
  const getRiskTypeName = (typeId) => {
    const riskType = riskTypes.find(type => type.id === typeId);
    return riskType ? riskType.name : 'Chưa xác định';
  };

  const getImpactLevelName = (levelId) => {
    const impactLevel = impactLevels.find(level => level.id === levelId);
    return impactLevel ? impactLevel.name : 'Chưa xác định';
  };

  const getRiskStateName = (stateId) => {
    switch (stateId) {
      case 2: return 'Đang xử lý';
      case 3: return 'Đã đóng';
      case 5: return 'Đã hủy';
      default: return 'Chưa xác định';
    }
  };

  const getPossibilityName = (possibilityId) => {
    switch (possibilityId) {
      case 1: return 'Thấp';
      case 2: return 'Trung bình';
      case 3: return 'Cao';
      default: return 'Chưa xác định';
    }
  };

  const getPriorityName = (priorityId) => {
    switch (priorityId) {
      case 1: return 'Thấp';
      case 2: return 'Trung bình';
      case 3: return 'Cao';
      default: return 'Chưa xác định';
    }
  };

  const getDepartmentName = (departmentId) => {
    if (!department) return 'Chưa xác định';
    return department.name || 'Chưa xác định';
  };

  const getProjectName = (projectId) => {
    if (!project) return 'Chưa xác định';
    return project.name || 'Chưa xác định';
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const handleClose = () => {
    navigate('/risk/list');
  };

  const handleEdit = () => {
    console.log('Current risk state:', risk.state);
    if (risk.state !== 2) {
      setSnackbar({
        open: true,
        message: 'Chỉ có thể chỉnh sửa rủi ro khi đang ở trạng thái "Đang thực hiện"',
        severity: 'error'
      });
      return;
    }
    setIsEditing(true);
    setEditedRisk({ ...risk });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRisk(null);
  };

  const handleSave = async () => {
    try {
      const updatedRisk = {
        id: risk.id,
        code: editedRisk.code,
        name: editedRisk.name,
        description: editedRisk.description,
        status: editedRisk.status,
        state: editedRisk.state,
        riskTypeId: editedRisk.riskTypeId,
        projectId: editedRisk.projectId,
        departmentId: editedRisk.departmentId,
        impactLevelId: editedRisk.impactLevelId,
        scopeId: editedRisk.scopeId,
        possibilityId: editedRisk.possibilityId,
        priorityId: editedRisk.priorityId,
        reflectorId: editedRisk.reflectorId,
        reflectionDay: editedRisk.reflectionDay,
        rootCause: editedRisk?.analysis?.rootCause || '',
        impactAnalysis: editedRisk?.analysis?.impact || '',
        remedy: editedRisk?.analysis?.remedialMeasures || '',
        precautions: editedRisk?.analysis?.preventiveMeasures || ''
      };
      
      await riskService.updateRisk(risk.id, updatedRisk);
      setRisk(updatedRisk);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Cập nhật rủi ro thành công',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật rủi ro: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  const handleRiskChange = (event) => {
    const { name, value } = event.target;
    setEditedRisk(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnalysisChange = (event) => {
    const { name, value } = event.target;
    setEditedRisk(prev => ({
      ...prev,
      analysis: {
        ...prev.analysis,
        [name]: value
      }
    }));
  };

  const handleCloseActionDialog = () => {
    setOpenActionDialog(false);
    setNewAction({
      name: '',
      assignee: '',
      startDate: '',
      endDate: '',
      priority: 'MEDIUM',
      status: 'NEW'
    });
    setSelectedAction(null);
  };

  const handleSaveAction = async () => {
    try {
      const taskData = {
        code: newAction.code,
        name: newAction.name,
        description: newAction.description,
        departmentId: risk.departmentId,
        projectId: risk.projectId,
        assigneeId: newAction.assigneeId,
        priorityId: newAction.priorityId,
        startDate: newAction.startDate,
        dueDate: newAction.endDate,
        riskId: risk.id,
        taskTypeId: 1
      };

      // Kiểm tra quyền tạo hành động phòng ngừa
      const currentUserId = localStorage.getItem('userId');
      if (currentUserId !== risk.reflectorId) {
        setSnackbar({
          open: true,
          message: 'Chỉ có người phản ánh mới được phép thêm hành động phòng ngừa',
          severity: 'error'
        });
        return;
      }

      if (selectedAction) {
        // TODO: Implement update task
        setSnackbar({
          open: true,
          message: 'Chức năng cập nhật hành động chưa được hỗ trợ',
          severity: 'error'
        });
        return;
      }

      const response = await taskService.createTask(taskData);
      if (response && response.data) {
        // Refresh danh sách hành động sau khi thêm mới
        const tasksResponse = await taskService.getTasksByRiskId(risk.id);
        if (tasksResponse && tasksResponse.data) {
    setRisk({
      ...risk,
            preventiveActions: tasksResponse.data
          });
        }
        setSnackbar({
          open: true,
          message: 'Thêm hành động mới thành công',
          severity: 'success'
    });
    handleCloseActionDialog();
      }
    } catch (error) {
      console.error('Error saving action:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi thêm hành động mới: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  const handleAddAction = () => {
    setSelectedAction(null);
    setNewAction({
      name: '',
      assigneeId: '',
      startDate: '',
      endDate: '',
      priorityId: 2
    });
    setOpenActionDialog(true);
  };

  const handleEditAction = (action) => {
    setSelectedAction(action);
    setNewAction({
      name: action.name,
      assigneeId: action.assigneeId,
      startDate: action.startDate,
      endDate: action.endDate,
      priorityId: action.priorityId,
      state: action.state
    });
    setOpenActionDialog(true);
  };

  const handleDeleteAction = async (actionId) => {
    try {
      await taskService.changeStatus(actionId);
      
      // Cập nhật lại danh sách hành động
    const updatedActions = risk.preventiveActions.filter(action => action.id !== actionId);
    setRisk({
      ...risk,
      preventiveActions: updatedActions
    });

      setSnackbar({
        open: true,
        message: 'Xóa hành động thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting action:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Không thể xóa hành động',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getReflectorName = (reflectorId) => {
    if (!reflectorId) return 'Chưa có';
    const user = users.find(user => String(user.id) === String(reflectorId));
    return user ? user.name : 'Chưa có';
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={2} 
          sx={{ 
            mb: 3,
            pb: 2,
            borderBottom: '2px solid #1976d2'
          }}
        >
          <IconButton 
            onClick={handleClose} 
            sx={{ 
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#1976d2'
            }}
          >
            Chi tiết rủi ro
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {isEditing ? (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                sx={{
                  borderColor: '#929292',
                  color: '#929292',
                  '&:hover': {
                    borderColor: '#6f6f6f',
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
            </Stack>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={risk?.state !== 2}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0'
                },
                '&.Mui-disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e'
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
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      color: '#1976d2', 
                      fontWeight: 600,
                      fontSize: '1.25rem'
                    }}
                  >
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="name"
                        value={editedRisk.name}
                        onChange={handleRiskChange}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#1976d2'
                            }
                          }
                        }}
                      />
                    ) : (
                      risk.name
                    )}
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    sx={{ 
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 1
                    }}
                  >
                    {isEditing ? (
                      <>
                        <TextField
                          name="code"
                          value={editedRisk.code}
                          onChange={handleRiskChange}
                          size="small"
                          sx={{
                            width: '150px',
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#1976d2'
                              }
                            }
                          }}
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            name="riskTypeId"
                            value={editedRisk.riskTypeId || ''}
                            onChange={handleRiskChange}
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#1976d2'
                              }
                            }}
                          >
                            {riskTypes.map(type => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                      </>
                    ) : (
                      <>
                      <Chip
                          icon={<WarningIcon />}
                          label={risk.code}
                        variant="outlined"
                          sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '& .MuiChip-icon': {
                              color: '#1976d2'
                            }
                          }}
                        />
                        <Chip
                          label={getRiskTypeName(risk.riskTypeId)}
                          sx={{
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 500
                          }}
                        />
                      </>
                    )}
                  </Stack>
                </Box>

                <Divider sx={{ borderColor: '#e0e0e0' }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary" 
                          gutterBottom
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#666'
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 18 }} />
                          Đơn vị ghi nhận
                        </Typography>
                        <Typography sx={{ color: '#333', fontWeight: 500 }}>
                          {getDepartmentName(risk.departmentId)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary" 
                          gutterBottom
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#666'
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 18 }} />
                          Dự án
                        </Typography>
                        <Typography sx={{ color: '#333', fontWeight: 500 }}>
                          {getProjectName(risk.projectId)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary" 
                          gutterBottom
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#666'
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                          Người phản ánh
                        </Typography>
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          alignItems="center"
                        >
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32,
                              backgroundColor: '#1976d2',
                              fontSize: '0.875rem'
                            }}
                          >
                            {getReflectorName(risk.reflectorId).charAt(0)}
                            </Avatar>
                          <Typography sx={{ color: '#333', fontWeight: 500 }}>
                            {getReflectorName(risk.reflectorId)}
                          </Typography>
                          </Stack>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary" 
                          gutterBottom
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#666'
                          }}
                        >
                          <ScheduleIcon sx={{ fontSize: 18 }} />
                          Ngày phản ánh
                        </Typography>
                        <Typography sx={{ color: '#333', fontWeight: 500 }}>
                          {formatDate(risk.reflectionDay)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary" 
                          gutterBottom
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#666'
                          }}
                        >
                          Trạng thái
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              name="state"
                              value={editedRisk.state}
                              onChange={handleRiskChange}
                              sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#e0e0e0'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }}
                            >
                              <MenuItem value={2}>Đang xử lý</MenuItem>
                              <MenuItem value={3}>Đã đóng</MenuItem>
                              <MenuItem value={5}>Đã hủy</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={getRiskStateName(risk.state)}
                            sx={{
                              backgroundColor: getStatusColor(getRiskStateName(risk.state)),
                              color: '#fff',
                              fontWeight: 500,
                              fontSize: '0.875rem',
                              height: 28
                            }}
                            size="small"
                          />
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ borderColor: '#e0e0e0' }} />

                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Mô tả chi tiết
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="description"
                      value={editedRisk.description}
                      onChange={handleRiskChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-line',
                        color: '#333',
                        lineHeight: 1.6
                      }}
                    >
                      {risk.description}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Đánh giá mức độ
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={2}
                    sx={{
                      flexWrap: 'wrap',
                      gap: 1
                    }}
                  >
                    {isEditing ? (
                      <>
                        <FormControl fullWidth size="small">
                          <InputLabel>Mức độ ảnh hưởng</InputLabel>
                          <Select
                            name="impactLevelId"
                            value={editedRisk.impactLevelId || ''}
                            onChange={handleRiskChange}
                            label="Mức độ ảnh hưởng"
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#1976d2'
                              }
                            }}
                          >
                            {impactLevels.map((level) => (
                              <MenuItem key={level.id} value={level.id}>
                                {level.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                          <InputLabel>Khả năng xảy ra</InputLabel>
                          <Select
                            name="possibilityId"
                            value={editedRisk.possibilityId}
                            onChange={handleRiskChange}
                            label="Khả năng xảy ra"
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#1976d2'
                              }
                            }}
                          >
                            <MenuItem value={1}>Thấp</MenuItem>
                            <MenuItem value={2}>Trung bình</MenuItem>
                            <MenuItem value={3}>Cao</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                          <InputLabel>Mức độ ưu tiên</InputLabel>
                          <Select
                            name="priorityId"
                            value={editedRisk.priorityId}
                            onChange={handleRiskChange}
                            label="Mức độ ưu tiên"
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#1976d2'
                              }
                            }}
                          >
                            <MenuItem value={1}>Thấp</MenuItem>
                            <MenuItem value={2}>Trung bình</MenuItem>
                            <MenuItem value={3}>Cao</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    ) : (
                      <>
                        <Chip 
                          label={`Mức độ ảnh hưởng: ${getImpactLevelName(risk.impactLevelId)}`} 
                          sx={{
                            backgroundColor: getRiskLevelColor(getImpactLevelName(risk.impactLevelId)),
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            height: 28,
                            '& .MuiChip-label': {
                              px: 2
                            }
                          }}
                        />
                        <Chip 
                          label={`Khả năng xảy ra: ${getPossibilityName(risk.possibilityId)}`} 
                          sx={{
                            backgroundColor: getRiskLevelColor(getPossibilityName(risk.possibilityId)),
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            height: 28,
                            '& .MuiChip-label': {
                              px: 2
                            }
                          }}
                        />
                        <Chip 
                          label={`Mức độ ưu tiên: ${getPriorityName(risk.priorityId)}`} 
                          sx={{
                            backgroundColor: getRiskLevelColor(getPriorityName(risk.priorityId)),
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            height: 28,
                            '& .MuiChip-label': {
                              px: 2
                            }
                          }}
                        />
                      </>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Phân tích đánh giá */}
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                mt: 3,
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: '#1976d2', 
                  fontWeight: 600,
                  fontSize: '1.25rem'
                }}
              >
                Phân tích đánh giá
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Nguyên nhân gốc rễ
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="rootCause"
                      value={editedRisk?.analysis?.rootCause || ''}
                      onChange={handleAnalysisChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: '#333', lineHeight: 1.6 }}>
                      {risk?.analysis?.rootCause || 'Chưa có thông tin'}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Phân tích ảnh hưởng
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="impact"
                      value={editedRisk?.analysis?.impact || ''}
                      onChange={handleAnalysisChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: '#333', lineHeight: 1.6 }}>
                      {risk?.analysis?.impact || 'Chưa có thông tin'}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Biện pháp phòng ngừa
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="preventiveMeasures"
                      value={editedRisk?.analysis?.preventiveMeasures || ''}
                      onChange={handleAnalysisChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: '#333', lineHeight: 1.6 }}>
                      {risk?.analysis?.preventiveMeasures || 'Chưa có thông tin'}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Biện pháp khắc phục
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="remedialMeasures"
                      value={editedRisk?.analysis?.remedialMeasures || ''}
                      onChange={handleAnalysisChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: '#333', lineHeight: 1.6 }}>
                      {risk?.analysis?.remedialMeasures || 'Chưa có thông tin'}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Lịch sử xử lý */}
              <RiskHistory history={riskHistory} />

              {/* Hành động phòng ngừa */}
              <RiskActionList
                actions={risk?.preventiveActions || []}
                riskState={risk?.state}
                onAddAction={handleAddAction}
                onDeleteAction={handleDeleteAction}
                formatDate={formatDate}
                managers={managers || []}
                          />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog thêm/sửa hành động */}
      <Dialog
        open={openActionDialog}
        onClose={handleCloseActionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
          color: '#1976d2',
          fontWeight: 600
        }}>
          {selectedAction ? 'Chỉnh sửa hành động' : 'Thêm hành động mới'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Mã hành động"
                name="code"
                value={newAction.code || ''}
                onChange={(e) => setNewAction({ ...newAction, code: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Tên hành động"
                name="name"
                value={newAction.name || ''}
                onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Phòng ban</InputLabel>
                <Select
                  name="departmentId"
                  value={risk.departmentId}
                  label="Phòng ban"
                  disabled
                  sx={{
                    '& .MuiSelect-select': {
                      color: 'text.primary'
                    }
                  }}
                >
                  <MenuItem value={risk.departmentId}>
                    {getDepartmentName(risk.departmentId)}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Người thực hiện</InputLabel>
                <Select
                  name="assigneeId"
                  value={newAction.assigneeId || ''}
                  label="Người thực hiện"
                  onChange={(e) => setNewAction({ ...newAction, assigneeId: e.target.value })}
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
                  value={newAction.priorityId || 2}
                  label="Mức độ ưu tiên"
                  onChange={(e) => setNewAction({ ...newAction, priorityId: e.target.value })}
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
                value={newAction.startDate || ''}
                onChange={(e) => setNewAction({ ...newAction, startDate: e.target.value })}
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
                name="endDate"
                value={newAction.endDate || ''}
                onChange={(e) => setNewAction({ ...newAction, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="Mô tả chi tiết hành động"
                name="description"
                value={newAction.description || ''}
                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
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
          <Button onClick={handleCloseActionDialog}>
            HỦY
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAction}
            disabled={!newAction.name || !newAction.assigneeId || !newAction.startDate || !newAction.endDate}
          >
            {selectedAction ? 'LƯU' : 'THÊM'}
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

export default RiskDetail; 