import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
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
  Logout
} from '@mui/icons-material';

// Remove this line
// import { BarChartOutlined, TeamOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons';

const drawerWidth = 280;

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('risk');

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
      text: 'Quản lý',
      icon: <Warning />,
      subItems: [
        { id: 'risk-list', text: 'Danh sách', path: '/risk/list' },
      ],
    },
    {
      id: 'department',
      text: 'Quản lý phòng ban',
      icon: <Business />,
      subItems: [
        { id: 'department-list', text: 'Danh sách phòng ban', path: '/department/list' },
        { id: 'department-type', text: 'Loại phòng ban', path: '/department/type' },
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
      id: 'staff',
      text: 'Quản lý nhân sự',
      icon: <People />,
      subItems: [
        { id: 'department-staff', text: 'Nhân sự phòng ban', path: '/staff/department' },
        { id: 'staff-management', text: 'Quản lý nhân sự', path: '/staff/management' },
      ],
    },
    {
      id: 'task',
      text: 'Quản lý công việc',
      icon: <Task />,
      subItems: [
        { id: 'task-list', text: 'Danh sách công việc', path: '/task/list' },
        { id: 'task-type', text: 'Loại công việc', path: '/task/type' },
        { id: 'task-status', text: 'Trạng thái công việc', path: '/task/status' },
      ],
    },
    {
      id: 'statistics',
      text: 'Thống kê',
      icon: <BarChart />,
      subItems: [
        { id: 'department-stats', text: 'Thống kê phòng ban', icon: <Groups />, path: '/dashboard/department' },
        { id: 'employee-stats', text: 'Thống kê nhân viên', icon: <Person />, path: '/dashboard/employee' },
        { id: 'project-stats', text: 'Thống kê dự án', icon: <Assessment />, path: '/dashboard/project' }
      ]
    }
  ];

  // Update the ListItemButton in the drawer mapping
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
          <IconButton color="inherit" onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}>
            <Logout />
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
        }}
      >
        <Toolbar />
        <Outlet /> {/* Ensure Outlet is used to render nested routes */}
      </Box>
    </Box>
  );
};

export default Layout;