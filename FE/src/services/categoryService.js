import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const categoryService = {
  // Tạo mới danh mục
  createCategory: (data) => {
    return api.post('/api/categories', data, getAuthHeader());
  },

  // Lấy chi tiết danh mục theo ID
  getCategoryById: (id) => {
    return api.get(`/api/categories/${id}`, getAuthHeader());
  },

  // Lấy danh sách tất cả danh mục
  getAllCategories: () => {
    return api.get('/api/categories/list', getAuthHeader());
  },

  // Tìm kiếm danh mục
  searchCategories: (filter, page = 0, size = 10) => {
    return api.post('/api/categories/search', filter, {
      ...getAuthHeader(),
      params: { page, size }
    });
  },

  // Cập nhật danh mục
  updateCategory: (id, data) => {
    return api.put(`/api/categories/update/${id}`, data, getAuthHeader());
  },

  // Xóa danh mục
  deleteCategory: (id) => {
    return api.delete(`/api/categories/delete/${id}`, getAuthHeader());
  },

  // Thay đổi trạng thái danh mục
  changeStatus: (id) => {
    return api.post(`/api/categories/change-status/${id}`, {}, getAuthHeader());
  },

  // Lấy danh sách danh mục theo loại
  getCategoriesByType: (categoryTypeCode) => {
    return api.get(`/api/categories/get-by-category-type?categoryTypeCode=${categoryTypeCode}`, getAuthHeader());
  }
};

export default categoryService;
