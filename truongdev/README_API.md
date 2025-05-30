# 📚 API Documentation - Hệ thống Quản lý Dự án

## 🌟 Tổng quan
Hệ thống quản lý dự án cung cấp các API để quản lý:
- **Projects**: Quản lý dự án với workflow phê duyệt
- **Risks**: Quản lý rủi ro dự án
- **Tasks**: Quản lý công việc
- **Users**: Quản lý người dùng và phân quyền
- **Documents**: Quản lý tài liệu
- **Export**: Xuất dữ liệu ra Excel

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "code": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

### Authorization Header
Tất cả API yêu cầu header:
```http
Authorization: Bearer {accessToken}
```

## 📋 Business Logic & States

### Project States
| Mã | Trạng thái |
|-----|------------|
| `1` | Chờ duyệt (PENDING) |
| `2` | Đã duyệt (APPROVED) |
| `4` | Đang thực hiện (IN_PROGRESS) |
| `5` | Hoàn thành (COMPLETE) |
| `6` | Quá hạn (OVERDUE) |
| `3` | Từ chối (REJECTED) |

### Risk States
| Mã | Trạng thái |
|-----|------------|
| `0` | Identified |
| `1` | Analyzing |
| `2` | Monitored |
| `3` | Resolved |
| `4` | Closed |

### Task States
| Mã | Trạng thái |
|-----|------------|
| `0` | Chưa bắt đầu |
| `1` | Đang thực hiện |
| `2` | Tạm dừng |
| `3` | Hoàn thành |
| `4` | Đã hủy |

---

## 🏗️ Projects API

### 1. Tạo dự án mới
```http
POST /api/projects/create
Content-Type: application/json

{
  "code": "PRJ001",
  "name": "Dự án phát triển website",
  "description": "Mô tả dự án",
  "startDate": "2024-01-15",
  "endDate": "2024-06-15",
  "managerId": "1",
  "departmentId": 1
}
```

### 2. Gửi phê duyệt dự án
```http
POST /api/projects/{id}/submit-approval
Content-Type: application/json

[1, 2, 3]  // Array of approver IDs
```

### 3. Phê duyệt dự án
```http
POST /api/projects/{id}/approve?approvedBy=admin
```

### 4. Từ chối dự án
```http
POST /api/projects/{id}/reject?reason=Không đủ ngân sách
```

### 5. Lấy chi tiết dự án
```http
GET /api/projects/{id}/details
```

### 6. Cập nhật dự án
```http
PUT /api/projects/{id}/update
Content-Type: application/json

{
  "name": "Tên dự án mới",
  "description": "Mô tả cập nhật",
  "endDate": "2024-07-15"
}
```

### 7. Lấy lịch sử dự án
```http
GET /api/projects/{id}/history
```

### 8. Cập nhật trạng thái dự án
```http
PUT /api/projects/{id}/update-state?newState=4&changedBy=admin&comment=Bắt đầu thực hiện
```

### 9. Lấy dự án chờ phê duyệt
```http
GET /api/projects/pending-approval?page=0&size=10&search=website
```

### 10. Kiểm tra hoàn thành dự án
```http
POST /api/projects/{id}/check-completion
```

### 11. Tìm kiếm dự án
```http
POST /api/projects/search?departmentId=1&page=0&size=10
Content-Type: application/json

{
  "search": "website",
  "state": 4,
  "managerId": "1"
}
```

### 12. Export dự án ra Excel
```http
GET /api/projects/export?search=website&state=4
```

---

## ⚠️ Risks API

### 1. Tạo rủi ro mới
```http
POST /api/risks/create
Content-Type: application/json

{
  "code": "RISK001",
  "name": "Rủi ro về tiến độ",
  "projectId": 1,
  "riskTypeId": 1,
  "impactLevelId": 3,
  "reflectorId": "2",
  "reflectionDay": "2024-01-20",
  "description": "Dự án có nguy cơ chậm tiến độ"
}
```

### 2. Gửi phê duyệt rủi ro
```http
POST /api/risks/{id}/submit-approval
Content-Type: application/json

[1, 2]  // Array of approver IDs
```

### 3. Phê duyệt rủi ro
```http
POST /api/risks/{id}/approve?approvedBy=admin
```

