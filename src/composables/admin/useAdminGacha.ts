import { ref, computed } from 'vue';
import { adminClient } from '@/utils/admin/adminApi';

export interface GachaRewardItem {
  id: number;
  tier_level?: number;
  category: 'VIP' | 'MI-CASH' | 'OTHERS';
  vip_type?: string | null;
  name: string;
  description?: string | null;
  image_url?: string | null;
  drop_rate: number;
  point_cost: number;
  is_active: boolean;
  stock: number;
  available_vouchers?: number;
  claimed_vouchers?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GachaVoucherItem {
  id: number;
  reward_id: number;
  reward_name?: string;
  code_part1: string;
  code_part2: string;
  code_part3: string;
  full_code: string;
  password: string;
  status: 'AVAILABLE' | 'CLAIMED' | 'EXPIRED';
  claimed_by_member_code?: string | null;
  claimed_at?: string | null;
  created_at?: string;
  created_by?: string;
}

export interface GachaRollItem {
  id: number;
  member_code: string;
  member_name: string;
  member_nickname: string;
  points_spent: number;
  reward_id?: number | null;
  reward_name: string;
  reward_category: string;
  is_zonk: boolean;
  voucher_id?: number | null;
  voucher_code?: string | null;
  voucher_password?: string | null;
  claim_ticket_code: string;
  claim_status: 'AUTO_CLAIMED' | 'PENDING_STAFF' | 'FULFILLED' | 'ZONK';
  rolled_at: string;
  ip_address?: string;
}

export interface GachaSettingsData {
  id: number;
  is_active: boolean;
  event_title: string;
  event_subtitle: string;
  banner_url?: string | null;
  points_per_roll: number;
  start_date?: string | null;
  end_date?: string | null;
  how_to_play?: string | null;
}

export function useAdminGacha() {
  const rewardsList = ref<GachaRewardItem[]>([]);
  const vouchersList = ref<GachaVoucherItem[]>([]);
  const rollsHistory = ref<GachaRollItem[]>([]);
  const settings = ref<GachaSettingsData>({
    id: 1,
    is_active: true,
    event_title: 'XFIVE EXCLUSIVE GACHA EVENT',
    event_subtitle: 'Tukarkan Poin Kehadiran Meetup Anda untuk memutar Gacha!',
    points_per_roll: 1,
  });

  const loadingRewards = ref(false);
  const loadingVouchers = ref(false);
  const loadingRolls = ref(false);
  const loadingSettings = ref(false);

  const selectedTierFilter = ref<number | 'ALL'>('ALL');

  const filteredRewardsList = computed(() => {
    if (selectedTierFilter.value === 'ALL') {
      return rewardsList.value;
    }
    return rewardsList.value.filter((r) => (r.tier_level || 1) === selectedTierFilter.value);
  });

  // Peluang Menang & ZONK dihitung khusus untuk tier yang sedang aktif dipilih
  const totalRewardRate = computed(() => {
    const list = filteredRewardsList.value.filter((r) => r.is_active);
    const sum = list.reduce((acc, r) => acc + (parseFloat(String(r.drop_rate)) || 0), 0);
    return Math.min(100, parseFloat(sum.toFixed(2)));
  });

  const zonkRate = computed(() => {
    return Math.max(0, parseFloat((100 - totalRewardRate.value).toFixed(2)));
  });

  // Helper untuk membaca statistik drop rate & zonk spesifik per tier level
  const getTierStats = (tierLvl: number) => {
    const list = rewardsList.value.filter((r) => (r.tier_level || 1) === tierLvl && r.is_active);
    const sum = list.reduce((acc, r) => acc + (parseFloat(String(r.drop_rate)) || 0), 0);
    const winRate = Math.min(100, parseFloat(sum.toFixed(2)));
    const zonk = Math.max(0, parseFloat((100 - winRate).toFixed(2)));
    return {
      count: list.length,
      winRate,
      zonkRate: zonk,
    };
  };

  // 1. REWARDS CRUD
  const fetchRewards = async () => {
    loadingRewards.value = true;
    try {
      const res = await adminClient.get('/api/v1/admin/gacha/rewards');
      if (res.data?.success) {
        rewardsList.value = res.data.data.rewards || [];
      }
    } catch (err) {
      console.error('Failed to fetch gacha rewards:', err);
    } finally {
      loadingRewards.value = false;
    }
  };

  const saveReward = async (payload: Partial<GachaRewardItem>, id?: number) => {
    if (id) {
      const res = await adminClient.put(`/api/v1/admin/gacha/rewards/${id}`, payload);
      await fetchRewards();
      return res.data;
    } else {
      const res = await adminClient.post('/api/v1/admin/gacha/rewards', payload);
      await fetchRewards();
      return res.data;
    }
  };

  const deleteReward = async (id: number) => {
    const res = await adminClient.delete(`/api/v1/admin/gacha/rewards/${id}`);
    await fetchRewards();
    return res.data;
  };

  // 2. VOUCHERS CRUD
  const fetchVouchers = async (rewardId?: number, status?: string) => {
    loadingVouchers.value = true;
    try {
      const params: any = {};
      if (rewardId) params.reward_id = rewardId;
      if (status) params.status = status;
      const res = await adminClient.get('/api/v1/admin/gacha/vouchers', { params });
      if (res.data?.success) {
        vouchersList.value = res.data.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch gacha vouchers:', err);
    } finally {
      loadingVouchers.value = false;
    }
  };

  const saveVoucher = async (payload: {
    reward_id: number;
    code_part1: string;
    code_part2: string;
    code_part3: string;
    password: string;
  }) => {
    const res = await adminClient.post('/api/v1/admin/gacha/vouchers', payload);
    await fetchVouchers();
    await fetchRewards();
    return res.data;
  };

  const deleteVoucher = async (id: number) => {
    const res = await adminClient.delete(`/api/v1/admin/gacha/vouchers/${id}`);
    await fetchVouchers();
    await fetchRewards();
    return res.data;
  };

  // 3. ROLLS & WINNERS HISTORY
  const fetchRollsHistory = async (filters: {
    search?: string;
    category?: string;
    status?: string;
    winners_only?: boolean;
  } = {}) => {
    loadingRolls.value = true;
    try {
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.winners_only) params.winners_only = '1';

      const res = await adminClient.get('/api/v1/admin/gacha/rolls', { params });
      if (res.data?.success) {
        rollsHistory.value = res.data.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch gacha rolls history:', err);
    } finally {
      loadingRolls.value = false;
    }
  };

  const updateClaimStatus = async (id: number, claimStatus: string) => {
    const res = await adminClient.patch(`/api/v1/admin/gacha/rolls/${id}`, {
      claim_status: claimStatus,
    });
    return res.data;
  };

  // 4. SETTINGS
  const fetchSettings = async () => {
    loadingSettings.value = true;
    try {
      const res = await adminClient.get('/api/v1/gacha/settings');
      if (res.data?.success) {
        settings.value = {
          ...res.data.data,
          is_active: Boolean(res.data.data.is_active),
        };
      }
    } catch (err) {
      console.error('Failed to fetch gacha settings:', err);
    } finally {
      loadingSettings.value = false;
    }
  };

  const saveSettings = async (payload: Partial<GachaSettingsData>) => {
    const res = await adminClient.put('/api/v1/admin/gacha/settings', payload);
    await fetchSettings();
    return res.data;
  };

  return {
    rewardsList,
    filteredRewardsList,
    selectedTierFilter,
    vouchersList,
    rollsHistory,
    settings,
    loadingRewards,
    loadingVouchers,
    loadingRolls,
    loadingSettings,
    totalRewardRate,
    zonkRate,
    getTierStats,
    fetchRewards,
    saveReward,
    deleteReward,
    fetchVouchers,
    saveVoucher,
    deleteVoucher,
    fetchRollsHistory,
    updateClaimStatus,
    fetchSettings,
    saveSettings,
  };
}
