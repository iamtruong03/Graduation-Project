import api from './api';

const projectService = {
  // Lấy danh sách dự án
  getAllProjects: () => {
    return api.get('/projects');
  },

  // Lấy chi tiết dự án
  getProjectById: (id) => {
    return api.get(`/projects/${id}`);
  },

  // Thêm dự án mới
  createProject: (projectData) => {
    return api.post('/projects', projectData);
  },

  // Cập nhật thông tin dự án
  updateProject: (id, projectData) => {
    return api.put(`/projects/${id}`, projectData);
  },

  // Xóa dự án
  deleteProject: (id) => {
    return api.delete(`/projects/${id}`);
  },

  // Lấy danh sách nhân viên trong dự án
  getProjectStaff: (projectId) => {
    return api.get(`/projects/${projectId}/staff`);
  },

  // Thêm nhân viên vào dự án
  addStaffToProject: (projectId, staffId) => {
    return api.post(`/projects/${projectId}/staff/${staffId}`);
  },

  // Xóa nhân viên khỏi dự án
  removeStaffFromProject: (projectId, staffId) => {
    return api.delete(`/projects/${projectId}/staff/${staffId}`);
  }
};

export default projectService;