### 4. Từ chối rủi ro
```http
POST /api/risks/{id}/reject?reason=Không có cơ sở
```

### 5. Lấy chi tiết rủi ro
```http
GET /api/risks/{id}/details
```

### 6. Cập nhật rủi ro
```http
PUT /api/risks/{id}/update
Content-Type: application/json

{
  "name": "Rủi ro về ngân sách",
  "description": "Cập nhật mô tả rủi ro"
}
```

### 7. Lấy lịch sử rủi ro
```http
GET /api/risks/{id}/history
```

### 8. Lấy rủi ro chờ phê duyệt
```http
GET /api/risks/pending-approval?page=0&size=10
```

### 9. Tìm kiếm rủi ro
```http
POST /api/risks/search?departmentId=1&page=0&size=10
Content-Type: application/json

{
  "search": "tiến độ",
  "state": 1,
  "projectId": 1
}
```

### 10. Export rủi ro ra Excel
```http
GET /api/risks/export?search=tiến độ&state=1
```

---

## ✅ Tasks API

### 1. Tạo công việc mới
```http
POST /api/tasks/create
Content-Type: application/json

{
  "code": "TASK001",
  "name": "Thiết kế giao diện",
  "projectId": 1,
  "departmentId": 1,
  "priorityId": 2,
  "startDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "assigneeId": "3",
  "description": "Thiết kế giao diện website"
}
```

### 2. Gửi phê duyệt công việc
```http
POST /api/tasks/{id}/submit-approval
Content-Type: application/json

[1, 2]  // Array of approver IDs
```

### 3. Phê duyệt công việc
```http
POST /api/tasks/{id}/approve?approvedBy=admin
```

### 4. Từ chối công việc
```http
POST /api/tasks/{id}/reject?reason=Không đủ tài nguyên
```

### 5. Lấy chi tiết công việc
```http
GET /api/tasks/{id}/details
```

### 6. Cập nhật công việc
```http
PUT /api/tasks/{id}/update
Content-Type: application/json

{
  "name": "Thiết kế và phát triển giao diện",
  "dueDate": "2024-03-15",
  "description": "Cập nhật mô tả công việc"
}
```

### 7. Lấy lịch sử công việc
```http
GET /api/tasks/{id}/history
```

### 8. Lấy công việc chờ phê duyệt
```http
GET /api/tasks/pending-approval?page=0&size=10
```

### 9. Tìm kiếm công việc
```http
POST /api/tasks/search?departmentId=1&page=0&size=10
Content-Type: application/json

{
  "search": "thiết kế",
  "state": 1,
  "projectId": 1,
  "assigneeId": "3"
}
```

### 10. Export công việc ra Excel
```http
GET /api/tasks/export?search=thiết kế&assigneeId=3
```

---

## 👥 Users API

### 1. Lấy thông tin người dùng hiện tại
```http
GET /user/current-user
```

### 2. Lấy danh sách người dùng
```http
GET /user/list
```

### 3. Lấy người dùng theo ID
```http
GET /user/{id}
```

### 4. Tạo người dùng mới
```http
POST /user
Content-Type: application/json

{
  "code": "user001",
  "name": "Nguyễn Văn A",
  "email": "user001@company.com",
  "departmentId": 1,
  "positionId": 2,
  "role": "2"
}
```

### 5. Cập nhật người dùng
```http
PUT /user/{id}
Content-Type: application/json

{
  "name": "Nguyễn Văn A Updated",
  "email": "updated@company.com"
}
```

### 6. Xóa người dùng
```http
DELETE /user/{id}
```

### 7. Đổi mật khẩu
```http
PUT /user/update-password
Content-Type: application/json

{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

### 8. Tìm kiếm người dùng
```http
POST /user/search?page=0&size=10
Content-Type: application/json

{
  "search": "Nguyễn",
  "departmentId": 1,
  "positionId": 2
}
```

### 9. Lấy người dùng cùng phòng ban
```http
GET /user/list-user-dep
```

### 10. Lấy người dùng phòng ban con
```http
GET /user/list-user-child-dep
```

### 11. Lấy người dùng phòng ban cha
```http
GET /user/list-user-parent-dep
```

### 12. Lấy trưởng phòng các phòng ban con
```http
GET /user/list-head-child-dep
```

---

## 📄 Documents API

### 1. Upload tài liệu
```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: [FILE]
projectId: 1
departmentId: 1
description: "Tài liệu thiết kế"
```

### 2. Download tài liệu
```http
GET /api/documents/{id}/download
```

### 3. Lấy chi tiết tài liệu
```http
GET /api/documents/{id}/details
```

### 4. Cập nhật tài liệu
```http
PUT /api/documents/{id}/update
Content-Type: application/json

