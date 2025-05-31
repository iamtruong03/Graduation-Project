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
    const response = await api.get(`/api/projects/${id}`, getAuthHeader());
    return response;
  },

  // Phê duyệt dự án
  approveProject: (id, approverId) => {
    return api.post(`/api/projects/${id}/approve`, { approverId }, getAuthHeader());
  },

  // Từ chối duyệt dự án
  rejectProject: (id, reason) => {
    return api.post(`/api/projects/${id}/reject`, null, {
      ...getAuthHeader(),
      params: { reason }
    });
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
    try {
      console.log('Calling project history API for id:', id);
      const response = await api.get(
        `/api/projects/${id}/history`,
        getAuthHeader()
      );
      console.log('Raw API Response:', response.data);
      console.log('Response data:', response.data.data);
      // Trả về đúng cấu trúc dữ liệu từ API
      return response.data;
    } catch (error) {
      console.error('Error fetching project history:', error);
      return {
        status: 500,
        data: [],
        message: error.message || 'Có lỗi xảy ra khi tải lịch sử'
      };
    }
  },

  // Xóa dự án
  deleteProject: async (id) => {
    try {
      const response = await api.post(`/api/projects/change-status/${id}`, null, getAuthHeader());
      return response;
    } catch (error) {
      throw error;
    }
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
    return response;
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
    return response;
  },

  // Xuất dữ liệu dự án
  exportProjects: (filter) => {
    return api.get('/api/projects/export', {
      ...getAuthHeader(),
      responseType: 'blob',
      params: filter,
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
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
  },

  // Cập nhật thông tin dự án
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(
        `/api/projects/${id}/update`,
        projectData,
        getAuthHeader()
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách dự án theo phân quyền
  getProjectList: async () => {
    try {
      const response = await api.get('/api/projects/list', getAuthHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default projectService;