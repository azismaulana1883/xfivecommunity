import { ref } from 'vue';
import { adminApi } from '@/utils/admin/adminApi';
import { normalizeTesterToCode } from '@/data/testers';
import { notifyDataChanged } from '@/composables/useDataSync';

export interface Member {
  id: number;
  member_code: string;
  unique_code_edit: string;
  name: string;
  nickname: string;
  slug: string;
  title: string;
  category: string;
  domisili: string;
  dob: string;
  gender: string;
  avatar: string;
  face_image_path?: string;
  tester?: string;
  verified: boolean;
  can_edit_full?: boolean;
  is_blacklisted?: boolean;
  quote?: string;
  created_at?: string;
}

export interface HistoricalRecord {
  id: number;
  member_code: string;
  old_nickname: string;
  new_nickname: string;
  created_at: string;
}

export function useAdminMembers() {
  const members = ref<Member[]>([]);
  const loadingMembers = ref(false);

  const fetchMembers = async () => {
    loadingMembers.value = true;
    try {
      const res = await adminApi.get('/api/v1/members?limit=1000&include_blacklist=1');
      if (res.data?.success && Array.isArray(res.data.data)) {
        members.value = res.data.data;
      }
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      loadingMembers.value = false;
    }
  };

  const deleteMember = async (memberCode: string) => {
    try {
      const res = await adminApi.delete(`/api/v1/members?member_code=${encodeURIComponent(memberCode)}`);
      if (res.data?.success) {
        await fetchMembers();
        notifyDataChanged('members');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal menghapus member.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Terjadi kesalahan saat menghapus member.'
      };
    }
  };

  const toggleEditPermission = async (m: Member) => {
    if (!m.member_code) return { success: false, message: 'Kode member tidak valid.' };
    const nextState = !m.can_edit_full;
    try {
      const res = await adminApi.patch('/api/v1/members', {
        member_code: m.member_code,
        can_edit_full: nextState,
      });
      if (res.data?.success) {
        m.can_edit_full = nextState;
        notifyDataChanged('members');
        return {
          success: true,
          message:
            res.data?.message ||
            (nextState
              ? `Izin Full Edit untuk ${m.nickname} AKTIF.`
              : `Izin Full Edit untuk ${m.nickname} DINONAKTIFKAN (Nick Only).`),
        };
      }
      return { success: false, message: res.data?.message || 'Gagal memperbarui izin edit.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal memperbarui izin edit member.'
      };
    }
  };

  const fetchHistory = async (memberCode?: string): Promise<HistoricalRecord[]> => {
    try {
      const url = memberCode
        ? `/api/v1/historical?member_code=${encodeURIComponent(memberCode)}`
        : '/api/v1/historical';
      const res = await adminApi.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.error('Gagal memuat historical data:', err);
    }
    return [];
  };

  const canManageMember = (m: Member, user?: { role?: string; tester_name?: string | null } | null): boolean => {
    if (!m || !user || !user.role) return false;
    const role = (user.role || '').toLowerCase();
    if (role === 'superadmin' || role === 'owner' || role === 'admin') return true;
    if (role === 'leader' || role === 'vice_leader') {
      return (m.category || '').toLowerCase() !== 'owner';
    }
    if (role === 'staff_tester') {
      const isNormalMember = (m.category || 'member').toLowerCase() === 'member';
      if (!isNormalMember) return false;
      if (!user.tester_name || !m.tester) return false;
      const memberTesterCode = normalizeTesterToCode(m.tester);
      const myTesterCode = normalizeTesterToCode(user.tester_name);
      return Boolean(
        (memberTesterCode && myTesterCode && memberTesterCode.toUpperCase() === myTesterCode.toUpperCase()) ||
        m.tester.toLowerCase() === user.tester_name.toLowerCase()
      );
    }
    return false;
  };

  return {
    members,
    loadingMembers,
    fetchMembers,
    deleteMember,
    toggleEditPermission,
    fetchHistory,
    canManageMember
  };
}
