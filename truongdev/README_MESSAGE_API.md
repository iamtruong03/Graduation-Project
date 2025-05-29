# 📱 Message API Documentation - Hệ thống Chat Realtime

## 🔗 WebSocket Endpoints

### 1. **Kết nối WebSocket**
```
WS /ws
WS /chat
```

**SockJS Support**: ✅ Có hỗ trợ fallback cho browsers không support WebSocket

---

## 🚀 WebSocket Message Mapping

### 1. **Gửi tin nhắn realtime**
```
SEND TO: /app/chat.sendMessage
```

**Payload:**
```json
{
  "senderId": "user123",
  "receiverId": "user456", 
  "content": "Xin chào! Bạn có khỏe không?",
  "messageType": "TEXT",
  "departmentId": 1
}
```

**Response Channel:** `/queue/messages`

### 2. **Thông báo đang gõ**
```
SEND TO: /app/chat.typing
```

**Payload:**
```json
{
  "senderId": "user123",
  "receiverId": "user456",
  "action": "TYPING"
}
```

**Response Channel:** `/queue/typing`

### 3. **Đánh dấu đã đọc**
```
SEND TO: /app/chat.markAsRead
```

**Payload:**
```json
{
  "senderId": "user456",
  "receiverId": "user123"
}
```

**Response Channel:** `/queue/read-receipts`

### 4. **Trạng thái online/offline**
```
SEND TO: /app/chat.userStatus
```

**Payload:**
```json
{
  "senderId": "user123",
  "action": "ONLINE"
}
```

**Response Channel:** `/topic/user-status/{userId}`

### 5. **Tham gia chat**
```
SEND TO: /app/chat.addUser
```

**Payload:**
```json
{
  "senderId": "user123",
  "senderName": "Nguyễn Văn A"
}
```

**Response Channel:** `/topic/public`

---

## 🌐 REST API Endpoints

### 1. **Gửi tin nhắn**
```http
POST /api/messages/send
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "receiverId": "user456",
  "content": "Chào bạn!",
  "messageType": "TEXT"
}
```

**Response:**
```json
{
  "id": 1,
  "senderId": "user123",
  "receiverId": "user456",
  "content": "Chào bạn!",
  "timestamp": "2024-12-19T10:30:00",
  "isRead": false,
  "messageType": "TEXT",
  "departmentId": 1,
  "senderName": "Nguyễn Văn A",
  "receiverName": "Trần Thị B",
  "timeAgo": "Vừa xong",
  "chatRoomId": "user123_user456"
}
```

