import api from './api';

const riskService = {
  // Lấy danh sách rủi ro
  getAllRisks: () => {
    return api.get('/risks');
  },

  // Lấy chi tiết rủi ro
  getRiskById: (id) => {
    return api.get(`/risks/${id}`);
  },

  // Thêm rủi ro mới
  createRisk: (riskData) => {
    return api.post('/risks', riskData);
  },

  // Cập nhật thông tin rủi ro
  updateRisk: (id, riskData) => {
    return api.put(`/risks/${id}`, riskData);
  },

  // Xóa rủi ro
  deleteRisk: (id) => {
    return api.delete(`/risks/${id}`);
  },

  // Lấy danh sách loại rủi ro
  getRiskTypes: () => {
    return api.get('/risk-types');
  },

  // Lấy danh sách mức độ rủi ro
  getRiskLevels: () => {
    return api.get('/risk-levels');
  }
};

export default riskService;