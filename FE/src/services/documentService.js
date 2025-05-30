import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const documentService = {
  // Tìm kiếm tài liệu
  searchDocuments: (filter, page = 0, size = 10) => {
    return api.post('/api/documents/search', filter, {
      ...getAuthHeader(),
      params: { page, size }
    });
  },

  // Lấy thông tin chi tiết tài liệu theo ID
  getDocumentById: (id) => {
    return api.get(`/api/documents/${id}`, getAuthHeader());
  },

  // Cập nhật thông tin tài liệu
  updateDocument: (id, documentData) => {
    return api.put(`/api/documents/update/${id}`, documentData, {
      ...getAuthHeader(),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  // Xóa tài liệu
  deleteDocument: (id) => {
    return api.delete(`/api/documents/delete/${id}`, getAuthHeader());
  },

  // Upload tài liệu mới
  uploadDocument: (file, documentData) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Thêm các trường dữ liệu khác vào formData
    Object.keys(documentData).forEach(key => {
      if (documentData[key] !== null && documentData[key] !== undefined) {
        formData.append(key, documentData[key]);
      }
    });

    return api.post('/api/documents/upload', formData, {
      ...getAuthHeader(),
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Tải xuống tài liệu
  downloadDocument: (id) => {
    return api.get(`/api/documents/${id}/download`, {
      ...getAuthHeader(),
      responseType: 'blob',
      headers: {
        ...getAuthHeader().headers,
        'Accept': 'application/octet-stream'
      }
    });
  }
};

export default documentService;
