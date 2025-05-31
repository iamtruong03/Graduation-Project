import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const riskService = {
  // Lấy danh sách rủi ro
  getAllRisks: () => {
    return api.get('api/risks/list', getAuthHeader());
  },

  // Lấy chi tiết rủi ro
  getRiskById: async (id) => {
    const response = await api.get(`api/risks/${id}`, getAuthHeader());
    return response.data;
  },

  // Lấy lịch sử rủi ro
  getRiskHistory: async (id) => {
    const response = await api.get(`api/risks/${id}/history`, getAuthHeader());
    return response.data;
  },

  // Thêm rủi ro mới
  createRisk: async (riskData) => {
    try {
      const response = await api.post('/api/risks', riskData, getAuthHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin rủi ro
  updateRisk: async (id, riskData) => {
    const response = await api.put(`api/risks/${id}/update`, riskData, getAuthHeader());
    return response.data;
  },

  // Xóa rủi ro
  deleteRisk: (id) => {
    return api.post(`api/risks/change-status/${id}`, getAuthHeader());
  },

  // Thêm lịch sử thay đổi trạng thái
  addRiskHistory: async (id, previousState, newState, changedBy, comment) => {
    const response = await api.post(`api/risks/${id}/history`, null, {
      ...getAuthHeader(),
      params: {
        previousState,
        newState,
        changedBy,
        comment
      }
    });
    return response.data;
  },

  searchRisks: (filter, page = 0, size = 10) => {
    return api.post('api/risks/search', filter, {
      ...getAuthHeader(),
      params: { page, size }
    });
  },

  // Lấy danh sách rủi ro chờ duyệt
  getPendingApprovalRisks: async () => {
    try {
      const response = await api.get('/api/risks/pending-approval', getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách rủi ro chờ duyệt:', error);
      return [];
    }
  },

  // Xuất dữ liệu rủi ro
  exportRisks: (filter) => {
    return api.get('/api/risks/export', {
      ...getAuthHeader(),
      responseType: 'blob',
      params: filter,
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  }
};

export default riskService;