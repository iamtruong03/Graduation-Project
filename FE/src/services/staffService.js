import api from './api';

const staffService = {
  // Lấy danh sách tất cả nhân viên
  getAllStaff: () => {
    return api.get('/user/list');
  },

  // Lấy thông tin chi tiết nhân viên
  getStaffById: (id) => {
    return api.get(`/user/${id}`);
  },

  // Thêm nhân viên mới
  createStaff: (staffData) => {
    return api.post('/user', staffData);
  },

  // Cập nhật thông tin nhân viên
  updateStaff: (id, staffData) => {
    return api.put(`/staff/${id}`, staffData);
  },

  // Xóa nhân viên
  deleteStaff: (id) => {
    return api.delete(`/staff/${id}`);
  },

  // Lấy danh sách nhân viên theo trạng thái
  getStaffByStatus: (status) => {
    return api.get('/staff', { params: { status } });
  },

  // Tìm kiếm nhân viên
  searchStaff: (searchTerm) => {
    return api.get('/staff/search', { params: { q: searchTerm } });
  }
};

export default staffService;