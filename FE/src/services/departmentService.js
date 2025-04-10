import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const departmentService = {
  // Lấy danh sách phòng ban
  getAllDepartments: () => {
    return api.get('/department/list', getAuthHeader());
  },

  // Lấy chi tiết một phòng ban
  getDepartmentById: (id) => {
    return api.get(`/department/${id}`, getAuthHeader());
  },

  // Thêm phòng ban mới
  createDepartment: (departmentData) => {
    return api.post('/department', departmentData, getAuthHeader());
  },

  // Cập nhật thông tin phòng ban
  updateDepartment: (id, departmentData) => {
    return api.put(`/department/${id}`, departmentData, getAuthHeader());
  },

  // Xóa phòng ban
  deleteDepartment: (id) => {
    return api.delete(`/department/${id}`, getAuthHeader());
  },

  // Lấy danh sách nhân viên theo phòng ban
  getDepartmentStaff: (departmentId) => {
    return api.get(`/department/${departmentId}/staff`, getAuthHeader());
  }
};

export default departmentService;