### 2. **Lấy cuộc trò chuyện**
```http
GET /api/messages/conversation/{otherUserId}?page=0&size=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "senderId": "user123",
      "receiverId": "user456",
      "content": "Chào bạn!",
      "timestamp": "2024-12-19T10:30:00",
      "isRead": true,
      "messageType": "TEXT",
      "senderName": "Nguyễn Văn A",
      "timeAgo": "5 phút trước",
      "chatRoomId": "user123_user456"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

### 3. **Lấy cuộc trò chuyện gần nhất**
```http
GET /api/messages/recent
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "senderId": "user456",
    "receiverId": "user123",
    "content": "Tin nhắn mới nhất...",
    "timestamp": "2024-12-19T10:30:00",
    "isRead": false,
    "senderName": "Trần Thị B",
    "timeAgo": "2 phút trước",
    "chatRoomId": "user123_user456"
  }
]
```

### 4. **Lấy tin nhắn chưa đọc**
```http
GET /api/messages/unread
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 2,
    "senderId": "user456",
    "content": "Bạn có rảnh không?",
    "timestamp": "2024-12-19T10:25:00",
    "isRead": false,
    "senderName": "Trần Thị B",
    "timeAgo": "5 phút trước"
  }
]
```

### 5. **Đếm tin nhắn chưa đọc**
```http
GET /api/messages/unread/count
Authorization: Bearer {token}
```

**Response:**
```json
5
```

### 6. **Đánh dấu đã đọc**
```http
PUT /api/messages/mark-read/{otherUserId}
Authorization: Bearer {token}
```

**Response:**
```json
"Đã đánh dấu tin nhắn là đã đọc"
```

### 7. **Xóa tin nhắn**
```http
DELETE /api/messages/{messageId}
Authorization: Bearer {token}
```

**Response:**
```json
"Đã xóa tin nhắn thành công"
```

### 8. **Lấy tin nhắn theo phòng ban (Admin)**
```http
GET /api/messages/department/{departmentId}?page=0&size=20
Authorization: Bearer {token}
```

### 9. **Tạo Chat Room ID**
```http
GET /api/messages/room/{otherUserId}
Authorization: Bearer {token}
```

**Response:**
```json
"user123_user456"
```

---

## 📱 Frontend Integration Guide

### 1. **Kết nối WebSocket**
```javascript
// Sử dụng SockJS và STOMP
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);
    
    // Subscribe to personal messages
    stompClient.subscribe('/user/queue/messages', function (message) {
        const messageData = JSON.parse(message.body);
        handleNewMessage(messageData);
    });
    
    // Subscribe to typing notifications
    stompClient.subscribe('/user/queue/typing', function (message) {
        const typingData = JSON.parse(message.body);
        showTypingIndicator(typingData);
    });
    
    // Subscribe to read receipts
    stompClient.subscribe('/user/queue/read-receipts', function (message) {
        const readData = JSON.parse(message.body);
        updateMessageStatus(readData);
    });
});
```

### 2. **Gửi tin nhắn**
```javascript
function sendMessage(receiverId, content) {
    const message = {
        receiverId: receiverId,
        content: content,
        messageType: 'TEXT'
    };
    
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
}
```

### 3. **Thông báo đang gõ**
```javascript
function sendTypingNotification(receiverId) {
    const typing = {
        receiverId: receiverId,
        action: 'TYPING'
    };
    
    stompClient.send("/app/chat.typing", {}, JSON.stringify(typing));
}
```

### 4. **Đánh dấu đã đọc**
```javascript
function markAsRead(senderId) {
    const readData = {
        senderId: senderId
    };
    
    stompClient.send("/app/chat.markAsRead", {}, JSON.stringify(readData));
}
```

---

## 🔒 Authentication & Authorization

### **JWT Token Required**
- Tất cả API endpoints yêu cầu JWT token trong header `Authorization: Bearer {token}`
- WebSocket connection cũng cần authentication thông qua token

### **Permissions**
- **User**: Chỉ có thể chat với users trong cùng phòng ban hoặc phòng ban con
- **Admin**: Có thể xem tất cả tin nhắn và quản lý theo phòng ban
- **Department Head**: Có thể xem tin nhắn của phòng ban mình và phòng ban con

---

## 📊 Message Types

| Type | Description | Example |
|------|-------------|---------|
| `TEXT` | Tin nhắn văn bản thông thường | "Xin chào!" |
| `IMAGE` | Tin nhắn hình ảnh | File upload |
| `FILE` | Tin nhắn file đính kèm | Document upload |
| `SYSTEM` | Tin nhắn hệ thống | "User đã tham gia chat" |

---

## 🎯 WebSocket Actions

| Action | Description | Usage |
|--------|-------------|-------|
| `SEND` | Gửi tin nhắn mới | Chat message |
| `TYPING` | Đang gõ tin nhắn | Typing indicator |
| `READ` | Đánh dấu đã đọc | Read receipt |
| `ONLINE` | User online | Status update |
| `OFFLINE` | User offline | Status update |
| `JOIN` | Tham gia chat | User join notification |
| `ERROR` | Thông báo lỗi | Error handling |

---

## ⚡ Realtime Features

### 1. **Instant Messaging**
- Tin nhắn được gửi và nhận ngay lập tức qua WebSocket
- Không cần refresh trang

### 2. **Typing Indicators**
- Hiển thị khi người khác đang gõ tin nhắn
- Tự động ẩn sau 3 giây

### 3. **Read Receipts**
- Hiển thị trạng thái tin nhắn đã đọc/chưa đọc
- Cập nhật realtime

### 4. **Online Status**
- Hiển thị trạng thái online/offline của users
- Cập nhật khi connect/disconnect

### 5. **Unread Counters**
- Đếm số tin nhắn chưa đọc realtime
- Badge notifications

---

## 🛡️ Security Features

### 1. **Department-based Access Control**
- Users chỉ có thể chat với users trong phòng ban được phép
- Tin nhắn được phân quyền theo phòng ban

### 2. **Message Deletion**
- Chỉ người gửi mới có quyền xóa tin nhắn của mình
- Soft delete với audit trail

### 3. **Input Validation**
- Validate nội dung tin nhắn
- XSS protection
- Message length limits

---

## 📈 Performance Optimization

### 1. **Database Indexes**
- Indexes trên sender_id, receiver_id
- Indexes trên timestamp và is_read
- Composite indexes để tối ưu queries

### 2. **Pagination**
- Phân trang cho conversation history
- Lazy loading tin nhắn cũ

### 3. **Caching**
- Cache recent conversations
- Cache unread message counts

---

## 🔧 Error Handling

### **Common Error Codes**
- `400` - Invalid request data
- `401` - Unauthorized
- `403` - Forbidden (không có quyền chat với user này)
- `404` - Message not found
- `500` - Server error

### **WebSocket Error Handling**
- Error messages được gửi qua `/queue/errors`
- Frontend cần handle reconnection
- Graceful fallback khi WebSocket fails

---

## 📝 Usage Examples

### **Basic Chat Flow**
1. User connects to WebSocket
2. Subscribe to personal message channels
3. Load recent conversations via REST API
4. Send/receive messages via WebSocket
5. Mark messages as read
6. Handle typing indicators

### **Group Chat Simulation**
- Sử dụng multiple 1-on-1 conversations
- Broadcast messages to multiple users
- Maintain separate chat rooms

---

## 🎨 UI/UX Recommendations

### 1. **Message Bubbles**
- Tin nhắn gửi: Màu xanh, căn phải
- Tin nhắn nhận: Màu xám, căn trái

### 2. **Status Indicators**
- ✓ Đã gửi
- ✓✓ Đã đọc
- 🟢 Online
- ⚫ Offline

### 3. **Typing Indicator**
- "Đang gõ..." với animation dots
- Hiển thị avatar của người đang gõ

### 4. **Timestamps**
- "Vừa xong", "5 phút trước", "1 giờ trước"
- Full timestamp khi hover

---

Hệ thống Message API này cung cấp đầy đủ tính năng cho một ứng dụng chat realtime hiện đại với WebSocket integration! 🚀 