import api from "../lib/axios";

export const authService = {
  login: async (email: string, password: string, remember: boolean = false) => {
    await api.get('/sanctum/csrf-cookie');
    const response = await api.post('/api/v1/login', { email, password, remember });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/v1/me');
    return response.data;
  },

  logout: async () => {
    await api.post('/api/v1/logout');
  },

  forgotPassword: async (data: { identifier: string; email: string }) => {
    const response = await api.post('/api/v1/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { email: string; token: string; password: string; password_confirmation: string }) => {
    const response = await api.post('/api/v1/reset-password', data);
    return response.data;
  }
};