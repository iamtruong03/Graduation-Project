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
    case 'Mới ghi nhận':
    case 'new':
    case 1:
      return 'warning'; // Mới ghi nhận
    case 'Đang phân tích':
    case 'analyzing':
    case 2:
      return 'info'; // Đang phân tích
    case 'Đang xử lý':
    case 'processing':
    case 3:
      return 'primary'; // Đang xử lý
    case 'Chờ xác nhận':
    case 'pending_verification':
    case 4:
      return 'warning'; // Chờ xác nhận
    case 'Đã giải quyết':
    case 'resolved':
    case 5:
      return 'success'; // Đã giải quyết
    case 'Đã đóng':
    case 'closed':
    case 6:
      return 'success'; // Đã đóng
    case 'Đã hủy':
    case 'cancelled':
    case 7:
      return 'error'; // Đã hủy
    default:
      return 'grey';
  }
};

const getStatusName = (stage) => {
  switch (stage) {
    case 1:
    case 'new':
      return 'Mới ghi nhận';
    case 2:
    case 'analyzing':
      return 'Đang phân tích';
    case 3:
    case 'processing':
      return 'Đang xử lý';
    case 4:
    case 'pending_verification':
      return 'Chờ xác nhận';
    case 5:
    case 'resolved':
      return 'Đã giải quyết';
    case 6:
    case 'closed':
      return 'Đã đóng';
    case 7:
    case 'cancelled':
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
                  {formatDate(item.changedAt || item.updatedAt)}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot variant="outlined" color={getStatusColor(item.newStage || item.stage)} />
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" component="span">
                  {item.stageName || getStatusName(item.newStage || item.stage)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  bởi {getChangedByName(item.changedBy || item.updatedBy, item.changedByName || item.updatedByName)}
                </Typography>
                {item.comment && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {item.comment}
                  </Typography>
                )}
                {item.riskLevel && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Mức độ rủi ro: {item.riskLevel}
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