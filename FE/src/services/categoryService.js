import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const categoryService = {
  searchCategories: (filter, page = 0, size = 10) => {
    return api.post('/api/categories/search', filter, {
      ...getAuthHeader(),
      params: { page, size }
    });
  }
};

export default categoryService;
