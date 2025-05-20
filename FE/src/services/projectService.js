import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const projectService = {
  // Lấy tất cả dự án
  getAllProjects: () => {
    return axios.get(`${API_URL}/project`);
  },

  // Tạo dự án mới
  createProject: (projectData) => {
    return axios.post(`${API_URL}/project`, projectData);
  },

  // Lấy chi tiết dự án theo ID
  getProjectById: async (id) => {
    const response = await axios.get(`${API_URL}/project/${id}`);
    return response.data;
  },

  // Tìm kiếm dự án với phân trang
  searchProjects: ({ page = 0, size = 10, search = '' }) => {
    return axios.post(`${API_URL}/project/search`, null, {
      params: {
        search,
        page,
        size
      }
    });
  },

  // Cập nhật thông tin dự án
  updateProject: async (id, projectData) => {
    const response = await axios.put(`${API_URL}/project/${id}`, projectData);
    return response.data;
  },

  // Xóa dự án
  deleteProject: (id) => {
    return axios.delete(`${API_URL}/project/${id}`);
  },

  // Thay đổi trạng thái dự án
  changeProjectStatus: (id) => {
    return axios.post(`${API_URL}/project/change-status/${id}`);
  },

  // Lấy lịch sử thay đổi trạng thái
  getProjectHistory: async (id) => {
    const response = await axios.get(`${API_URL}/project/${id}/history`);
    return response.data;
  },

  // Thêm lịch sử thay đổi trạng thái
  addProjectHistory: async (id, previousState, newState, changedBy, comment) => {
    const response = await axios.post(`${API_URL}/project/${id}/history`, null, {
      params: {
        previousState,
        newState,
        changedBy,
        comment
      }
    });
    return response.data;
  }
};

export default projectService;