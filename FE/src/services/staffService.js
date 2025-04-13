import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const staffService = {
  // Lấy danh sách tất cả nhân viên
  getAllStaff: () => {
    return api.get('/user/list', getAuthHeader());
  },

  // Lấy thông tin chi tiết nhân viên
  getStaffById: (id) => {
    return api.get(`/user/${id}`, getAuthHeader());
  },

  // Thêm nhân viên mới
  createStaff: (staffData) => {
    return api.post('/user', staffData, getAuthHeader());
  },

  // Cập nhật thông tin nhân viên
  updateStaff: (id, staffData) => {
    return api.put(`/staff/${id}`, staffData, getAuthHeader());
  },

  // Xóa nhân viên
  deleteStaff: (id) => {
    return api.delete(`/staff/${id}`, getAuthHeader());
  },

  // Lấy danh sách nhân viên theo trạng thái
  getStaffByStatus: (status) => {
    return api.get('/staff', {
      params: { status },
      ...getAuthHeader()
    });
  },

  // Tìm kiếm nhân viên
  searchStaff: (searchTerm) => {
    return api.get('/staff/search', {
      params: { q: searchTerm },
      ...getAuthHeader()
    });
  }
};

export default staffService;
