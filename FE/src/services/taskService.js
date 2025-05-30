import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const taskService = {
    getTaskById: async (id) => {
        const response = await api.get(`/api/tasks/${id}`, getAuthHeader());
        return response.data;
    },

    getTaskHistory: async (id) => {
        const response = await api.get(`/api/tasks/${id}/history`, getAuthHeader());
        return response.data;
    },

    updateTask: async (id, taskData) => {
        const response = await api.put(`/api/tasks/${id}`, taskData, getAuthHeader());
        return response.data;
    },

    searchTasks: (filter, page = 0, size = 10) => {
        return api.post('/api/tasks/search', filter, {
            ...getAuthHeader(),
            params: { page, size }
        });
    }
};

export default taskService; 