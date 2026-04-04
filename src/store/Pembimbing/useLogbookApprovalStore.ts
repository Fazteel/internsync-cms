import { create } from "zustand";
import api from "../../lib/axios";

export interface StudentLogbook {
  id: number;
  studentName: string;
  nis: string;
  industry: string;
  date: string;
  activity: string;
  attachment: string;
  attachment_url: string | null;
  status: "approved" | "submitted" | "revised";
  revisionNote?: string;
}

interface LogbookApproval {
  logbooksToVerify: StudentLogbook[];
  isLoading: boolean;
  fetchLogbooksToVerify: () => Promise<void>;
  bulkVerifyLogbooks: (ids: number[], status: "Approved") => Promise<void>;
  verifyLogbook: (
    id: number,
    status: "Approved" | "Revision",
    revisionNote?: string,
  ) => Promise<void>;
}

export const useLogbookApproval = create<LogbookApproval>((set) => ({
  logbooksToVerify: [],
  isLoading: false,

  fetchLogbooksToVerify: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/v1/pembimbing/logbooks");
      set({ logbooksToVerify: response.data, isLoading: false });
    } catch (error) {
      console.error("Gagal narik data verifikasi logbook", error);
      set({ isLoading: false });
    }
  },

  verifyLogbook: async (id, status, revisionNote) => {
    await api.put(`/api/v1/pembimbing/logbooks/${id}/verify`, {
      status,
      revisionNote,
    });
    await useLogbookApproval.getState().fetchLogbooksToVerify();
  },

  bulkVerifyLogbooks: async (ids, status) => {
    set({ isLoading: true });
    try {
      await api.put(`/api/v1/pembimbing/logbooks/bulk-verify`, {
        ids,
        status: status.toLowerCase()
      });

      await useLogbookApproval.getState().fetchLogbooksToVerify();
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
