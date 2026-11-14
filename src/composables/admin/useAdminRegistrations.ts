import { ref } from 'vue';
import { adminApi } from '@/utils/admin/adminApi';
import { notifyDataChanged } from '@/composables/useDataSync';

export interface RegistrationItem {
  id: number;
  nama_panggilan: string;
  nickname_ayodance: string;
  member_code: string | null;
  unique_code_edit?: string | null;
  nomor_wa: string | null;
  email: string | null;
  domisili: string | null;
  provinsi?: string | null;
  kabupaten_kota?: string | null;
  kecamatan?: string | null;
  kelurahan_desa?: string | null;
  divisi_community: string | null;
  tester: string | null;
  user_ip: string | null;
  user_location: string | null;
  is_vpn: string | null;
  user_agent: string | null;
  quote: string | null;
  username_sosmed: string | null;
  face_image_path?: string | null;
  avatar_image_path?: string | null;
  face_image_key?: string | null;
  face_image_id?: string | null;
  upload_code?: string | null;
  biometric_verified?: number | boolean;
  social_confirmed?: string | boolean;
  email_status?: string | null;
  status?: string | null;
  created_at: string | null;
  tanggal_lahir?: string | null;
  sosial_media_name?: string | null;
}

export function useAdminRegistrations() {
  const registrationsList = ref<RegistrationItem[]>([]);
  const loadingRegistrations = ref(false);

  const fetchRegistrationsAdmin = async () => {
    loadingRegistrations.value = true;
    try {
      const res = await adminApi.get('/api/v1/registrations?limit=1000');
      if (res.data?.success && Array.isArray(res.data.data)) {
        registrationsList.value = res.data.data;
      }
    } catch (err: any) {
      console.error('fetchRegistrationsAdmin error:', err);
    } finally {
      loadingRegistrations.value = false;
    }
  };

  const deleteRegistration = async (id: number) => {
    try {
      const res = await adminApi.delete(`/api/v1/registrations?id=${id}`);
      if (res.data?.success) {
        await fetchRegistrationsAdmin();
        notifyDataChanged('registrations');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal menghapus registrasi.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Gagal menghubungi server.'
      };
    }
  };

  return {
    registrationsList,
    loadingRegistrations,
    fetchRegistrationsAdmin,
    deleteRegistration
  };
}
