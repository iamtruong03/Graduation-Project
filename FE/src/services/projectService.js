import api from './api';

const projectService = {
  // Lấy danh sách dự án
  getAllProjects: () => {
    return api.get('/project/list');
  },

  // Lấy chi tiết dự án
  getProjectById: (id) => {
    return api.get(`/project/${id}`);
  },

  // Thêm dự án mới
  createProject: (projectData) => {
    return api.post('/project', projectData);
  },

  // Cập nhật thông tin dự án
  updateProject: (id, projectData) => {
    return api.put(`/project/${id}`, projectData);
  },

  // Xóa dự án
  deleteProject: (id) => {
    return api.delete(`/project/${id}`);
  },

  // Lấy danh sách nhân viên trong dự án
  getProjectStaff: (projectId) => {
    return api.get(`/project/${projectId}/staff`);
  },

  // Thêm nhân viên vào dự án
  addStaffToProject: (projectId, staffId) => {
    return api.post(`/project/${projectId}/staff/${staffId}`);
  },

  // Xóa nhân viên khỏi dự án
  removeStaffFromProject: (projectId, staffId) => {
    return api.delete(`/project/${projectId}/staff/${staffId}`);
  }
};

export default projectService;