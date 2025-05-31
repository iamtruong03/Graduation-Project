import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

const getPriorityColor = (priorityId) => {
  switch (priorityId) {
    case 3:
      return '#d32f2f'; // Red
    case 2:
      return '#ed6c02'; // Orange
    case 1:
      return '#2e7d32'; // Green
    default:
      return '#757575'; // Grey
  }
};

const getStatusName = (state) => {
  switch (state) {
    case 0:
      return 'Chờ duyệt';
    case 1:
      return 'Từ chối';
    case 2:
      return 'Đang thực hiện';
    case 3:
      return 'Hoàn thành';
    case 4:
      return 'Quá hạn';
    case 5:
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

const getStatusColor = (state) => {
  switch (state) {
    case 0:
      return '#ed6c02'; // Orange - Chờ duyệt
    case 1:
      return '#d32f2f'; // Red - Từ chối
    case 2:
      return '#1976d2'; // Blue - Đang thực hiện
    case 3:
      return '#2e7d32'; // Green - Hoàn thành
    case 4:
      return '#d32f2f'; // Red - Quá hạn
    case 5:
      return '#757575'; // Grey - Đã hủy
    default:
      return '#757575'; // Grey - Không xác định
  }
};

const RiskActionList = ({ 
  actions, 
  riskState, 
  onAddAction, 
  onDeleteAction,
  formatDate,
  managers
}) => {
  const navigate = useNavigate();

  const getAssigneeName = (assigneeId) => {
    if (!managers || !Array.isArray(managers)) {
      return assigneeId;
    }
    const assignee = managers.find(manager => String(manager.id) === String(assigneeId));
    return assignee ? assignee.name : assigneeId;
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Hành động phòng ngừa
        </Typography>
        {riskState === 2 && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddAction}
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
        {actions.map((action) => (
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
                onClick={() => navigate(`/task/detail/${action.id}`)}
              >
                {action.name}
              </Typography>
              {riskState === 2 && (
                <Stack direction="row" spacing={1}>
                
                  <IconButton
                    size="small"
                    onClick={() => onDeleteAction(action.id)}
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
                  Người thực hiện:
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
                    {getAssigneeName(action.assigneeId).charAt(0)}
                  </Avatar>
                  <Typography variant="body2">
                    {getAssigneeName(action.assigneeId)}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                  Thời gian:
                </Typography>
                <Typography variant="body2">
                  {formatDate(action.startDate)} - {formatDate(action.dueDate)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                  Độ ưu tiên:
                </Typography>
                <Chip
                  label={getPriorityName(action.priorityId)}
                  size="small"
                  sx={{
                    height: '24px',
                    fontSize: '0.75rem',
                    bgcolor: getPriorityColor(action.priorityId),
                    color: 'white',
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 85 }}>
                  Trạng thái:
                </Typography>
                <Chip
                  label={getStatusName(action.state)}
                  size="small"
                  sx={{
                    height: '24px',
                    fontSize: '0.75rem',
                    bgcolor: getStatusColor(action.state),
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
  );
};

export default RiskActionList; 