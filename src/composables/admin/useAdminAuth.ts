import { ref, reactive, computed } from 'vue';
import { adminClient } from '@/utils/admin/adminApi';

export type AdminRole = '' | 'superadmin' | 'owner' | 'leader' | 'vice_leader' | 'staff_tester' | 'staff_meet' | 'admin';

export type AdminTab =
  | 'dashboard'
  | 'members'
  | 'blacklist'
  | 'faq'
  | 'verify'
  | 'meetup'
  | 'gallery'
  | 'staff'
  | 'articles'
  | 'registrations'
  | 'gacha';

const isLoggedIn = ref(false);
const isCheckingAuth = ref(true);
const loginLoading = ref(false);
const loginError = ref('');

const currentUser = reactive({
  username: '',
  role: '' as AdminRole,
  tester_name: '',
});

const populateCurrentUser = (data: any, fallbackUsername = '') => {
  if (!data) {
    currentUser.username = '';
    currentUser.role = '';
    currentUser.tester_name = '';
    return;
  }
  const u = data.user;
  const usernameVal = (typeof u === 'object' && u ? u.username : (u || data.username || fallbackUsername || '')).trim();
  const roleVal = ((typeof u === 'object' && u ? u.role : '') || data.role || '').toLowerCase().trim();
  const testerVal = ((typeof u === 'object' && u ? u.tester_name : '') || data.tester_name || '').trim();

  currentUser.username = usernameVal;
  currentUser.role = roleVal as AdminRole;
  currentUser.tester_name = testerVal;
};

export function useAdminAuth() {
  const isSuperAdmin = computed(() => currentUser.role === 'superadmin' || currentUser.role === 'owner');

  const isLeadershipOrSuperadmin = computed(() => {
    const r = currentUser.role;
    return r === 'superadmin' || r === 'owner' || r === 'leader' || r === 'vice_leader' || r === 'admin';
  });

  const canAccessRegistrations = computed(() => isLeadershipOrSuperadmin.value);

  const canAccessStaff = computed(() => isSuperAdmin.value);

  const allowedTabs = computed<AdminTab[]>(() => {
    const role = (currentUser.role || '').toLowerCase();
    if (role === 'superadmin' || role === 'owner' || role === 'admin') {
      return ['dashboard', 'members', 'blacklist', 'faq', 'meetup', 'gallery', 'verify', 'articles', 'staff', 'registrations', 'gacha'];
    }
    if (role === 'leader' || role === 'vice_leader' || role === 'vice') {
      return ['dashboard', 'members', 'blacklist', 'faq', 'meetup', 'gallery', 'verify', 'articles', 'registrations', 'gacha'];
    }
    if (role === 'staff_tester') {
      return ['members', 'blacklist', 'verify'];
    }
    if (role === 'staff_meet') {
      return ['meetup', 'gallery'];
    }
    return [];
  });

  const checkSession = async () => {
    isCheckingAuth.value = true;
    try {
      const res = await adminClient.get('/api/v1/auth/verify');
      if (res.data?.success || res.data?.authenticated) {
        isLoggedIn.value = true;
        populateCurrentUser(res.data);
        localStorage.setItem('xfive_admin_logged', 'true');
        return true;
      } else {
        logoutLocal();
        return false;
      }
    } catch {
      logoutLocal();
      return false;
    } finally {
      isCheckingAuth.value = false;
    }
  };

  const login = async (usernameVal: string, passwordVal: string, turnstileTokenVal?: string) => {
    loginError.value = '';
    if (!usernameVal || !passwordVal) {
      loginError.value = 'Username dan password wajib diisi.';
      return false;
    }

    loginLoading.value = true;
    try {
      const res = await adminClient.post('/api/v1/auth/login', {
        username: usernameVal.trim(),
        password: passwordVal,
        turnstileToken: turnstileTokenVal || '',
      });

      if (res.data?.success) {
        isLoggedIn.value = true;
        populateCurrentUser(res.data, usernameVal);
        localStorage.setItem('xfive_admin_logged', 'true');
        if (res.data?.token) {
          localStorage.setItem('xfive_admin_token', res.data.token);
        }
        return true;
      } else {
        loginError.value = res.data?.message || 'Login gagal. Periksa username dan password.';
        return false;
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        loginError.value = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        loginError.value = 'Gagal terhubung ke server backend API. Pastikan server backend sedang aktif.';
      } else {
        loginError.value = 'Gagal login. Username atau password salah.';
      }
      return false;
    } finally {
      loginLoading.value = false;
    }
  };

  const logoutLocal = () => {
    isLoggedIn.value = false;
    populateCurrentUser(null);
    localStorage.removeItem('xfive_admin_logged');
    localStorage.removeItem('xfive_admin_token');
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'nf_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const logout = async () => {
    try {
      await adminClient.post('/api/v1/auth/logout');
    } catch {}
    logoutLocal();
  };

  return {
    isLoggedIn,
    isCheckingAuth,
    loginLoading,
    loginError,
    currentUser,
    allowedTabs,
    isSuperAdmin,
    isLeadershipOrSuperadmin,
    canAccessRegistrations,
    canAccessStaff,
    checkSession,
    login,
    logout
  };
}
