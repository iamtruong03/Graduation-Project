import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscriptions = new Map();
  }

  connect(onConnected) {
    const socket = new SockJS(`${API_URL}/ws`);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('WebSocket Connected');
      if (onConnected) onConnected();
    }, this.onError);
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }

  subscribe(topic, callback) {
    if (!this.stompClient) {
      console.error('WebSocket not connected');
      return;
    }

    if (!this.subscriptions.has(topic)) {
      const subscription = this.stompClient.subscribe(topic, (message) => {
        const data = JSON.parse(message.body);
        callback(data);
      });
      this.subscriptions.set(topic, subscription);
    }
  }

  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  onError(error) {
    console.error('WebSocket Error:', error);
  }
}

export default new WebSocketService(); 