import { ref } from 'vue';
import { adminApi } from '@/utils/admin/adminApi';
import { notifyDataChanged } from '@/composables/useDataSync';

export interface BlacklistRecord {
  id: number;
  member_code: string;
  nama: string;
  nickname: string;
  kategori: string;
  remarks: string;
  pelanggaran: string;
  outDate: string;
  out_date: string;
  is_blacklist: 'Y' | 'N';
  duration: string;
}

export function useAdminBlacklist() {
  const blacklistList = ref<BlacklistRecord[]>([]);
  const loadingBlacklist = ref(false);

  const fetchBlacklist = async () => {
    loadingBlacklist.value = true;
    try {
      const res = await adminApi.get('/api/v1/blacklist');
      if (res.data?.success && Array.isArray(res.data.data)) {
        blacklistList.value = res.data.data;
      }
    } catch (err) {
      console.error('Gagal mengambil data blacklist:', err);
    } finally {
      loadingBlacklist.value = false;
    }
  };

  const deleteBlacklist = async (id: number) => {
    const res = await adminApi.delete(`/api/v1/blacklist?id=${id}`);
    if (res.data?.success) {
      await fetchBlacklist();
      notifyDataChanged('blacklist');
      notifyDataChanged('members');
      return true;
    }
    return false;
  };

  const saveBlacklist = async (payload: any) => {
    const res = await adminApi.post('/api/v1/blacklist', payload);
    if (res.data?.success) {
      await fetchBlacklist();
      notifyDataChanged('blacklist');
      notifyDataChanged('members');
      return true;
    }
    return false;
  };

  return {
    blacklistList,
    loadingBlacklist,
    fetchBlacklist,
    deleteBlacklist,
    saveBlacklist
  };
}
