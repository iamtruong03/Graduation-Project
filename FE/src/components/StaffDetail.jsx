import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';

const StaffDetail = ({ staff }) => {
  if (!staff) {
    return <Typography variant="h6">Không có thông tin nhân viên.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Chi tiết nhân viên
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1"><strong>Mã nhân viên:</strong> {staff.code}</Typography>
        <Typography variant="body1"><strong>Tên nhân viên:</strong> {staff.name}</Typography>
        <Typography variant="body1"><strong>Phòng ban:</strong> {staff.department}</Typography>
        <Typography variant="body1"><strong>Chức vụ:</strong> {staff.position}</Typography>
        <Typography variant="body1"><strong>Email:</strong> {staff.email}</Typography>
        <Typography variant="body1"><strong>Số điện thoại:</strong> {staff.phone}</Typography>
        <Typography variant="body1"><strong>Trạng thái:</strong> {staff.status}</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Chỉnh sửa
        </Button>
      </Paper>
    </Box>
  );
};

export default StaffDetail;