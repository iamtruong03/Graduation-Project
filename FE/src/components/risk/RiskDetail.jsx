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
  TableRow
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
import { message } from 'antd';

const getRiskLevelColor = (level) => {
  switch (level) {
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

const getStatusColor = (status) => {
  switch (status) {
    case 'Chờ duyệt':
      return '#4caf50';
    case 'Đang thực hiện':
      return '#2196f3';
    case 'COMPLETED':
      return '#9c27b0';
    case 'CANCELLED':
      return '#f44336';
    default:
      return '#000000';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Cao':
      return '#f44336';
    case 'Trung bình':
      return '#ff9800';
    case 'Thấp':
      return '#4caf50';
    default:
      return '#000000';
  }
};

const RiskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [risk, setRisk] = useState({
    id: null,
    code: '',
    name: '',
    type: '',
    level: '',
    stage: '',
    updatedAt: '',
    reporter: '',
    department: '',
    project: '',
    description: '',
    impactLevel: '',
    probability: '',
    priority: '',
    active: true,
    analysis: {
      rootCause: '',
      impact: '',
      preventiveMeasures: '',
      remedialMeasures: ''
    },
    preventiveActions: []
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [riskData, historyData] = await Promise.all([
          riskService.getRiskById(id),
          riskService.getRiskHistory(id)
        ]);

        if (riskData) {
          // Map dữ liệu từ API sang cấu trúc hiển thị
          const formattedRisk = {
            id: riskData.id,
            code: riskData.code || '',
            name: riskData.name || '',
            type: riskData.riskTypeId ? getRiskTypeName(riskData.riskTypeId) : '',
            level: riskData.impactLevelId ? getImpactLevelName(riskData.impactLevelId) : '',
            stage: riskData.state ? getRiskStateName(riskData.state) : '',
            updatedAt: riskData.updatedAt || '',
            reporter: riskData.reflectorId || '',
            department: riskData.departmentId ? getDepartmentName(riskData.departmentId) : '',
            project: riskData.projectId ? getProjectName(riskData.projectId) : '',
            description: riskData.description || '',
            impactLevel: riskData.impactLevelId ? getImpactLevelName(riskData.impactLevelId) : '',
            probability: riskData.possibilityId ? getPossibilityName(riskData.possibilityId) : '',
            priority: riskData.priorityId ? getPriorityName(riskData.priorityId) : '',
            active: riskData.status === 1,
            analysis: {
              rootCause: riskData.rootCause || '',
              impact: riskData.impactAnalysis || '',
              preventiveMeasures: riskData.precautions || '',
              remedialMeasures: riskData.remedy || ''
            },
            preventiveActions: riskData.preventiveActions || []
          };
          setRisk(formattedRisk);
        }
        setRiskHistory(historyData || []);
      } catch (error) {
        console.error('Error fetching risk data:', error);
        // Hiển thị thông báo lỗi cho người dùng
        message.error('Không thể tải thông tin rủi ro. Vui lòng thử lại sau.');
      }
    };

    fetchData();
  }, [id]);

  // Các hàm helper để chuyển đổi ID thành tên
  const getRiskTypeName = (typeId) => {
    // TODO: Implement mapping từ riskTypeId sang tên loại rủi ro
    return 'Vận hành';
  };

  const getImpactLevelName = (levelId) => {
    switch (levelId) {
      case 1: return 'Thấp';
      case 2: return 'Trung bình';
      case 3: return 'Cao';
      case 4: return 'Rất cao';
      default: return 'Chưa xác định';
    }
  };

  const getRiskStateName = (stateId) => {
    switch (stateId) {
      case 1: return 'Chưa xử lý';
      case 2: return 'Đang xử lý';
      case 3: return 'Đã xử lý';
      case 4: return 'Đã đóng';
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
    // TODO: Implement mapping từ departmentId sang tên phòng ban
    return 'Phòng ban';
  };

  const getProjectName = (projectId) => {
    // TODO: Implement mapping từ projectId sang tên dự án
    return 'Dự án';
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
    setIsEditing(true);
    setEditedRisk({...risk});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRisk(null);
  };

  const handleSave = () => {
    setRisk(editedRisk);
    setIsEditing(false);
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

  const handleSaveAction = () => {
    let updatedActions;
    if (selectedAction) {
      updatedActions = risk.preventiveActions.map(action =>
        action.id === selectedAction.id
          ? { ...newAction, id: action.id }
          : action
      );
    } else {
      const newActionWithId = {
        ...newAction,
        id: risk.preventiveActions.length + 1
      };
      updatedActions = [...risk.preventiveActions, newActionWithId];
    }

    setRisk({
      ...risk,
      preventiveActions: updatedActions
    });
    handleCloseActionDialog();
  };

  const handleEditAction = (action) => {
    setSelectedAction(action);
    setNewAction({
      name: action.name,
      assignee: action.assignee,
      startDate: action.startDate,
      endDate: action.endDate,
      priority: action.priority,
      status: action.status
    });
    setOpenActionDialog(true);
  };

  const handleDeleteAction = (actionId) => {
    const updatedActions = risk.preventiveActions.filter(action => action.id !== actionId);
    setRisk({
      ...risk,
      preventiveActions: updatedActions
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Chi tiết rủi ro</Typography>
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
                    {risk.name}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Chip
                      icon={<WarningIcon />}
                      label={risk.code}
                      variant="outlined"
                    />
                    {isEditing ? (
                      <FormControl sx={{ minWidth: 150 }}>
                        <Select
                          name="type"
                          value={editedRisk.type}
                          onChange={handleRiskChange}
                          size="small"
                        >
                          <MenuItem value="Vận hành">Vận hành</MenuItem>
                          <MenuItem value="Kỹ thuật">Kỹ thuật</MenuItem>
                          <MenuItem value="Quản lý">Quản lý</MenuItem>
                          <MenuItem value="Tài chính">Tài chính</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={risk.type}
                        color="primary"
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
                          <BusinessIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Phòng ban
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            name="department"
                            value={editedRisk.department}
                            onChange={handleRiskChange}
                            size="small"
                          />
                        ) : (
                          <Typography>{risk.department}</Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <BusinessIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Dự án
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              name="project"
                              value={editedRisk.project}
                              onChange={handleRiskChange}
                            >
                              <MenuItem value="Dự án A">Dự án A</MenuItem>
                              <MenuItem value="Dự án B">Dự án B</MenuItem>
                              <MenuItem value="Dự án C">Dự án C</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{risk.project}</Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Người phản ánh
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            name="reporter"
                            value={editedRisk.reporter}
                            onChange={handleRiskChange}
                            size="small"
                          />
                        ) : (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {risk.reporter ? risk.reporter.charAt(0) : '?'}
                            </Avatar>
                            <Typography>{risk.reporter || 'Chưa có người phản ánh'}</Typography>
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <ScheduleIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                          Ngày cập nhật
                        </Typography>
                        <Typography>{formatDate(risk.updatedAt)}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Trạng thái
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              name="stage"
                              value={editedRisk.stage}
                              onChange={handleRiskChange}
                            >
                              <MenuItem value="Chưa xử lý">Chưa xử lý</MenuItem>
                              <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
                              <MenuItem value="Đã xử lý">Đã xử lý</MenuItem>
                              <MenuItem value="Đã đóng">Đã đóng</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={risk.stage}
                            color={getRiskLevelColor(risk.level)}
                            size="small"
                          />
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                    />
                  ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {risk.description}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Đánh giá mức độ
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {isEditing ? (
                      <>
                        <FormControl fullWidth size="small">
                          <InputLabel>Mức độ ảnh hưởng</InputLabel>
                          <Select
                            name="impactLevel"
                            value={editedRisk.impactLevel}
                            onChange={handleRiskChange}
                            label="Mức độ ảnh hưởng"
                          >
                            <MenuItem value="Cao">Cao</MenuItem>
                            <MenuItem value="Trung bình">Trung bình</MenuItem>
                            <MenuItem value="Thấp">Thấp</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                          <InputLabel>Khả năng xảy ra</InputLabel>
                          <Select
                            name="probability"
                            value={editedRisk.probability}
                            onChange={handleRiskChange}
                            label="Khả năng xảy ra"
                          >
                            <MenuItem value="Cao">Cao</MenuItem>
                            <MenuItem value="Trung bình">Trung bình</MenuItem>
                            <MenuItem value="Thấp">Thấp</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                          <InputLabel>Mức độ ưu tiên</InputLabel>
                          <Select
                            name="priority"
                            value={editedRisk.priority}
                            onChange={handleRiskChange}
                            label="Mức độ ưu tiên"
                          >
                            <MenuItem value="Cao">Cao</MenuItem>
                            <MenuItem value="Trung bình">Trung bình</MenuItem>
                            <MenuItem value="Thấp">Thấp</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    ) : (
                      <>
                        <Chip label={`Mức độ ảnh hưởng: ${risk.impactLevel}`} color={getRiskLevelColor(risk.impactLevel)} />
                        <Chip label={`Khả năng xảy ra: ${risk.probability}`} color={getRiskLevelColor(risk.probability)} />
                        <Chip label={`Mức độ ưu tiên: ${risk.priority}`} color={getRiskLevelColor(risk.priority)} />
                      </>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Phân tích đánh giá */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                Phân tích đánh giá
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                    />
                  ) : (
                    <Typography>{risk?.analysis?.rootCause || 'Chưa có thông tin'}</Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                    />
                  ) : (
                    <Typography>{risk?.analysis?.impact || 'Chưa có thông tin'}</Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                    />
                  ) : (
                    <Typography>{risk?.analysis?.preventiveMeasures || 'Chưa có thông tin'}</Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                    />
                  ) : (
                    <Typography>{risk?.analysis?.remedialMeasures || 'Chưa có thông tin'}</Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Hành động phòng ngừa */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Hành động phòng ngừa
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedAction(null);
                      setOpenActionDialog(true);
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
                </Box>

                <Stack spacing={2}>
                  {risk.preventiveActions.map((action) => (
                    <Paper
                      key={action.id}
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
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2196f3' }}>
                          {action.name}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditAction(action)}
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
                            onClick={() => handleDeleteAction(action.id)}
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
                      </Box>

                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                            Thực hiện:
                          </Typography>
                          <Typography variant="body2">
                            {action.assignee}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                            Thời gian:
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(action.startDate)} - {formatDate(action.endDate)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                            Trạng thái:
                          </Typography>
                          <Chip
                            label={action.status}
                            size="small"
                            sx={{
                              height: '24px',
                              fontSize: '0.75rem',
                              bgcolor: getStatusColor(action.status),
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
                            label={action.priority}
                            size="small"
                            sx={{
                              height: '24px',
                              fontSize: '0.75rem',
                              bgcolor: getPriorityColor(action.priority),
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

              {/* Lịch sử xử lý */}
              <RiskHistory history={riskHistory} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog thêm/sửa hành động */}
      <Dialog 
        open={openActionDialog} 
        onClose={handleCloseActionDialog}
        maxWidth="sm"
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên hành động"
                value={newAction.name}
                onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Người thực hiện"
                value={newAction.assignee}
                onChange={(e) => setNewAction({ ...newAction, assignee: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày bắt đầu"
                value={newAction.startDate}
                onChange={(e) => setNewAction({ ...newAction, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày kết thúc"
                value={newAction.endDate}
                onChange={(e) => setNewAction({ ...newAction, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Độ ưu tiên</InputLabel>
                <Select
                  value={newAction.priority}
                  label="Độ ưu tiên"
                  onChange={(e) => setNewAction({ ...newAction, priority: e.target.value })}
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
                  value={newAction.status}
                  label="Trạng thái"
                  onChange={(e) => setNewAction({ ...newAction, status: e.target.value })}
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
          <Button onClick={handleCloseActionDialog}>
            HỦY
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAction}
            disabled={!newAction.name || !newAction.assignee || !newAction.startDate || !newAction.endDate}
          >
            {selectedAction ? 'LƯU' : 'THÊM'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskDetail; 