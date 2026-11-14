import { ref } from 'vue';
import { adminApi } from '@/utils/admin/adminApi';
import { notifyDataChanged } from '@/composables/useDataSync';

export interface AdminStaffItem {
  id: number;
  member_id?: number | null;
  member_code?: string | null;
  member_name?: string | null;
  member_nickname?: string | null;
  member_avatar?: string | null;
  member_title?: string | null;
  member_category?: string | null;
  username: string;
  role: 'superadmin' | 'leader' | 'vice_leader' | 'staff_tester' | 'staff_meet';
  tester_name?: string | null;
  title?: string | null;
  category?: string | null;
  created_at?: string;
}

export function useAdminStaff() {
  const staffList = ref<AdminStaffItem[]>([]);
  const loadingStaff = ref(false);

  const fetchStaff = async () => {
    loadingStaff.value = true;
    try {
      const res = await adminApi.get('/api/v1/admin/staff');
      if (res.data?.success && Array.isArray(res.data.data)) {
        staffList.value = res.data.data;
      }
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      loadingStaff.value = false;
    }
  };

  const promoteStaff = async (payload: {
    member_code: string;
    username: string;
    password?: string;
    role: string;
    tester_name?: string | null;
    title?: string;
    category?: string;
  }) => {
    try {
      const res = await adminApi.post('/api/v1/admin/staff', payload);
      if (res.data?.success) {
        await fetchStaff();
        notifyDataChanged('staff');
        notifyDataChanged('members');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal menyimpan data staff.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal memproses pengangkatan staff.'
      };
    }
  };

  const removeStaff = async (id: number) => {
    try {
      const res = await adminApi.delete(`/api/v1/admin/staff?id=${id}`);
      if (res.data?.success) {
        await fetchStaff();
        notifyDataChanged('staff');
        notifyDataChanged('members');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal mencopot jabatan staff.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Terjadi kesalahan saat mencopot jabatan staff.'
      };
    }
  };

  return {
    staffList,
    loadingStaff,
    fetchStaff,
    promoteStaff,
    removeStaff
  };
}
