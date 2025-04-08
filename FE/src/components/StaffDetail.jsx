import React from 'react';
import { Card, Button, Typography } from 'antd';

const StaffDetail = ({ staff }) => {
  if (!staff) {
    return <Typography.Title level={4}>Không có thông tin nhân viên.</Typography.Title>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        Chi tiết nhân viên
      </Typography.Title>

      <Card style={{ padding: 24 }}>
        <Typography.Text strong>Mã nhân viên:</Typography.Text> {staff.code}<br />
        <Typography.Text strong>Tên nhân viên:</Typography.Text> {staff.name}<br />
        <Typography.Text strong>Phòng ban:</Typography.Text> {staff.department}<br />
        <Typography.Text strong>Chức vụ:</Typography.Text> {staff.position}<br />
        <Typography.Text strong>Email:</Typography.Text> {staff.email}<br />
        <Typography.Text strong>Số điện thoại:</Typography.Text> {staff.phone}<br />
        <Typography.Text strong>Trạng thái:</Typography.Text> {staff.status}<br />
        <Button type="primary" style={{ marginTop: 16 }}>
          Chỉnh sửa
        </Button>
      </Card>
    </div>
  );
};

export default StaffDetail;