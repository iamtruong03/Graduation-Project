import api from './api';

const projectService = {
  // Lấy tất cả dự án
  getAllProjects: () => {
    return api.get('/projects');
  },

  // Tạo dự án mới
  createProject: (projectData) => {
    return api.post('/project', projectData);
  },

  // Lấy chi tiết dự án theo ID
  getProjectById: (id) => {
    return api.get(`/project/${id}`);
  },

  // Tìm kiếm dự án với phân trang
  searchProjects: ({ page = 0, size = 10, search = '' }) => {
    return api.post('/project/search', null, {
      params: {
        search,
        page,
        size
      }
    });
  },

  // Cập nhật thông tin dự án
  updateProject: (id, projectData) => {
    return api.put(`/project/update/${id}`, projectData);
  },

  // Xóa dự án
  deleteProject: (id) => {
    return api.delete(`/project/delete/${id}`);
  },

  // Thay đổi trạng thái dự án
  changeProjectStatus: (id) => {
    return api.post(`/project/change-status/${id}`);
  }
};

export default projectService;