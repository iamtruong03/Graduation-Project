export const PROJECT_STATES = {
  1: 'Chờ duyệt',
  2: 'Đã duyệt',
  3: 'Từ chối',
  4: 'Đang thực hiện',
  5: 'Hoàn thành',
  6: 'Quá hạn'
};

export const PROJECT_TYPES = {
  1: 'Phát triển phần mềm',
  2: 'Mobile',
  3: 'Web'
};

// Risk States
export const RISK_STATES = {
  1: 'Mới ghi nhận',
  2: 'Đang phân tích', 
  3: 'Đang xử lý',
  4: 'Chờ xác nhận',
  5: 'Đã giải quyết',
  6: 'Đã đóng',
  7: 'Đã hủy'
};

// Risk Types (example - should match backend data)
export const RISK_TYPES = {
  1: 'Rủi ro vận hành',
  2: 'Rủi ro kỹ thuật',
  3: 'Rủi ro bảo mật',
  4: 'Rủi ro tài chính',
  5: 'Rủi ro nghiệp vụ'
};

// Risk Impact Levels
export const RISK_IMPACT_LEVELS = {
  1: 'Thấp',
  2: 'Trung bình',
  3: 'Cao',
  4: 'Rất cao'
};

// Risk Priority Levels  
export const RISK_PRIORITY_LEVELS = {
  1: 'Thấp',
  2: 'Trung bình', 
  3: 'Cao',
  4: 'Khẩn cấp'
};

// Task States
export const TASK_STATES = {
  1: 'Chờ duyệt',
  2: 'Đã duyệt', 
  3: 'Từ chối',
  4: 'Đang thực hiện',
  5: 'Hoàn thành',
  6: 'Quá hạn'
};

// Task Types
export const TASK_TYPES = {
  'project': 'Công việc dự án',
  'department': 'Công việc phòng ban'
};

// Task Priority Levels
export const TASK_PRIORITY_LEVELS = {
  1: 'Thấp',
  2: 'Trung bình',
  3: 'Cao'
};

// Category Types
export const CATEGORY_TYPES = {
  'task_type': 'Loại công việc',
  'department_type': 'Loại phòng ban',
  'risk_type': 'Loại rủi ro',
  'priority_level': 'Mức độ ưu tiên'
}; 