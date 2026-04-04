import { create } from "zustand";
import { logbookService } from "../../services/Siswa/logbookService";

export interface LogbookEntry {
  id: number;
  date: string;
  activity: string;
  attachment: string;
  attachment_url: string | null;
  status: "approved" | "submitted" | "revised";
  revisionNote?: string;
}

interface LogbookState {
  logbookEntries: LogbookEntry[];
  isLoading: boolean;
  fetchLogbooks: () => Promise<void>;
  addLogbook: (data: {
    date: string;
    activity: string;
    attachment: File
  }) => Promise<void>;
  updateLogbook: (id: number, data: { activity: string; attachment?: File | null }) => Promise<void>;
}

export const useLogbookStore = create<LogbookState>((set, get) => ({
  logbookEntries: [],
  isLoading: false,

  fetchLogbooks: async () => {
    set({ isLoading: true });
    try {
      const data = await logbookService.getLogbooks();
      set({ logbookEntries: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error("Gagal load logbook", error);
    }
  },

  addLogbook: async (data) => {
    await logbookService.storeLogbook(data);
    await get().fetchLogbooks();
  },

  updateLogbook: async (id, data) => {
    await logbookService.updateLogbook(id, data);
    await get().fetchLogbooks();
  }
}));