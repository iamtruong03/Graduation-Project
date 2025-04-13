import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const mockDepartments = [
  { id: 1, name: 'Phòng kế toán' },
  { id: 2, name: 'Phòng hành chính' },
  { id: 3, name: 'Phòng kỹ thuật' },
];

const mockEmployeeStats = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    inProgress: 5,
    completed: 8,
    completionRate: 61.5,
  },
  {
    id: 2,
    name: 'Trần Thị B',
    inProgress: 3,
    completed: 12,
    completionRate: 80,
  },
  {
    id: 3,
    name: 'Lê Văn C',
    inProgress: 7,
    completed: 4,
    completionRate: 36.4,
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EmployeeStats = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const barChartData = mockEmployeeStats.map(employee => ({
    name: employee.name,
    'Đang thực hiện': employee.inProgress,
    'Đã hoàn thành': employee.completed,
  }));

  const pieChartData = mockEmployeeStats.map(employee => ({
    name: employee.name,
    value: employee.completionRate,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Thống kê tiến độ công việc nhân viên
      </Typography>

      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Phòng ban</InputLabel>
        <Select
          value={selectedDepartment}
          label="Phòng ban"
          onChange={handleDepartmentChange}
        >
          {mockDepartments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên nhân viên</TableCell>
              <TableCell align="center">Đang thực hiện</TableCell>
              <TableCell align="center">Đã hoàn thành</TableCell>
              <TableCell align="center">Tỷ lệ hoàn thành</TableCell>
              <TableCell>Tiến độ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockEmployeeStats.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell align="center">{employee.inProgress}</TableCell>
                <TableCell align="center">{employee.completed}</TableCell>
                <TableCell align="center">{employee.completionRate}%</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={employee.completionRate}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${Math.round(employee.completionRate)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Số lượng công việc theo nhân viên
          </Typography>
          <BarChart width={600} height={300} data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Đang thực hiện" fill="#8884d8" />
            <Bar dataKey="Đã hoàn thành" fill="#82ca9d" />
          </BarChart>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tỷ lệ hoàn thành công việc
          </Typography>
          <PieChart width={400} height={300}>
            <Pie
              data={pieChartData}
              cx={200}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Paper>
      </Box>
    </Box>
  );
};

export default EmployeeStats;