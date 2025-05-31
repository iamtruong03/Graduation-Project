import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const taskService = {
    // Lấy chi tiết công việc
    getTaskById: async (id) => {
        const response = await api.get(`/api/tasks/${id}`, getAuthHeader());
        return response;
    },

    // Lấy lịch sử công việc
    getTaskHistory: async (id) => {
        const response = await api.get(`/api/tasks/${id}/history`, getAuthHeader());
        return response;
    },

    // Tạo công việc mới
    createTask: async (taskData) => {
        const response = await api.post('/api/tasks/create', taskData, getAuthHeader());
        return response;
    },

    // Cập nhật công việc
    updateTask: async (id, taskData) => {
        const response = await api.put(`/api/tasks/${id}/update`, taskData, getAuthHeader());
        return response;
    },

    // Tìm kiếm công việc
    searchTasks: (filter, page = 0, size = 10) => {
        return api.post('/api/tasks/search', filter, {
            ...getAuthHeader(),
            params: { 
                page: Math.max(0, page), 
                size: Math.max(1, size) 
            }
        });
    },

    // Phê duyệt công việc
    approveTask: async (id) => {
        const response = await api.post(`/api/tasks/${id}/approve`, null, {
            ...getAuthHeader()
        });
        return response;
    },

    // Từ chối công việc
    rejectTask: async (id, reason) => {
        const response = await api.post(`/api/tasks/${id}/reject`, null, {
            ...getAuthHeader(),
            params: { reason }
        });
        return response;
    },

    // Lấy danh sách công việc chờ duyệt
    getPendingApprovalTasks: (filter, page = 0, size = 10) => {
        return api.get('/api/tasks/pending-approval', {
            ...getAuthHeader(),
            params: { ...filter, page, size }
        });
    },

    // Xuất dữ liệu công việc
    exportTasks: (filter) => {
        return api.get('/api/tasks/export', {
            ...getAuthHeader(),
            responseType: 'blob',
            params: filter,
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });
    },

    // Xóa công việc
    deleteTask: (id) => {
        return api.delete(`/api/tasks/delete/${id}`, getAuthHeader());
    },

    // Thay đổi trạng thái
    changeStatus: (id) => {
        return api.post(`/api/tasks/change-status/${id}`, null, getAuthHeader());
    },

    // Lấy danh sách task theo projectId
    getTasksByProjectId: (projectId) => {
        return api.get(`/api/tasks/project/${projectId}`, getAuthHeader());
    },

    // Lấy danh sách task theo riskId
    getTasksByRiskId: (riskId) => {
        return api.get(`/api/tasks/risk/${riskId}`, getAuthHeader());
    }
};

export default taskService; 