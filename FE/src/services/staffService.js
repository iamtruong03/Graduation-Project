import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const staffService = {
  // Lấy danh sách tất cả nhân viên
  getAllStaff: () => {
    return api.get('/user/list', getAuthHeader());
  },

  // Lấy thông tin chi tiết nhân viên
  getStaffById: (id) => {
    return api.get(`/user/${id}`, getAuthHeader());
  },

  // Thêm nhân viên mới
  createStaff: (staffData) => {
    return api.post('/user', staffData, getAuthHeader());
  },

  // Cập nhật thông tin nhân viên
  updateStaff: (id, staffData) => {
    return api.put(`/user/${id}`, staffData, getAuthHeader());
  },

  // Xóa nhân viên
  deleteStaff: (id) => {
    return api.delete(`/user/${id}`, getAuthHeader());
  },

  // Lấy danh sách nhân viên theo trạng thái
  getStaffByStatus: (status) => {
    return api.get('/user', {
      params: { status },
      ...getAuthHeader()
    });
  },

  // Tìm kiếm nhân viên
  searchStaff: (filter) => {
    return api.post('/user/search', {
      search: filter.search || '',
      departmentId: filter.departmentId || null,
      positionId: filter.positionId || null,
      page: filter.page || 0,
      size: filter.size || 10,
      sort: filter.sort || ['id,desc']
    }, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'application/json'
      }
    });
  },
  // Lấy danh sách phòng ban
  getDepartments: () => {
    return api.get('/department/list', {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'application/json'
      }
    });
  },
};

export default staffService;
