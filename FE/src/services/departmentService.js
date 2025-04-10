import api from './api';

const departmentService = {
  // Lấy danh sách phòng ban
  getAllDepartments: () => {
    return api.get('/department/list');
  },

  // Lấy chi tiết một phòng ban
  getDepartmentById: (id) => {
    return api.get(`/department/${id}`);
  },

  // Thêm phòng ban mới
  createDepartment: (departmentData) => {
    return api.post('/department', departmentData);
  },

  // Cập nhật thông tin phòng ban
  updateDepartment: (id, departmentData) => {
    return api.put(`/department/${id}`, departmentData);
  },

  // Xóa phòng ban
  deleteDepartment: (id) => {
    return api.delete(`/department/${id}`);
  },

  // Lấy danh sách nhân viên theo phòng ban
  getDepartmentStaff: (departmentId) => {
    return api.get(`/department/${departmentId}/staff`);
  }
};

export default departmentService;