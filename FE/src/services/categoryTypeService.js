import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const categoryTypeService = {
  // Tạo mới loại danh mục
  createCategoryType: (data) => {
    return api.post('/api/category-types', data, getAuthHeader());
  },

  // Lấy chi tiết loại danh mục theo ID
  getCategoryTypeById: (id) => {
    return api.get(`/api/category-types/${id}`, getAuthHeader());
  },

  // Lấy danh sách tất cả loại danh mục
  getAllCategoryTypes: () => {
    return api.get('/api/category-types/list', getAuthHeader());
  },

  // Tìm kiếm loại danh mục
  searchCategoryTypes: (filter, page = 0, size = 10) => {
    return api.post('/api/category-types/search', filter, {
      ...getAuthHeader(),
      params: { page, size }
    });
  },

  // Cập nhật loại danh mục
  updateCategoryType: (id, data) => {
    return api.put(`/api/category-types/update/${id}`, data, getAuthHeader());
  },

  // Xóa loại danh mục
  deleteCategoryType: (id) => {
    return api.delete(`/api/category-types/delete/${id}`, getAuthHeader());
  },

  // Thay đổi trạng thái loại danh mục
  changeStatus: (id) => {
    return api.post(`/api/category-types/change-status/${id}`, {}, getAuthHeader());
  }
};

export default categoryTypeService;
