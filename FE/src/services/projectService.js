import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const projectService = {
  // Lấy tất cả dự án với filter
  getAllProjects: (filter = {}) => {
    return api.get('/api/projects', { 
      ...getAuthHeader(),
      params: filter 
    });
  },

  // Tạo dự án mới
  createProject: async (projectData) => {
    try {
      const response = await api.post('/api/projects/create', projectData, getAuthHeader());
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết dự án theo ID
  getProjectById: async (id) => {
    const response = await api.get(`/api/projects/${id}/details`, getAuthHeader());
    return response.data;
  },

  // Gửi phê duyệt dự án
  submitForApproval: async (id, approverIds) => {
    const response = await api.post(
      `/api/projects/${id}/submit-approval`,
      approverIds,
      getAuthHeader()
    );
    return response.data;
  },

  // Phê duyệt dự án
  approveProject: (id, approverId) => {
    return api.put(`/api/projects/${id}/approve`, { approverId }, getAuthHeader());
  },

  // Cập nhật trạng thái dự án
  updateProjectState: async (id, newState, changedBy, comment) => {
    const response = await api.put(
      `/api/projects/${id}/update-state`,
      null,
      {
        ...getAuthHeader(),
        params: {
          newState,
          changedBy,
          comment
        }
      }
    );
    return response.data;
  },

  // Lấy lịch sử thay đổi trạng thái
  getProjectHistory: async (id) => {
    const response = await api.get(
      `/api/projects/${id}/history`,
      getAuthHeader()
    );
    return response.data;
  },

  // Xóa dự án
  deleteProject: (id) => {
    return api.delete(`/api/projects/${id}`, getAuthHeader());
  },

  // Upload tài liệu đính kèm
  uploadAttachment: async (projectId, file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await api.post(
      `/api/projects/${projectId}/attachments`,
      formData,
      {
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Download tài liệu đính kèm
  downloadAttachment: async (projectId, attachmentId) => {
    const response = await api.get(
      `/api/projects/${projectId}/attachments/${attachmentId}`,
      {
        ...getAuthHeader(),
        responseType: 'blob'
      }
    );
    return response.data;
  },

  // Xuất dữ liệu dự án
  exportProjects: () => {
    return api.get('/api/projects/export', {
      ...getAuthHeader(),
      responseType: 'blob'
    });
  },

  // Tìm kiếm dự án với phân trang
  searchProjects: (filter) => {
    return api.post('/api/projects/search', 
      {
        search: filter.search || '',
        projectType: filter.projectType,
        state: filter.state
      },
      {
        ...getAuthHeader(),
        params: {
          page: filter.page || 0,
          size: filter.size || 10
        }
      }
    );
  },

  // Lấy danh sách dự án chờ duyệt
  getPendingApprovalProjects: (params) => {
    return api.get('/api/projects/pending-approval', {
      ...getAuthHeader(),
      params: {
        page: params.page || 0,
        size: params.size || 10,
        search: params.search || ''
      }
    });
  }
};

export default projectService;