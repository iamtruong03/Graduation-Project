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
  downloadDocument: async (id) => {
    try {
      // Lấy thông tin tài liệu trước
      const docInfo = await api.get(`/api/documents/${id}`, getAuthHeader());
      const document = docInfo.data;
      
      if (!document) {
        throw new Error('Không tìm thấy thông tin tài liệu');
      }

      // Tải file
      const response = await api.get(`/api/documents/download/${id}`, {
        ...getAuthHeader(),
        responseType: 'blob'
      });

      if (!response || !response.data) {
        throw new Error('Không nhận được dữ liệu từ server');
      }

      // Kiểm tra nếu response là error message (thường có kích thước nhỏ)
      if (response.data instanceof Blob && response.data.size < 1000) {
        const reader = new FileReader();
        const text = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsText(response.data);
        });
        try {
          const error = JSON.parse(text);
          if (error.error) {
            throw new Error(error.error);
          }
        } catch (e) {
          // Nếu không parse được JSON, có thể là file thật
          console.log('Not an error message, proceeding with download');
        }
      }

      // Tạo URL từ blob
      const blob = new Blob([response.data], { type: document.mimeType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      // Tạo link tải xuống
      const link = document.createElement('a');
      link.href = url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      
      // Dọn dẹp
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return response;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }
};

export default documentService;
