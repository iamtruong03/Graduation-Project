import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const documentService = {
  searchDocuments: (filter, page = 0, size = 10) => {
    return api.post('/api/documents/search', filter, {
      ...getAuthHeader(),
      params: { page, size }
    });
  }
};

export default documentService;
