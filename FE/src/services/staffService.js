import api from './api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const staffService = {
  // Lấy danh sách tất cả nhân viên theo phân quyền
  getListUser: () => {
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
    return api.put(`/user/update/${id}`, staffData, getAuthHeader());
  },

  // Xóa nhân viên
  deleteStaff: (id) => {
    return api.delete(`/user/delete/${id}`, getAuthHeader());
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

  // Lấy danh sách user con cháu
  listUserChildDep: () => {
    return api.get('/user/list-user-child-dep', getAuthHeader());
  },

  // Lấy danh sách user theo phòng ban
  listUserByDep: (departmentId) => {
    return api.get('/user/list-user-by-dep', {
      ...getAuthHeader(),
      params: { departmentId }
    });
  },

  // Lấy thông tin user theo ID
  getUserById: (id) => {
    return api.get(`/user/${id}`, getAuthHeader());
  },

};

export default staffService;
