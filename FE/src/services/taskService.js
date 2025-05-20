import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const taskService = {
    getTaskById: async (id) => {
        const response = await axios.get(`${API_URL}/tasks/${id}`);
        return response.data;
    },

    getTaskHistory: async (id) => {
        const response = await axios.get(`${API_URL}/tasks/${id}/history`);
        return response.data;
    },

    updateTask: async (id, taskData) => {
        const response = await axios.put(`${API_URL}/tasks/${id}`, taskData);
        return response.data;
    }
};

export default taskService; 