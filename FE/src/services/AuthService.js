import axios from 'axios';

const API_URL = 'http://localhost:8080';

class AuthService {
    async login(code, password) {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                code,
                password
            });
            if (response.data.data) {
                const { accessToken, refreshToken } = response.data.data;
                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
            throw new Error(errorMessage);
        }
    }

    async logout() {
        try {
            const token = this.getCurrentToken();
            await axios.post(`${API_URL}/auth/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            delete axios.defaults.headers.common['Authorization'];
            return { success: true, message: 'Đăng xuất thành công' };
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            delete axios.defaults.headers.common['Authorization'];
            return { success: false, message: 'Đăng xuất thất bại' };
        }
    }

    getCurrentToken() {
        return localStorage.getItem('token');
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    isAuthenticated() {
        return !!this.getCurrentToken();
    }

    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('Không tìm thấy refresh token');
            }

            const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                refreshToken
            });

            if (response.data.data) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                return accessToken;
            }
            throw new Error('Không thể làm mới token');
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            throw new Error(error.response?.data?.message || 'Phiên đăng nhập đã hết hạn');
        }
    }

    async register(userData) {
        try {
            const endpoint = `${API_URL}/user/register/first-admin`;
            userData = { ...userData, role: 'ADMIN' };
            
            const response = await axios.post(endpoint, userData);
            return {
                success: true,
                message: 'Đăng ký tài khoản admin đầu tiên thành công',
                data: response.data
            };
        } catch (error) {
            let errorMessage = 'Đăng ký thất bại';
            
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = 'Tài khoản đã tồn tại trong hệ thống';
                        break;
                    case 403:
                        errorMessage = 'Bạn không có quyền thực hiện thao tác này';
                        break;
                    case 422:
                        errorMessage = 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại';
                        break;
                    default:
                        errorMessage = error.response.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký';
                }
            }
            
            throw new Error(errorMessage);
        }
    }

    
}

export default new AuthService();