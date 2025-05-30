import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from './api';

class ChatService {
  constructor() {
    this.stompClient = null;
    this.messageHandlers = new Set();
    this.typingHandlers = new Set();
    this.readReceiptHandlers = new Set();
    this.userStatusHandlers = new Set();
    this.errorHandlers = new Set();
    this.isConnected = false;
  }

  connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(() => socket);
    this.stompClient.reconnect_delay = 5000;
    this.stompClient.heartbeat.outgoing = 20000;
    this.stompClient.heartbeat.incoming = 20000;

    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      if (!token) {
        reject(new Error('Token không tồn tại'));
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };
  
      this.stompClient.connect(headers, 
        () => {
          console.log('WebSocket kết nối thành công');
          this.isConnected = true;
          this.subscribeToTopics();
          resolve();
        },
        (error) => {
          console.error('Lỗi kết nối WebSocket:', error);
          this.isConnected = false;
          reject(error);
          setTimeout(() => this.connect(), 5000);
        }
      );
    });
  }

  subscribeToTopics() {
    if (!this.stompClient || !this.isConnected) return;

    // Subscribe to personal messages
    this.stompClient.subscribe('/user/queue/messages', (message) => {
      const messageData = JSON.parse(message.body);
      console.log('Received message:', messageData);
      this.messageHandlers.forEach(handler => handler(messageData));
    });

    // Subscribe to typing notifications
    this.stompClient.subscribe('/user/queue/typing', (message) => {
      const typingData = JSON.parse(message.body);
      console.log('Received typing notification:', typingData);
      this.typingHandlers.forEach(handler => handler(typingData));
    });

    // Subscribe to read receipts
    this.stompClient.subscribe('/user/queue/read-receipts', (message) => {
      const readData = JSON.parse(message.body);
      console.log('Received read receipt:', readData);
      this.readReceiptHandlers.forEach(handler => handler(readData));
    });

    // Subscribe to error messages
    this.stompClient.subscribe('/user/queue/errors', (message) => {
      const errorData = JSON.parse(message.body);
      console.error('Received error:', errorData);
      this.errorHandlers.forEach(handler => handler(errorData));
    });

    // Subscribe to public messages (user join/leave)
    this.stompClient.subscribe('/topic/public', (message) => {
      const publicData = JSON.parse(message.body);
      console.log('Received public message:', publicData);
      this.userStatusHandlers.forEach(handler => handler(publicData));
    });
  }

  disconnect() {
    if (this.stompClient && this.isConnected) {
      this.stompClient.disconnect();
      this.isConnected = false;
    }
  }

  // Send message via WebSocket
  sendMessage(receiverId, content, messageType = 'TEXT') {
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket not connected');
      return Promise.reject(new Error('WebSocket not connected'));
    }

    const currentUserId = localStorage.getItem('code');
    const departmentId = localStorage.getItem('departmentId');

    const message = {
      senderId: currentUserId,
      receiverId: receiverId.toString(),
      content: content,
      messageType: messageType,
      departmentId: departmentId ? parseInt(departmentId) : null,
      timestamp: new Date()
    };

    console.log('Sending message via WebSocket:', message);
    this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
    return Promise.resolve();
  }

  // Send typing notification
  sendTypingNotification(receiverId) {
    if (!this.stompClient || !this.isConnected) return;

    const currentUserId = localStorage.getItem('code');
    const typingData = {
      senderId: currentUserId,
      receiverId: receiverId.toString(),
      action: 'TYPING'
    };

    console.log('Sending typing notification:', typingData);
    this.stompClient.send('/app/chat.typing', {}, JSON.stringify(typingData));
  }

  // Mark messages as read
  markMessagesAsRead(senderId) {
    if (!this.stompClient || !this.isConnected) return;

    const currentUserId = localStorage.getItem('code');
    const readData = {
      senderId: senderId.toString(),
      receiverId: currentUserId
    };

    console.log('Marking messages as read:', readData);
    this.stompClient.send('/app/chat.markAsRead', {}, JSON.stringify(readData));
  }

  // Send user status (online/offline)
  sendUserStatus(status) {
    if (!this.stompClient || !this.isConnected) return;

    const currentUserId = localStorage.getItem('code');
    const userName = localStorage.getItem('userName') || 'Unknown User';
    
    const statusData = {
      senderId: currentUserId,
      senderName: userName,
      action: status // 'ONLINE' or 'OFFLINE'
    };

    console.log('Sending user status:', statusData);
    this.stompClient.send('/app/chat.userStatus', {}, JSON.stringify(statusData));
  }

  // Join chat (announce user presence)
  joinChat() {
    if (!this.stompClient || !this.isConnected) return;

    const currentUserId = localStorage.getItem('code');
    const userName = localStorage.getItem('userName') || 'Unknown User';
    
    const joinData = {
      senderId: currentUserId,
      senderName: userName,
      action: 'JOIN'
    };

    console.log('Joining chat:', joinData);
    this.stompClient.send('/app/chat.addUser', {}, JSON.stringify(joinData));
  }

  // REST API methods for loading data

  // Get conversation with pagination
  async getConversation(otherUserId, page = 0, size = 20) {
    try {
      const response = await api.get(`/api/messages/conversation/${otherUserId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  // Get recent conversations
  async getRecentConversations() {
    try {
      const response = await api.get('/api/messages/recent-conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
      throw error;
    }
  }

  // Get unread messages
  async getUnreadMessages() {
    try {
      const response = await api.get('/api/messages/unread-ws');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      throw error;
    }
  }

  // Count unread messages
  async countUnreadMessages() {
    try {
      const response = await api.get('/api/messages/unread/count');
      return response.data;
    } catch (error) {
      console.error('Error counting unread messages:', error);
      throw error;
    }
  }

  // Mark messages as read via REST API
  async markMessagesAsReadREST(otherUserId) {
    try {
      await api.put(`/api/messages/mark-read/${otherUserId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      await api.delete(`/api/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Get chat room ID
  async getChatRoomId(otherUserId) {
    try {
      const response = await api.get(`/api/messages/room/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat room ID:', error);
      throw error;
    }
  }

  // Event listeners

  // Subscribe to new messages
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  // Subscribe to typing notifications
  onTyping(handler) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  // Subscribe to read receipts
  onReadReceipt(handler) {
    this.readReceiptHandlers.add(handler);
    return () => this.readReceiptHandlers.delete(handler);
  }

  // Subscribe to user status changes
  onUserStatus(handler) {
    this.userStatusHandlers.add(handler);
    return () => this.userStatusHandlers.delete(handler);
  }

  // Subscribe to errors
  onError(handler) {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  // Check if connected
  isWebSocketConnected() {
    return this.isConnected && this.stompClient && this.stompClient.connected;
  }
}

export const chatService = new ChatService();