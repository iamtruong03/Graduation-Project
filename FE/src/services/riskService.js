import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const riskService = {
  // Lấy danh sách rủi ro
  getAllRisks: () => {
    return axios.get(`${API_URL}/risk`);
  },

  // Lấy chi tiết rủi ro
  getRiskById: async (id) => {
    const response = await axios.get(`${API_URL}/risk/${id}`);
    return response.data;
  },

  // Lấy lịch sử rủi ro
  getRiskHistory: async (id) => {
    const response = await axios.get(`${API_URL}/risk/${id}/history`);
    return response.data;
  },

  // Thêm rủi ro mới
  createRisk: (riskData) => {
    return axios.post(`${API_URL}/risk`, riskData);
  },

  // Cập nhật thông tin rủi ro
  updateRisk: async (id, riskData) => {
    const response = await axios.put(`${API_URL}/risk/${id}`, riskData);
    return response.data;
  },

  // Xóa rủi ro
  deleteRisk: (id) => {
    return axios.delete(`${API_URL}/risk/${id}`);
  },

  // Lấy danh sách loại rủi ro
  getRiskTypes: () => {
    return axios.get(`${API_URL}/risk-types`);
  },

  // Lấy danh sách mức độ rủi ro
  getRiskLevels: () => {
    return axios.get(`${API_URL}/risk-levels`);
  },

  // Thêm lịch sử thay đổi trạng thái
  addRiskHistory: async (id, previousState, newState, changedBy, comment) => {
    const response = await axios.post(`${API_URL}/risk/${id}/history`, null, {
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

export default riskService;