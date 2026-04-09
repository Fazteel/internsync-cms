import api from "../lib/axios";

export interface InternshipApplicationPayload {
  id?: number;
  industry_id: number;
  pembimbing_id: number;
  student_ids: number[];
  action: 'draft' | 'pengajuan' | 'batal' | 'simpan' | 'pengiriman';
}

export interface InternshipPlacementPayload {
    departure_date?: string;
    duration_option?: string;
    final_end_date?: string | null;
    action: 'simpan' | 'pengiriman' | 'batal';
}

export const internshipService = {
  getApplications: async (type: 'pengajuan' | 'pengiriman' | 'riwayat') => {
    const response = await api.get(`/api/v1/koordinator/applications?type=${type}`);
    return response.data;
  },

  getPendingApprovals: async (statusGroup: 'pengajuan' | 'pengiriman') => {
    const endpoint = statusGroup === 'pengajuan'
      ? '/api/v1/hubin/pending-applications'
      : '/api/v1/hubin/pending-placements';
    const response = await api.get(endpoint);
    return response.data;
  },

  submitApplication: async (payload: InternshipApplicationPayload) => {
    const response = await api.post('/api/v1/koordinator/submit-applications', payload);
    return response.data;
  },

  submitPlacement: async (id: number, data: InternshipPlacementPayload) => {
    const response = await api.post(`/api/v1/koordinator/submit-placement/${id}`, data);
    return response.data;
  },

  getApplicationDetail: async (id: number) => {
    const response = await api.get(`/api/v1/koordinator/application/${id}`);
    return response.data;
  },

  processApproval: async (id: number, action: 'approve' | 'reject', type: 'pengajuan' | 'pengiriman') => {
    const endpoint = type === 'pengajuan'
      ? `/api/v1/hubin/application/${id}/action`
      : `/api/v1/hubin/placement/${id}/action`;
      
    const response = await api.post(endpoint, { action });
    return response.data;
  }
};