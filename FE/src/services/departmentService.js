import api from './api';

const departmentService = {
  // Lấy danh sách phòng ban
  getAllDepartments: () => {
    return api.get('/departments');
  },

  // Lấy chi tiết một phòng ban
  getDepartmentById: (id) => {
    return api.get(`/departments/${id}`);
  },

  // Thêm phòng ban mới
  createDepartment: (departmentData) => {
    return api.post('/departments', departmentData);
  },

  // Cập nhật thông tin phòng ban
  updateDepartment: (id, departmentData) => {
    return api.put(`/departments/${id}`, departmentData);
  },

  // Xóa phòng ban
  deleteDepartment: (id) => {
    return api.delete(`/departments/${id}`);
  },

  // Lấy danh sách nhân viên theo phòng ban
  getDepartmentStaff: (departmentId) => {
    return api.get(`/departments/${departmentId}/staff`);
  }
};

export default departmentService;