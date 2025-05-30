# Hướng Dẫn Setup Chat Realtime

## 📋 Tổng Quan
Hệ thống chat realtime sử dụng WebSocket với Spring Boot STOMP và React frontend, cho phép:
- Gửi tin nhắn thời gian thực
- Hiển thị trạng thái typing
- Xác nhận đã đọc tin nhắn
- Hiển thị trạng thái online/offline
- Đếm tin nhắn chưa đọc

## 🚀 Cài Đặt Dependencies

### Frontend Dependencies
```bash
npm install @stomp/stompjs sockjs-client @mui/material @mui/icons-material date-fns
```

### Backend Dependencies (đã được thêm trong pom.xml)
- spring-boot-starter-websocket
- spring-security (cho JWT authentication)

## ⚙️ Cấu Hình

### 1. Cấu Hình Backend WebSocket

File `WebSocketConfig.java` đã được tạo với:
- STOMP endpoint: `/ws`
- Allowed origins: `http://localhost:3000`
- JWT authentication cho WebSocket connections

### 2. Cấu Hình Frontend Environment

Tạo file `.env` trong thư mục FE:
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
```

### 3. JWT Token Setup

Đảm bảo token được lưu trong localStorage với key `token`:
```javascript
localStorage.setItem('token', 'your-jwt-token');
localStorage.setItem('code', 'user-id');
```

## 🎯 Cách Sử Dụng

### 1. Khởi Tạo Chat Service

```javascript
import { chatService } from '../services/chatService';

// Kết nối WebSocket
await chatService.connect();

// Join chat
chatService.joinChat();
chatService.sendUserStatus('ONLINE');
```

### 2. Gửi Tin Nhắn

```javascript
// Gửi tin nhắn
await chatService.sendMessage(receiverId, content, 'TEXT');

// Gửi thông báo typing
chatService.sendTypingNotification(receiverId);

// Đánh dấu đã đọc
chatService.markMessagesAsRead(senderId);
```

### 3. Lắng Nghe Events

```javascript
// Lắng nghe tin nhắn mới
const unsubscribe = chatService.onMessage((message) => {
  console.log('New message:', message);
});

// Lắng nghe typing notifications
chatService.onTyping((typingData) => {
  console.log('User typing:', typingData);
});

// Lắng nghe read receipts
chatService.onReadReceipt((readData) => {
  console.log('Message read:', readData);
});

// Cleanup
unsubscribe();
```

### 4. Load Conversation History

```javascript
// Lấy cuộc trò chuyện với phân trang
const conversation = await chatService.getConversation(otherUserId, 0, 20);

// Lấy cuộc trò chuyện gần nhất
const recent = await chatService.getRecentConversations();

// Đếm tin nhắn chưa đọc
const count = await chatService.countUnreadMessages();
```

## 🔧 API Endpoints

### REST API Endpoints
- `POST /api/messages/send-ws` - Gửi tin nhắn qua REST
- `GET /api/messages/conversation/{otherUserId}` - Lấy cuộc trò chuyện
- `GET /api/messages/recent-conversations` - Cuộc trò chuyện gần nhất
- `GET /api/messages/unread-ws` - Tin nhắn chưa đọc
- `GET /api/messages/unread/count` - Đếm tin nhắn chưa đọc
- `PUT /api/messages/mark-read/{otherUserId}` - Đánh dấu đã đọc
- `DELETE /api/messages/{messageId}` - Xóa tin nhắn
- `GET /api/messages/room/{otherUserId}` - Lấy chat room ID

### WebSocket Endpoints
- `/app/chat.sendMessage` - Gửi tin nhắn
- `/app/chat.typing` - Thông báo typing
- `/app/chat.markAsRead` - Đánh dấu đã đọc
- `/app/chat.userStatus` - Cập nhật trạng thái user
- `/app/chat.addUser` - User join chat

### WebSocket Subscriptions
- `/user/queue/messages` - Nhận tin nhắn cá nhân
- `/user/queue/typing` - Nhận thông báo typing
- `/user/queue/read-receipts` - Nhận xác nhận đã đọc
- `/user/queue/errors` - Nhận thông báo lỗi
- `/topic/public` - Tin nhắn công khai (user join/leave)

## 🎨 UI Components

### Chat Component Structure
```
Chat.jsx (Main container)
├── ChatWindow.jsx (Chat interface)
    ├── User List (Left panel)
    ├── MessageList.jsx (Message display)
    └── MessageInput.jsx (Message input)
```

### Features Included
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online/offline status
- ✅ Unread message counts
- ✅ Message history with pagination
- ✅ User search
- ✅ Connection status indicator
- ✅ Auto-scroll to new messages
- ✅ Responsive design

## 🐛 Troubleshooting

### WebSocket Connection Issues
1. Kiểm tra CORS configuration
2. Đảm bảo JWT token hợp lệ
3. Kiểm tra network firewall/proxy

### Message Not Displaying
1. Kiểm tra WebSocket subscription
2. Verify message format
3. Check console for errors

### Typing Indicators Not Working
1. Đảm bảo user IDs đúng format (string)
2. Kiểm tra timeout cleanup

## 📱 Mobile Responsiveness

UI được thiết kế responsive với:
- Grid layout cho desktop
- Stack layout cho mobile
- Touch-friendly buttons
- Optimized message bubbles

## 🔐 Security Features

- JWT authentication cho WebSocket connections
- CSRF protection
- Input validation
- XSS protection
- Rate limiting (có thể implement)

## 🚀 Production Deployment

### Backend
```yaml
# application-prod.yml
spring:
  websocket:
    allowed-origins: "https://yourdomain.com"
```

### Frontend
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com/ws
```

## 📊 Performance Optimization

- Connection pooling
- Message pagination
- Lazy loading user info
- Debounced typing notifications
- Cleanup old subscriptions

## 🤝 Contributing

1. Follow coding standards
2. Add proper error handling
3. Include unit tests
4. Update documentation
5. Test WebSocket functionality

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra browser console
2. Verify network tab for WebSocket connections
3. Check backend logs
4. Test with different browsers 