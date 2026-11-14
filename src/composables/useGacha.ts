import { ref, computed } from 'vue';
import { useToast } from '@/composables/useToast';
import { calculateMemberTier, MemberTierStatus, getTierByLevel, TIERS, TierItem } from '@/utils/tiers';

export interface GachaPublicReward {
  id: number;
  tier_level?: number;
  category: 'VIP' | 'MI-CASH' | 'OTHERS';
  vip_type?: string | null;
  name: string;
  description?: string | null;
  image_url?: string | null;
  drop_rate: number;
  point_cost: number;
  stock: number;
  available_vouchers?: number;
}

export interface GachaMemberInfo {
  id: number;
  member_code: string;
  name: string;
  nickname: string;
  avatar?: string | null;
  domisili: string;
  net_meetup_points: number;
  total_hadir: number;
  total_spent: number;
  available_points: number;
  total_exp?: number;
  tier_level?: number;
  tier_name?: string;
  tier_badge?: string;
  tier_color?: string;
  is_gacha_unlocked?: boolean;
  remaining_exp_to_unlock?: number;
  remaining_exp_to_next?: number;
  progress_percentage?: number;
  unlocked_levels?: number[];
  next_tier_name?: string | null;
  next_tier_exp?: number | null;
}

export interface GachaRollResult {
  roll_index: number;
  is_zonk: boolean;
  reward_id?: number | null;
  reward_name: string;
  reward_category: string;
  vip_type?: string | null;
  image_url?: string | null;
  claim_ticket_code: string;
  claim_status: string;
  voucher_code?: string | null;
  voucher_password?: string | null;
}

