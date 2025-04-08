import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import { format } from 'date-fns';
import vi from 'date-fns/locale/vi';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState({
    id: 1,
    code: 'PRJ001',
    name: 'Dự án A',
    manager: 'Nguyễn Văn A',
    department: 'Phòng Kỹ thuật',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'IN_PROGRESS',
    tasks: [
      {
        id: 1,
        name: 'Phân tích yêu cầu',
        assignee: 'Trần Thị B',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        status: 'COMPLETED',
        priority: 'HIGH',
      },
      {
        id: 2,
        name: 'Thiết kế hệ thống',
        assignee: 'Lê Văn C',
        startDate: new Date('2024-01-16'),
        endDate: new Date('2024-02-15'),
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
      },
    ],
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return '#4caf50';
      case 'IN_PROGRESS':
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
      case 'HIGH':
        return '#f44336';
      case 'MEDIUM':
        return '#ff9800';
      case 'LOW':
        return '#4caf50';
      default:
        return '#000000';
    }
  };

  const formatDate = (date) => {
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Chi tiết dự án
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Mã dự án
            </Typography>
            <Typography variant="body1">{project.code}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Tên dự án
            </Typography>
            <Typography variant="body1">{project.name}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Người quản lý
            </Typography>
            <Typography variant="body1">{project.manager}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Phòng ban thực hiện
            </Typography>
            <Typography variant="body1">{project.department}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Ngày bắt đầu
            </Typography>
            <Typography variant="body1">{formatDate(project.startDate)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Ngày kết thúc
            </Typography>
            <Typography variant="body1">{formatDate(project.endDate)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Trạng thái
            </Typography>
            <Chip
              label={project.status}
              size="small"
              sx={{
                bgcolor: getStatusColor(project.status),
                color: 'white',
                mt: 0.5,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Danh sách công việc</Typography>
        <Button variant="contained" href={`/task/create?projectId=${project.id}`}>
          Thêm công việc
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên công việc</TableCell>
              <TableCell>Người thực hiện</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Độ ưu tiên</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {project.tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Button
                    color="primary"
                    href={`/task/detail/${task.id}`}
                    sx={{ p: 0, textTransform: 'none' }}
                  >
                    {task.name}
                  </Button>
                </TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell>{formatDate(task.startDate)}</TableCell>
                <TableCell>{formatDate(task.endDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      bgcolor: getPriorityColor(task.priority),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(task.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectDetail;