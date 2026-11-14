import { ref } from 'vue';
import { adminApi } from '@/utils/admin/adminApi';
import { notifyDataChanged } from '@/composables/useDataSync';

export interface MeetupItem {
  id: number;
  title: string;
  meetup_date: string;
  start_time: string;
  end_time: string;
  region: string;
  location_name: string;
  maps_url?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  qr_token: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  total_hadir?: number;
  total_tidak_hadir?: number;
  total_izin?: number;
  banner_image?: string | null;
  created_at?: string;
  has_exp_up?: boolean;
  exp_multiplier?: number;
  exp_up_status?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  exp_up_note?: string;
  exp_up_approved_by?: string;
  exp_up_approved_at?: string;
}

export interface MeetupAttendanceItem {
  id: number;
  meetup_id: number;
  member_code: string;
  member_name?: string;
  nickname: string;
  member_domisili?: string;
  is_home_region: number;
  status: 'HADIR' | 'TIDAK_HADIR' | 'IZIN';
  points_delta: number;
  exp_delta?: number;
  keterangan?: string;
  checkin_latitude?: number;
  checkin_longitude?: number;
  distance_meters?: number;
  scanned_at?: string;
}

export function useAdminMeetups() {
  const meetupsList = ref<MeetupItem[]>([]);
  const loadingMeetups = ref(false);

  const fetchMeetups = async () => {
    loadingMeetups.value = true;
    try {
      const res = await adminApi.get('/api/v1/meetups');
      if (res.data?.success && Array.isArray(res.data.data)) {
        meetupsList.value = res.data.data;
      }
    } catch (err) {
      console.error('Gagal mengambil daftar meetup:', err);
    } finally {
      loadingMeetups.value = false;
    }
  };

  const saveMeetup = async (payload: {
    title: string;
    meetup_date: string;
    start_time: string;
    end_time: string;
    region: string;
    location_name: string;
    banner_image?: string | null;
    maps_url?: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    description?: string;
    has_exp_up?: boolean;
    exp_multiplier?: number;
    exp_up_note?: string;
  }) => {
    try {
      const res = await adminApi.post('/api/v1/meetups', payload);
      if (res.data?.success) {
        await fetchMeetups();
        notifyDataChanged('meetups');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal membuat meetup.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Terjadi kesalahan saat membuat meetup.'
      };
    }
  };

  const approveExpUp = async (id: number) => {
    try {
      const res = await adminApi.post(`/api/v1/admin/meetups/${id}/exp-up`, { action: 'APPROVE' });
      if (res.data?.success) {
        await fetchMeetups();
        notifyDataChanged('meetups');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal menyetujui EXP UP.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal menyetujui EXP UP.'
      };
    }
  };

  const rejectExpUp = async (id: number) => {
    try {
      const res = await adminApi.post(`/api/v1/admin/meetups/${id}/exp-up`, { action: 'REJECT' });
      if (res.data?.success) {
        await fetchMeetups();
        notifyDataChanged('meetups');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal menolak EXP UP.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal menolak EXP UP.'
      };
    }
  };

  const finalizeMeetup = async (id: number) => {
    try {
      const res = await adminApi.post(`/api/v1/meetups/${id}/finalize`);
      if (res.data?.success) {
        await fetchMeetups();
        notifyDataChanged('meetups');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal memfinalisasi meetup.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal memfinalisasi meetup.'
      };
    }
  };

  const deleteMeetup = async (id: number) => {
    try {
      const res = await adminApi.delete(`/api/v1/meetups/${id}`);
      if (res.data?.success) {
        await fetchMeetups();
        notifyDataChanged('meetups');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Gagal menghapus meetup.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal menghapus meetup.'
      };
    }
  };

  const fetchAttendances = async (meetupId: number): Promise<MeetupAttendanceItem[]> => {
    try {
      const res = await adminApi.get(`/api/v1/meetups/${meetupId}`);
      if (res.data?.success && res.data.data?.attendances) {
        return res.data.data.attendances;
      }
    } catch (err) {
      console.error('Gagal mengambil daftar absensi meetup:', err);
    }
    return [];
  };

  const updateAttendanceStatus = async (
    meetupId: number,
    memberCode: string,
    status: string,
    keterangan: string = 'Diubah oleh admin'
  ) => {
    try {
      const res = await adminApi.post(`/api/v1/meetups/${meetupId}/attendance`, {
        member_code: memberCode,
        status,
        keterangan
      });
      if (res.data?.success) {
        await fetchMeetups();
        notifyDataChanged('meetups');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Gagal mengubah status absensi.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal mengubah status absensi.'
      };
    }
  };

  const parseMapsLink = async (url: string) => {
    try {
      const res = await adminApi.post('/api/v1/meetups/parse-maps-link', { url });
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Gagal memproses link maps.' };
    }
  };

  return {
    meetupsList,
    loadingMeetups,
    fetchMeetups,
    saveMeetup,
    approveExpUp,
    rejectExpUp,
    finalizeMeetup,
    deleteMeetup,
    fetchAttendances,
    updateAttendanceStatus,
    parseMapsLink
  };
}
