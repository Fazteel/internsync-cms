import api from "../../lib/axios";

export interface UserPayload {
  name: string;
  email: string;
  identifier: string;
  role: string;
  status: string;
  jurusan?: string;
  kelas?: string;
}

export const userService = {
  getUsers: async (search?: string, role?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'All') params.append('role', role);
    
    const response = await api.get(`/api/v1/admin/users?${params.toString()}`);
    return response.data;
  },
  
  createUser: async (data: UserPayload) => {
    const response = await api.post('/api/v1/admin/users', data);
    return response.data;
  },
  
  updateUser: async (id: number, data: UserPayload) => {
    const response = await api.put(`/api/v1/admin/users/${id}`, data);
    return response.data;
  },
  
  deleteUser: async (id: number) => {
    const response = await api.delete(`/api/v1/admin/users/${id}`);
    return response.data;
  },
  
  resetPassword: async (id: number) => {
    const response = await api.post(`/api/v1/admin/users/${id}/reset-password`);
    return response.data;
  },

  importExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/admin/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  resendActivationEmail: async (id: number) => {
    const response = await api.post(`/api/v1/admin/users/${id}/resend-activation`);
    return response.data;
  },
};