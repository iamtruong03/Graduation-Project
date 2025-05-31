import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { Typography, Paper, Alert } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import vi from 'date-fns/locale/vi';

const getStatusColor = (status) => {
  if (!status) return 'grey';
  
  switch (status) {
    case 'Chờ duyệt':
    case 'pending':
    case 0:
      return 'warning';
    case 'Từ chối':
    case 'rejected':
    case 1:
      return 'error';
    case 'Đang thực hiện':
    case 'in_progress':
    case 2:
      return 'info';
    case 'Hoàn thành':
    case 'completed':
    case 3:
      return 'success';
    case 'Quá hạn':
    case 'overdue':
    case 4:
      return 'error';
    case 'Đã hủy':
    case 'cancelled':
    case 5:
      return 'error';
    default:
      return 'grey';
  }
};

const getStatusName = (status) => {
  switch (status) {
    case 0:
    case 'pending':
      return 'Chờ duyệt';
    case 1:
    case 'rejected':
      return 'Từ chối';
    case 2:
    case 'in_progress':
      return 'Đang thực hiện';
    case 3:
    case 'completed':
      return 'Hoàn thành';
    case 4:
    case 'overdue':
      return 'Quá hạn';
    case 5:
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status || 'Không xác định';
  }
};

const getChangedByName = (changedBy, changedByName) => {
  if (changedByName) return changedByName;
  if (changedBy === 'system') return 'Hệ thống';
  return `Người dùng ${changedBy}`;
};

const formatDate = (dateString) => {
  try {
    if (!dateString) return '';
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const TaskHistory = ({ history = [], error = null }) => {
  if (error) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Paper>
    );
  }

  if (!Array.isArray(history)) {
    console.error('History prop is not an array:', history);
    return null;
  }

  if (history.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Lịch sử trạng thái
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Chưa có lịch sử thay đổi
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        <HistoryIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
        Lịch sử trạng thái
      </Typography>
      <Timeline>
        {history.map((item, index) => {
          if (!item) {
            console.error('Invalid history item at index', index);
            return null;
          }
          return (
            <TimelineItem key={item.id || index}>
              <TimelineOppositeContent color="text.secondary">
                <Typography variant="caption">
                  {formatDate(item.changedAt)}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot 
                  variant="outlined" 
                  color={getStatusColor(item.newState)} 
                />
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" component="span">
                  {item.stateName}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  bởi {item.changedByName}
                </Typography>
                {item.comment && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {item.comment}
                  </Typography>
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Paper>
  );
};

export default TaskHistory; 