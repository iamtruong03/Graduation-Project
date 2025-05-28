import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const categoryTypeService = {
  searchCategoryTypes: (filter, page = 0, size = 10) => {
    return api.post('/api/category-types/search', filter, {
      ...getAuthHeader(),
      params: { page, size }
    });
  }
};

export default categoryTypeService;
