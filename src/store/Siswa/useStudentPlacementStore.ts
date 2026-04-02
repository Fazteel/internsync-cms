import { create } from "zustand";
import api from "../../lib/axios";

interface PlacementData {
  status: string;
  durasi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  raw_start_date: string | null;
  raw_end_date: string | null;
  industri: {
    nama: string;
    alamat: string;
    pembimbingLapangan: string;
    kontak: string;
  };
  guruPembimbing: {
    nama: string;
    kontak: string;
  };
  suratUrl: string | null;
}

interface StudentPlacementState {
  penempatanData: PlacementData | null;
  isLoading: boolean;
  error: string | null;
  fetchMyPlacement: () => Promise<void>;
}

export const useStudentPlacementStore = create<StudentPlacementState>(
  (set) => ({
    penempatanData: null,
    isLoading: false,
    error: null,

    fetchMyPlacement: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get("/api/v1/siswa/my-placement");
        set({ penempatanData: response.data.data, isLoading: false });
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        set({
          error:
            error.response?.data?.message || "Gagal memuat data penempatan",
          isLoading: false,
          penempatanData: null,
        });
      }
    },
  }),
);
