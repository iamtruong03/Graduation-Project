import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Link
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';

const mockTask = {
  id: 1,
  code: 'CV001',
  name: 'Phát triển tính năng mới',
  taskType: 'project',
  project: 'Dự án A',
  department: 'Phòng kỹ thuật',
  type: 'Phát triển',
  status: 'Đang thực hiện',
  priority: 'Cao',
  manager: 'Nguyễn Văn A',
  assignee: 'Trần Thị B',
  description: 'Phát triển tính năng quản lý công việc mới cho hệ thống, bao gồm các chức năng thêm, sửa, xóa và phân công công việc.',
  active: true,
  createdAt: '15/07/2023',
  updatedAt: '20/07/2023',
  statusHistory: [
    { status: 'Chưa bắt đầu', updatedAt: '15/07/2023', updatedBy: 'Nguyễn Văn A' },
    { status: 'Đang thực hiện', updatedAt: '16/07/2023', updatedBy: 'Trần Thị B' },
    { status: 'Tạm dừng', updatedAt: '18/07/2023', updatedBy: 'Nguyễn Văn A' },
    { status: 'Đang thực hiện', updatedAt: '20/07/2023', updatedBy: 'Trần Thị B' },
  ],
  attachments: [
    { id: 1, name: 'Tài liệu phân tích.docx', size: '2.5MB', uploadedAt: '15/07/2023' },
    { id: 2, name: 'Thiết kế giao diện.pdf', size: '5.1MB', uploadedAt: '16/07/2023' },
    { id: 3, name: 'Hướng dẫn sử dụng.pdf', size: '1.8MB', uploadedAt: '20/07/2023' },
  ]
};

const TaskDetail = () => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate('/task/list');
  };
  
  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <IconButton 
        aria-label="close" 
        onClick={handleClose}
        sx={{ 
          position: 'absolute', 
          right: 8, 
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h5" sx={{ mb: 3 }}>CHI TIẾT CÔNG VIỆC</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Mã công việc</Typography>
                <Typography variant="body1">{mockTask.code}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tên công việc</Typography>
                <Typography variant="body1">{mockTask.name}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Loại công việc</Typography>
                <Typography variant="body1">
                  {mockTask.taskType === 'project' ? 'Công việc dự án' : 'Công việc phòng ban'}
                </Typography>
              </Box>

              {mockTask.taskType === 'project' && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Dự án</Typography>
                  <Typography variant="body1">{mockTask.project}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Phòng ban</Typography>
                <Typography variant="body1">{mockTask.department}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                <Chip
                  label={mockTask.status}
                  color={mockTask.status === 'Đang thực hiện' ? 'primary' : 'default'}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Mức độ ưu tiên</Typography>
                <Chip
                  label={mockTask.priority}
                  color={mockTask.priority === 'Cao' ? 'error' : 'default'}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Người phụ trách</Typography>
                <Typography variant="body1">{mockTask.manager}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Người thực hiện</Typography>
                <Typography variant="body1">{mockTask.assignee}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Mô tả</Typography>
                <Typography variant="body1">{mockTask.description}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskDetail;