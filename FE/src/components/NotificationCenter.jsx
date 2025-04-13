import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Badge,
  Tabs,
  Tab,
  Paper,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as TaskIcon,
  Event as EventIcon,
  Mail as MailIcon,
  MoreVert as MoreIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const mockNotifications = [
  {
    id: 1,
    type: 'task',
    title: 'Công việc mới được giao',
    message: 'Bạn được giao công việc "Phát triển tính năng mới" trong dự án A',
    time: '5 phút trước',
    read: false,
    priority: 'high',
  },
  {
    id: 2,
    type: 'reminder',
    title: 'Nhắc nhở deadline',
    message: 'Công việc "Kiểm thử module" sẽ đến hạn trong 2 ngày',
    time: '1 giờ trước',
    read: false,
    priority: 'medium',
  },
  {
    id: 3,
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống sẽ bảo trì vào 22:00 ngày 15/08/2023',
    time: '2 giờ trước',
    read: true,
    priority: 'low',
  },
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleMenuClick = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = () => {
    setNotifications(notifications.map(notification =>
      notification.id === selectedNotification.id
        ? { ...notification, read: true }
        : notification
    ));
    handleMenuClose();
  };

  const handleDelete = () => {
    setNotifications(notifications.filter(
      notification => notification.id !== selectedNotification.id
    ));
    handleMenuClose();
  };

  const handleViewDetails = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'task':
        return <TaskIcon color={priority === 'high' ? 'error' : 'primary'} />;
      case 'reminder':
        return <EventIcon color={priority === 'high' ? 'error' : 'primary'} />;
      case 'system':
        return <InfoIcon color="primary" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  const getPriorityChip = (priority) => {
    const props = {
      high: { label: 'Cao', color: 'error' },
      medium: { label: 'Trung bình', color: 'warning' },
      low: { label: 'Thấp', color: 'success' },
    }[priority] || { label: 'Bình thường', color: 'default' };

    return <Chip size="small" {...props} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          Thông báo
        </Typography>
        <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
          <NotificationsIcon />
        </Badge>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setNotifications(notifications.map(n => ({ ...n, read: true })));
          }}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Tất cả" />
          <Tab label="Chưa đọc" />
          <Tab label="Công việc" />
          <Tab label="Nhắc nhở" />
        </Tabs>
      </Paper>

      <List>
        {notifications.map((notification) => (
          <React.Fragment key={notification.id}>
            <ListItem
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type, notification.priority)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                    >
                      {notification.title}
                    </Typography>
                    {getPriorityChip(notification.priority)}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(event) => handleMenuClick(event, notification)}
                >
                  <MoreIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMarkAsRead}>
          <ListItemIcon>
            <CheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đánh dấu đã đọc</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xóa thông báo</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết thông báo</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedNotification.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedNotification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Thời gian: {selectedNotification.time}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationCenter;