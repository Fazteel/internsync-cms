import { create } from "zustand";
import {
  fetchLogbooksService,
  verifyLogbookService,
  bulkVerifyLogbooksService,
} from "../../services/Pembimbing/logbookApprovalService";

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
  verifyLogbook: (
    id: number,
    status: "approved" | "revised",
    revisionNote?: string
  ) => Promise<void>;

  bulkVerifyLogbooks: (ids: number[], status: "Approved") => Promise<void>;
}

export const useLogbookApproval = create<LogbookApproval>((set, get) => ({
  logbooksToVerify: [],
  isLoading: false,

  fetchLogbooksToVerify: async () => {
    set({ isLoading: true });

    try {
      const data = await fetchLogbooksService();
      set({ logbooksToVerify: data, isLoading: false });
    } catch (err) {
      console.error("Gagal narik logbook", err);
      set({ isLoading: false });
    }
  },

  verifyLogbook: async (id, status, revisionNote) => {
    await verifyLogbookService(id, status, revisionNote);
    await get().fetchLogbooksToVerify();
  },

  bulkVerifyLogbooks: async (ids, status) => {
    set({ isLoading: true });

    try {
      await bulkVerifyLogbooksService(ids, status.toLowerCase());
      await get().fetchLogbooksToVerify();
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));