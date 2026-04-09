import api from "../../lib/axios";

export interface UserPayload {
  name: string;
  email: string;
  identifier: string;
  role: string;
  status: string;
  jurusan?: string;
  kelas?: string;
  phone?: string;
  address?: string;
  academic_year_id?: number | string;
  signature?: File | null;
}

export const userService = {
  getUsers: async (search?: string, role?: string) => {
    const resStudents = await api.get('/api/v1/admin/students', { params: { search } });
    const resTeachers = await api.get('/api/v1/admin/teachers', { params: { search, role } });
    return { students: resStudents.data, teachers: resTeachers.data };
  },
  
  createUser: async (data: UserPayload) => {
    const endpoint = data.role === 'Siswa' ? '/api/v1/admin/students' : '/api/v1/admin/teachers';
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'signature' && value instanceof File) {
          formData.append('signature', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  updateUser: async (id: number, data: UserPayload) => {
    const endpoint = data.role === 'Siswa' ? `/api/v1/admin/students/${id}` : `/api/v1/admin/teachers/${id}`;
    
    const formData = new FormData();
    formData.append('_method', 'PUT'); 
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'signature' && value instanceof File) {
          formData.append('signature', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  deleteUser: async (id: number, role: string) => {
    const endpoint = role === 'Siswa' ? `/api/v1/admin/students/${id}` : `/api/v1/admin/teachers/${id}`;
    return await api.delete(endpoint);
  },

  importExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/api/v1/admin/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  resendActivationEmail: async (id: number) => {
    return await api.post(`/api/v1/admin/users/${id}/resend-activation`);
  },
};