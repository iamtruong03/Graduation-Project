# API Export Excel Documentation

## Tổng quan
Hệ thống cung cấp 3 API endpoints để export dữ liệu ra file Excel:
- Export danh sách Dự án
- Export danh sách Rủi ro  
- Export danh sách Công việc

## Endpoints

### 1. Export Dự án
```
GET /api/projects/export?[filter_params]
```

**Parameters:**
- `search` (optional): Từ khóa tìm kiếm theo mã hoặc tên dự án
- `state` (optional): Trạng thái dự án (1=Chờ duyệt, 2=Đã duyệt, 4=Đang thực hiện, 5=Hoàn thành, 6=Quá hạn)
- `managerId` (optional): ID người quản lý

**Authentication:**
- `did` (Department ID): Tự động extract từ JWT token
- `uid` (User ID): Tự động extract từ JWT token

**Response:** File Excel với tên `DanhSachDuAn_yyyyMMdd_HHmmss.xlsx`

**Columns:**
- STT, Mã dự án, Tên dự án, Trạng thái, Ngày bắt đầu, Ngày kết thúc, Người quản lý, Phòng ban, Mô tả

### 2. Export Rủi ro
```
GET /api/risks/export?[filter_params]
```

**Parameters:**
- `search` (optional): Từ khóa tìm kiếm theo mã hoặc tên rủi ro
- `state` (optional): Trạng thái rủi ro
- `projectId` (optional): ID dự án liên quan
- `reflectorId` (optional): ID người phản ánh

**Authentication:**
- `did` (Department ID): Tự động extract từ JWT token
- `uid` (User ID): Tự động extract từ JWT token

**Response:** File Excel với tên `DanhSachRuiRo_yyyyMMdd_HHmmss.xlsx`

**Columns:**
- STT, Mã rủi ro, Tên rủi ro, Trạng thái, Loại rủi ro, Mức độ tác động, Ngày phản ánh, Người phản ánh, Dự án, Mô tả

### 3. Export Công việc
```
GET /api/tasks/export?[filter_params]
```

**Parameters:**
- `search` (optional): Từ khóa tìm kiếm theo mã hoặc tên công việc
- `state` (optional): Trạng thái công việc
- `projectId` (optional): ID dự án liên quan
- `assigneeId` (optional): ID người được giao
- `priorityId` (optional): Độ ưu tiên

**Authentication:**
- `did` (Department ID): Tự động extract từ JWT token
- `uid` (User ID): Tự động extract từ JWT token

**Response:** File Excel với tên `DanhSachCongViec_yyyyMMdd_HHmmss.xlsx`

**Columns:**
- STT, Mã công việc, Tên công việc, Trạng thái, Độ ưu tiên, Ngày bắt đầu, Ngày hết hạn, Ngày hoàn thành, Người được giao, Dự án

## Authorization
Tất cả API yêu cầu:
- Header: `Authorization: Bearer {token}`
- Header: `Content-Type: application/json`

## Access Control
- **Admin**: Có thể export tất cả dữ liệu
- **User thường**: Chỉ export dữ liệu thuộc phòng ban và phòng ban con của mình

## Format Excel
- **Header**: Background màu xanh đậm, font trắng, in đậm, canh giữa
- **Data**: Border mỏng, canh trái cho text
- **Date**: Format dd/MM/yyyy
- **Auto-sizing**: Tự động điều chỉnh độ rộng cột

## Error Handling
- **400 Bad Request**: Lỗi tham số hoặc không có quyền truy cập
- **401 Unauthorized**: Token không hợp lệ
- **500 Internal Server Error**: Lỗi tạo file Excel

## Example Usage

### JavaScript/jQuery
```javascript
// Export dự án
function exportProjects() {
    window.open(`/api/projects/export?search=test`, '_blank');
}

// Export với fetch API
async function exportRisks() {
    const response = await fetch('/api/risks/export', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'risks.xlsx';
        a.click();
    }
}
```

### curl
```bash
# Export dự án
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -o "projects.xlsx" \
     "http://localhost:8080/api/projects/export"

# Export rủi ro với filter
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -o "risks.xlsx" \
     "http://localhost:8080/api/risks/export?state=1&search=security"
```

## Notes
- File Excel được tạo trong memory và trả về trực tiếp, không lưu trên server
- Tên file tự động thêm timestamp để tránh trùng lặp
- Tất cả dữ liệu được export cùng lúc (không phân trang)
- Encoding UTF-8 để hỗ trợ tiếng Việt 