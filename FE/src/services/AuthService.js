import axios from 'axios';

const API_URL = 'http://localhost:8080';

class AuthService {
    async login(code, password) {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                code,
                password
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        try {
            axios.post(`${API_URL}/api/auth/logout`);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    getCurrentToken() {
        return localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.getCurrentToken();
    }
}

export default new AuthService();