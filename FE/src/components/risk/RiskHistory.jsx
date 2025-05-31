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
import { Typography, Paper } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import vi from 'date-fns/locale/vi';

const getStatusColor = (stage) => {
  switch (stage) {
    case 'Đang xử lý':
    case 2:
      return 'info';
    case 'Đã đóng':
    case 3:
      return 'success';
    case 'Đã hủy':
    case 5:
      return 'error';
    default:
      return 'grey';
  }
};

const getStatusName = (stage, stageName) => {
  if (stageName) return stageName;
  
  switch (stage) {
    case 2:
      return 'Đang xử lý';
    case 3:
      return 'Đã đóng';
    case 5:
      return 'Đã hủy';
    default:
      return stage || 'Không xác định';
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

const RiskHistory = ({ history = [] }) => {
  console.log('RiskHistory component received:', history);
  
  if (!Array.isArray(history)) {
    console.error('History prop is not an array:', history);
    return null;
  }

  if (history.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Lịch sử xử lý
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
        Lịch sử xử lý
      </Typography>
      <Timeline>
        {history.map((item, index) => {
          console.log('Rendering history item:', item);
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
                <TimelineDot variant="outlined" color={getStatusColor(item.newState || item.state)} />
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" component="span">
                  {item.stateName || getStatusName(item.newState || item.state)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  bởi {getChangedByName(item.changedBy, item.changedByName)}
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

export default RiskHistory; 