import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Business,
  Warning,
  Menu as MenuIcon,
  Assignment,
  People,
  Task,
  BarChart,
  Groups,
  Person,
  Assessment,
  Close,
  ManageAccounts,
  AccountCircle,
  Notifications,
  Description,
  AccountTree,
  Logout as LogoutIcon,
  Chat as ChatIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('risk');
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  const handleNotificationClick = () => {
    window.location.href = '/notification';
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      // Hiển thị thông báo đăng xuất thành công nếu cần
      console.log(result.message);
    }
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleClick = (menu) => {
    if (selectedMenu === menu) {
      setSelectedMenu('');
    } else {
      setSelectedMenu(menu);
    }
  };

  const items = [
    {
      id: 'risk',
      text: 'Quản lý rủi ro',
      icon: <Warning />,
      subItems: [
        { id: 'risk-list', text: 'Danh sách rủi ro', path: '/risk/list' },
      ],
    },
    {
      id: 'project',
      text: 'Quản lý dự án',
      icon: <Assignment />,
      subItems: [
        { id: 'project-list', text: 'Danh sách dự án', path: '/project/list' },
      ],
    },
    {
      id: 'task',
      text: 'Quản lý công việc',
      icon: <Task />,
      subItems: [
        { id: 'task-list', text: 'Danh sách công việc', path: '/task/list' },
      ],
    },
    {
      id: 'department',
      text: 'Quản lý phòng ban',
      icon: <Business />,
      subItems: [
        { id: 'department-list', text: 'Danh sách phòng ban', path: '/department/list' },
      ],
    },
    {
      id: 'staff',
      text: 'Quản lý nhân sự',
      icon: <People />,
      subItems: [
        { id: 'staff-management', text: 'Quản lý nhân sự', path: '/staff/management' },
      ],
    },
    {
      id: 'statistics',
      text: 'Thống kê',
      icon: <BarChart />,
      subItems: [
        { id: 'department-stats', text: 'Thống kê phòng ban', icon: <Groups />, path: '/dashboard/department' },
        { id: 'employee-stats', text: 'Thống kê hiệu suất nhân viên', icon: <Person />, path: '/dashboard/employee' },
      ]
    },
    {
      id: 'document',
      text: 'Quản lý tài liệu',
      icon: <Description />,
      subItems: [
        { id: 'document-management', text: 'Danh sách tài liệu', path: '/document/management' },
      ],
    },
    {
      id: 'category',
      text: 'Quản lý danh mục',
      icon: <Assessment />,
      subItems: [
        { id: 'category-management', text: 'Danh mục chung', path: '/category/management' },
      ],
    }
  ];

  const drawer = (
    <Box sx={{ mt: 8 }}>
      <List>
        {items.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleClick(item.id)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {selectedMenu === item.id ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={selectedMenu === item.id} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.subItems.map((subItem) => (
                  <ListItemButton
                    key={subItem.id}
                    sx={{ pl: 4 }}
                    component={Link}
                    to={subItem.path}
                  >
                    <ListItemIcon>{subItem.icon}</ListItemIcon>
                    <ListItemText primary={subItem.text} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            THT
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mr: 2, 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer' 
            }}
            onClick={() => navigate('/account/my-account')}
          >
            <AccountCircle sx={{ mr: 1 }} />
            Xin chào, {userName}!
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => navigate('/chat')}
            sx={{ ml: 1 }}
          >
            <ChatIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <Badge badgeContent={unreadNotifications} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;