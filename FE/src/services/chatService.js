import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from './api';

class ChatService {
  constructor() {
    this.stompClient = null;
    this.messageHandlers = new Set();
    this.onlineUsersHandlers = new Set();
    this.departmentMessageHandlers = new Set();
    this.companyMessageHandlers = new Set();
  }

  connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);
    this.stompClient.reconnect_delay = 5000;

    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      if (!token) {
        reject(new Error('Token không tồn tại'));
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const onConnect = () => {
        console.log('WebSocket kết nối thành công');
        this.subscribeToTopics();
        resolve();
      };

      const onError = (error) => {
        console.error('Lỗi kết nối WebSocket:', error);
        reject(error);
        // Thử kết nối lại sau 5 giây
        setTimeout(() => this.connect(), 5000);
      };

      this.stompClient.connect(headers, onConnect, onError);
    });
  }

  subscribeToTopics() {
    // Đăng ký nhận tin nhắn cá nhân
    this.stompClient.subscribe('/user/queue/messages', (message) => {
      const messageData = JSON.parse(message.body);
      this.messageHandlers.forEach(handler => handler(messageData));
    });

    // Đăng ký nhận tin nhắn phòng ban
    const departmentId = localStorage.getItem('departmentId');
    if (departmentId) {
      this.stompClient.subscribe(`/topic/department/${departmentId}`, (message) => {
        const messageData = JSON.parse(message.body);
        this.departmentMessageHandlers.forEach(handler => handler(messageData));
      });
    }

    // Đăng ký nhận tin nhắn toàn công ty
    const cid = localStorage.getItem('cid');
    if (cid) {
      this.stompClient.subscribe(`/topic/company/${cid}`, (message) => {
        const messageData = JSON.parse(message.body);
        this.companyMessageHandlers.forEach(handler => handler(messageData));
      });
    }

    // Đăng ký nhận cập nhật danh sách người dùng trực tuyến
    this.stompClient.subscribe('/topic/online-users', (message) => {
      const users = JSON.parse(message.body);
      this.onlineUsersHandlers.forEach(handler => handler(users));
    });
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }

  sendMessage(receiverId, content, type = 'PERSONAL', groupId = null) {
    if (!this.stompClient) {
      throw new Error('WebSocket chưa được kết nối');
    }

    const message = {
      receiverId,
      content,
      timestamp: new Date(),
      type,
      groupId
    };

    let destination = '/app/chat';
    if (type === 'DEPARTMENT') {
      destination = '/app/chat/department';
    } else if (type === 'COMPANY') {
      destination = '/app/chat/company';
    }

    this.stompClient.send(destination, {}, JSON.stringify(message));
  }

  // Lấy lịch sử tin nhắn
  async getMessageHistory(userId) {
    try {
      const response = await api.get(`/api/messages/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử tin nhắn:', error);
      throw error;
    }
  }

  // Lấy tin nhắn chưa đọc
  async getUnreadMessages() {
    try {
      const response = await api.get('/api/messages/unread');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn chưa đọc:', error);
      throw error;
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessageAsRead(messageId) {
    try {
      await api.put(`/api/messages/${messageId}/read`);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
      throw error;
    }
  }

  // Lấy danh sách người dùng chat gần đây
  async getRecentChatUsers() {
    try {
      const response = await api.get('/api/messages/recent-users');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng chat gần đây:', error);
      throw error;
    }
  }

  // Đăng ký lắng nghe tin nhắn mới
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  // Đăng ký lắng nghe tin nhắn phòng ban
  onDepartmentMessage(handler) {
    this.departmentMessageHandlers.add(handler);
    return () => this.departmentMessageHandlers.delete(handler);
  }

  // Đăng ký lắng nghe tin nhắn toàn công ty
  onCompanyMessage(handler) {
    this.companyMessageHandlers.add(handler);
    return () => this.companyMessageHandlers.delete(handler);
  }

  // Đăng ký lắng nghe cập nhật danh sách người dùng trực tuyến
  onOnlineUsersUpdate(handler) {
    this.onlineUsersHandlers.add(handler);
    return () => this.onlineUsersHandlers.delete(handler);
  }
}

export const chatService = new ChatService();