export function useGacha() {
  const toast = useToast();
  const memberCodeInput = ref(
    typeof window !== 'undefined' ? localStorage.getItem('xfive_gacha_member_code') || '' : ''
  );
  const secretCodeInput = ref('');
  const sessionToken = ref(
    typeof window !== 'undefined' ? sessionStorage.getItem('xfive_gacha_token') || '' : ''
  );
  
  const getInitialMemberInfo = (): GachaMemberInfo | null => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('xfive_gacha_member');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const memberInfo = ref<GachaMemberInfo | null>(getInitialMemberInfo());

  const isAuthenticated = computed(() => Boolean(sessionToken.value && memberInfo.value));

  const loadingMember = ref(false);
  const memberError = ref('');

  const rewards = ref<GachaPublicReward[]>([]);
  const totalRewardRate = ref(0);
  const zonkRate = ref(100);
  const loadingRewards = ref(false);

  const eventSettings = ref({
    is_active: true,
    event_title: 'XFIVE EXCLUSIVE GACHA EVENT',
    event_subtitle: 'Tukarkan Poin Kehadiran Meetup Anda untuk memutar Gacha!',
    banner_url: '',
    points_per_roll: 1,
    start_date: '',
    end_date: '',
    how_to_play: '',
  });

  const myHistory = ref<any[]>([]);
  const loadingHistory = ref(false);

  const isRolling = ref(false);
  const rollResults = ref<GachaRollResult[]>([]);
  const showResultModal = ref(false);
  const skipAnimation = ref(
    typeof window !== 'undefined' ? localStorage.getItem('xfive_gacha_skip_anim') === 'true' : false
  );

  const selectedTierLevel = ref<number>(1);

  const memberTierStatus = computed<MemberTierStatus>(() => {
    return calculateMemberTier(memberInfo.value?.total_exp || 0);
  });

  const setSelectedTierLevel = (lvl: number) => {
    selectedTierLevel.value = lvl;
    fetchRewards(lvl);
  };

  const setSkipAnimation = (val: boolean) => {
    skipAnimation.value = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('xfive_gacha_skip_anim', val ? 'true' : 'false');
    }
  };

  // 1. Fetch Event Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/v1/gacha/settings');
      const data = await res.json();
      if (data.success && data.data) {
        eventSettings.value = {
          ...data.data,
          is_active: Boolean(data.data.is_active),
        };
      }
    } catch (err) {
      console.error('Failed to fetch gacha settings:', err);
    }
  };

  // 2. Fetch Rewards & Rates (Sesuai Tier Level)
  const fetchRewards = async (tierLevelOverride?: number) => {
    loadingRewards.value = true;
    try {
      const lvl = tierLevelOverride !== undefined ? tierLevelOverride : (selectedTierLevel.value || 1);
      const res = await fetch(`/api/v1/gacha/rewards?tier_level=${lvl}`);
      const data = await res.json();
      if (data.success && data.data) {
        rewards.value = data.data.rewards || [];
        totalRewardRate.value = data.data.total_reward_rate || 0;
        zonkRate.value = data.data.zonk_rate || 100;
      }
    } catch (err) {
      console.error('Failed to fetch gacha rewards:', err);
    } finally {
      loadingRewards.value = false;
    }
  };

  // 3. Login & Authenticate Member with Member Code & unique_code_edit
  const loginMember = async (codeOverride?: string, secretOverride?: string) => {
    const code = (codeOverride || memberCodeInput.value || '').trim();
    const secret = (secretOverride || secretCodeInput.value || '').trim();

    if (!code) {
      memberError.value = 'Silakan masukkan Member Code Anda.';
      return false;
    }

    if (!secret) {
      memberError.value = 'Silakan masukkan Kode Rahasia Member (unique_code_edit) Anda.';
      return false;
    }

    loadingMember.value = true;
    memberError.value = '';

    try {
      const res = await fetch('/api/v1/gacha/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_code: code,
          unique_code_edit: secret,
        }),
      });

      const data = await res.json();

      if (data.success && data.token && data.data) {
        sessionToken.value = data.token;
        memberInfo.value = data.data;
        memberCodeInput.value = data.data.member_code;
        secretCodeInput.value = ''; // Kosongkan input secret di form

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('xfive_gacha_token', data.token);
          sessionStorage.setItem('xfive_gacha_member', JSON.stringify(data.data));
          localStorage.setItem('xfive_gacha_member_code', data.data.member_code);
        }

        await fetchMyHistory();
        return true;
      } else {
        memberError.value = data.message || 'Autentikasi gagal. Periksa kembali data Anda.';
        return false;
      }
    } catch (err: any) {
      memberError.value = 'Terjadi gangguan jaringan saat memverifikasi akun Anda.';
      return false;
    } finally {
      loadingMember.value = false;
    }
  };

  // 4. Logout Member
  const logoutMember = () => {
    sessionToken.value = '';
    memberInfo.value = null;
    secretCodeInput.value = '';
    myHistory.value = [];
    memberError.value = '';

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('xfive_gacha_token');
      sessionStorage.removeItem('xfive_gacha_member');
    }
  };

  // 5. Fetch Member History (Authenticated with Session Token)
  const fetchMyHistory = async () => {
    if (!sessionToken.value) return;

    loadingHistory.value = true;
    try {
      const res = await fetch('/api/v1/gacha/history', {
        headers: {
          Authorization: `Bearer ${sessionToken.value}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        myHistory.value = data.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch gacha history:', err);
    } finally {
      loadingHistory.value = false;
    }
  };

  // 6. Execute Gacha Roll (1x, 5x, 10x) - Protected by Session Token & Tier Level
  const rollGacha = async (rollCount: 1 | 5 | 10, tierLevelOverride?: number) => {
    if (!isAuthenticated.value || !sessionToken.value || !memberInfo.value) {
      toast.warning('Silakan login dan verifikasi akun Anda terlebih dahulu.', 'Perlu Autentikasi');
      return null;
    }

    const targetTier = tierLevelOverride || selectedTierLevel.value || 1;

    // 1. Cek Syarat Pembuka Gacha (Minimal 10 EXP untuk Level 1 Bronze)
    if (!memberTierStatus.value.isGachaUnlocked) {
      toast.warning(
        `Gacha masih terkunci. Anda membutuhkan minimal 10 EXP untuk membuka Gacha Bronze. Kumpulkan ${memberTierStatus.value.remainingExpToUnlock} EXP lagi melalui kehadiran Meetup!`,
        'Gacha Terkunci'
      );
      return null;
    }

    // 2. Cek Apakah Tier Terpilih Sudah Ter-unlock
    if (!memberTierStatus.value.unlockedLevels.includes(targetTier)) {
      const tierData = getTierByLevel(targetTier);
      toast.warning(
        `Tingkatan Tier ${tierData?.name || targetTier} belum terbuka untuk akun Anda. Kumpulkan EXP lebih banyak untuk membuka tier ini!`,
        'Tier Belum Terbuka'
      );
      return null;
    }

    const cost = rollCount * (eventSettings.value.points_per_roll || 1);
    if (memberInfo.value.available_points < cost) {
      toast.warning(`Poin Anda (${memberInfo.value.available_points}) tidak mencukupi untuk melakukan roll ${rollCount}x (butuh ${cost} poin).`, 'Poin Tidak Cukup');
      return null;
    }

    isRolling.value = true;
    try {
      const res = await fetch('/api/v1/gacha/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken.value}`,
        },
        body: JSON.stringify({
          roll_count: rollCount,
          tier_level: targetTier,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        logoutMember();
        toast.error(data.message || 'Sesi login telah berakhir. Silakan verifikasi ulang akun Anda.', 'Sesi Berakhir');
        return null;
      }

      if (!data.success) {
        toast.error(data.message || 'Gagal melakukan gacha roll.', 'Roll Gagal');
        return null;
      }

      rollResults.value = data.data.rolls || [];
      if (data.data.member) {
        memberInfo.value = data.data.member;
      } else if (memberInfo.value) {
        memberInfo.value.available_points = data.data.remaining_points;
      }

      if (typeof window !== 'undefined' && memberInfo.value) {
        sessionStorage.setItem('xfive_gacha_member', JSON.stringify(memberInfo.value));
      }

      // Delay if animation is not skipped
      if (!skipAnimation.value) {
        await new Promise((resolve) => setTimeout(resolve, 2200));
      }

      showResultModal.value = true;
      await fetchMyHistory();
      return data.data.rolls;
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem saat roll gacha.', 'Kesalahan Sistem');
      return null;
    } finally {
      isRolling.value = false;
    }
  };

  return {
    memberCodeInput,
    secretCodeInput,
    sessionToken,
    memberInfo,
    isAuthenticated,
    loadingMember,
    memberError,
    rewards,
    totalRewardRate,
    zonkRate,
    loadingRewards,
    eventSettings,
    myHistory,
    loadingHistory,
    selectedTierLevel,
    setSelectedTierLevel,
    memberTierStatus,
    TIERS,
    isRolling,
    rollResults,
    showResultModal,
    skipAnimation,
    setSkipAnimation,
    fetchSettings,
    fetchRewards,
    loginMember,
    logoutMember,
    fetchMyHistory,
    rollGacha,
  };
}
