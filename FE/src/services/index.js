// Service imports
import api from './api';
import AuthService from './AuthService';
import projectService from './projectService';
import taskService from './taskService';
import riskService from './riskService';
import staffService from './staffService';
import departmentService from './departmentService';
import documentService from './documentService';
import categoryService from './categoryService';
import categoryTypeService from './categoryTypeService';
import { chatService } from './chatService';
import websocketService from './websocketService';

// Export individual services
export {
  api,
  AuthService,
  projectService,
  taskService,
  riskService,
  staffService,
  departmentService,
  documentService,
  categoryService,
  categoryTypeService,
  chatService,
  websocketService
};

// Service management utilities
export const serviceManager = {
  // Initialize all services
  async initialize() {
    try {
      console.log('Initializing services...');
      
      // Connect WebSocket if user is authenticated
      if (AuthService.isAuthenticated()) {
        await websocketService.connect();
        chatService.connect();
      }
      
      console.log('Services initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing services:', error);
      return false;
    }
  },

  // Cleanup all services
  cleanup() {
    try {
      console.log('Cleaning up services...');
      
      // Disconnect WebSocket connections
      websocketService.disconnect();
      chatService.disconnect();
      
      console.log('Services cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up services:', error);
    }
  },

  // Setup authenticated services
  setupAuthenticatedServices() {
    try {
      console.log('Setting up authenticated services...');
      
      // Connect WebSocket services for authenticated users
      if (AuthService.isAuthenticated()) {
        websocketService.connect();
        chatService.connect();
        chatService.joinChat();
        chatService.sendUserStatus('ONLINE');
      }
      
      console.log('Authenticated services setup successfully');
    } catch (error) {
      console.error('Error setting up authenticated services:', error);
    }
  },

  // Check service health
  async healthCheck() {
    const health = {
      api: false,
      auth: false,
      websocket: false,
      chat: false
    };

    try {
      // Check API health
      const response = await api.get('/actuator/health');
      health.api = response.status === 'UP';
    } catch (error) {
      console.error('API health check failed:', error);
    }

    try {
      // Check auth
      health.auth = AuthService.isAuthenticated();
    } catch (error) {
      console.error('Auth health check failed:', error);
    }

    try {
      // Check WebSocket
      health.websocket = websocketService.isWebSocketConnected();
    } catch (error) {
      console.error('WebSocket health check failed:', error);
    }

    try {
      // Check chat service
      health.chat = chatService.isWebSocketConnected();
    } catch (error) {
      console.error('Chat service health check failed:', error);
    }

    return health;
  }
};

// Default export
export default {
  api,
  AuthService,
  projectService,
  taskService,
  riskService,
  staffService,
  departmentService,
  documentService,
  categoryService,
  categoryTypeService,
  chatService,
  websocketService,
  serviceManager
}; 