{
  "description": "Tài liệu thiết kế cập nhật",
  "projectId": 2
}
```

### 5. Xóa tài liệu
```http
DELETE /api/documents/{id}
```

### 6. Tìm kiếm tài liệu
```http
POST /api/documents/search?departmentId=1&page=0&size=10
Content-Type: application/json

{
  "search": "thiết kế",
  "projectId": 1
}
```

---

## 📊 Export APIs

### 1. Export Projects
```http
GET /api/projects/export?search=website&state=4
Response: DanhSachDuAn_20241215_143022.xlsx
```

### 2. Export Risks  
```http
GET /api/risks/export?search=security&state=1
Response: DanhSachRuiRo_20241215_143022.xlsx
```

### 3. Export Tasks
```http
GET /api/tasks/export?assigneeId=3&state=1
Response: DanhSachCongViec_20241215_143022.xlsx
```

**Note:** `did` (Department ID) và `uid` (User ID) được tự động extract từ JWT token, không cần truyền trong URL.

---

## 📱 Response Format

### Success Response
```json
{
  "code": 200,
  "message": "Success", 
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "code": 400,
  "message": "Error message",
  "data": null
}
```

### Paginated Response
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "content": [...],
    "totalElements": 100,
    "totalPages": 10,
    "size": 10,
    "number": 0,
    "first": true,
    "last": false
  }
}
```

---

## ⚡ HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## 🔒 Access Control

### Admin Users (1)
- Có quyền truy cập tất cả dữ liệu
- Có thể tạo/sửa/xóa tất cả entities
- Có thể phê duyệt tất cả requests

### Regular Users (2)
- Chỉ truy cập dữ liệu thuộc phòng ban mình và phòng ban con
- Có thể tạo entities trong phòng ban mình
- Chỉ phê duyệt entities được assign

### Department Access Rules
- **Same Department**: User có thể xem/tạo entities cùng phòng ban
- **Sub Department**: User có thể xem entities của phòng ban con
- **Parent Department**: Head có thể phê duyệt requests từ phòng ban con

---

## 🚀 Example Workflows

### 1. Project Creation & Approval Flow
```bash
# 1. Create project
POST /api/projects/create

# 2. Submit for approval  
POST /api/projects/{id}/submit-approval

# 3. Approve project
POST /api/projects/{id}/approve

# 4. Project auto moves to IN_PROGRESS
# 5. Complete all tasks

# 6. Check completion
POST /api/projects/{id}/check-completion
# Auto moves to COMPLETE/OVERDUE
```

### 2. Risk Management Flow
```bash
# 1. Create risk
POST /api/risks/create

# 2. Submit for approval
POST /api/risks/{id}/submit-approval  

# 3. Approve risk
POST /api/risks/{id}/approve

# 4. Monitor risk (state: MONITORED)
# 5. Resolve risk when done
```

### 3. Task Assignment Flow
```bash
# 1. Create task
POST /api/tasks/create

# 2. Submit for approval
POST /api/tasks/{id}/submit-approval

# 3. Approve task  
POST /api/tasks/{id}/approve

# 4. Task auto moves to IN_PROGRESS
# 5. Assignee completes task
# 6. Task moves to COMPLETE
```

---

## 📞 Support

Để hỗ trợ API, vui lòng liên hệ:
- **Email**: dev@company.com
- **Version**: 1.0.0
- **Base URL**: `http://localhost:8080`
- **Environment**: Development

---

## 📝 Notes

1. **Token Expiry**: Access tokens expire sau 1 giờ
2. **Rate Limiting**: Không áp dụng trong development
3. **File Upload**: Max size 10MB cho documents
4. **Date Format**: `yyyy-MM-dd` hoặc `yyyy-MM-dd'T'HH:mm:ss'Z'`
5. **Timezone**: Asia/Ho_Chi_Minh (UTC+7)
6. **Encoding**: UTF-8 cho tiếng Việt
        