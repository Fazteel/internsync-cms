import api from "../lib/axios";

export interface MajorPayload {
  major_code: string;
  major_name: string;
  is_active: boolean;
}

export interface AcademicYearPayload {
  name: string;
  semester: string;
  is_active: boolean;
}

export interface ClassroomPayload {
    major_id: number;
    name: string;
    is_active: boolean;
}

export const masterService = {
    getMajors: async () => {
        const response = await api.get('/api/v1/admin/majors');
        return response.data;
    },
    createMajor: async (data: MajorPayload) => {
        const response = await api.post('/api/v1/admin/majors', data);
        return response.data;
    },
    updateMajor: async (id: number, data: MajorPayload) => {
        const response = await api.put(`/api/v1/admin/majors/${id}`, data);
        return response.data;
    },
    deleteMajor: async (id: number) => {
        const response = await api.delete(`/api/v1/admin/majors/${id}`);
        return response.data;
    },

    getAcademicYears: async () => {
        const response = await api.get('/api/v1/admin/academic-years');
        return response.data;
    },
    createAcademicYear: async (data: AcademicYearPayload) => {
        const response = await api.post('/api/v1/admin/academic-years', data);
        return response.data;
    },
    updateAcademicYear: async (id: number, data: AcademicYearPayload) => {
        const response = await api.put(`/api/v1/admin/academic-years/${id}`, data);
        return response.data;
    },
    deleteAcademicYear: async (id: number) => {
        const response = await api.delete(`/api/v1/admin/academic-years/${id}`);
        return response.data;
    },
  
    getClassrooms: async () => {
        const res = await api.get('/api/v1/admin/classrooms'); return res.data;
    },
    createClassroom: async (data: ClassroomPayload) => {
        const res = await api.post('/api/v1/admin/classrooms', data); return res.data;
    },
    updateClassroom: async (id: number, data: ClassroomPayload) => {
        const res = await api.put(`/api/v1/admin/classrooms/${id}`, data); return res.data;
    },
    deleteClassroom: async (id: number) => {
        const res = await api.delete(`/api/v1/admin/classrooms/${id}`); return res.data;
    },
    importFromExcel: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/v1/admin/masters/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });
        return response.data;
    }
};