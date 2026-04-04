import api from "../../lib/axios";

export const supervisorAssignmentService = {
    getTeachers: async () => {
        const response = await api.get('/api/v1/koordinator/teachers');
        return response.data;
    },

    getPlottingStudents: async () => {
        const response = await api.get('/api/v1/koordinator/supervisor-assignment');
        return response.data;
    },

    assignTeacher: async (student_id: number, pembimbing_id: number) => {
        const response = await api.post('/api/v1/koordinator/supervisor-assignment', {
            student_id,
            pembimbing_id
        });
        return response.data;
    }
}