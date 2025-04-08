import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';

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

  const menuItems = [
    {
      id: 'risk',
      text: 'Quản lý',
      icon: <Warning />,
      subItems: [
        { id: 'risk-list', text: 'Danh sách' },
      ],
    },
    {
      id: 'department',
      text: 'Quản lý phòng ban',
      icon: <Business />,
      subItems: [
        { id: 'department-list', text: 'Danh sách phòng ban' },
        { id: 'department-type', text: 'Loại phòng ban' },
      ],
    },
    {
      id: 'project',
      text: 'Quản lý dự án',
      icon: <Assignment />,
      subItems: [
        { id: 'project-list', text: 'Danh sách dự án' },
      ],
    },
    {
      id: 'staff',
      text: 'Quản lý nhân sự',
      icon: <People />,
      subItems: [
        { id: 'department-staff', text: 'Nhân sự phòng ban' },
        { id: 'staff-management', text: 'Quản lý nhân sự' },
      ],
    },
    {
      id: 'task',
      text: 'Quản lý công việc',
      icon: <Task />,
      subItems: [
        { id: 'task-list', text: 'Danh sách công việc' },
        { id: 'task-type', text: 'Loại công việc' },
        { id: 'task-status', text: 'Trạng thái công việc' },
      ],
    },
  ];

  const drawer = (
    <Box sx={{ mt: 8 }}>
      <List>
        {menuItems.map((item) => (
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
                    to={subItem.id === 'department-list' ? '/department/list' : 
                       subItem.id === 'department-type' ? '/department/type' :
                       subItem.id === 'risk-list' ? '/risk/list' :
                       subItem.id === 'project-list' ? '/project/list' :
                       subItem.id === 'department-staff' ? '/staff/department' :
                       subItem.id === 'staff-management' ? '/staff/management' :
                       subItem.id === 'task-list' ? '/task/list' :
                       subItem.id === 'task-type' ? '/task/type' :
                       subItem.id === 'task-status' ? '/task/status' : '#'}
                  >
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
          <Typography variant="h6" noWrap component="div">
            THT
          </Typography>
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
        {children}
      </Box>
    </Box>
  );
};

export default Layout;