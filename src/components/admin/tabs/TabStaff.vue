<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Crown,
  UserPlus,
  Users,
  Shield,
  Award,
  Search,
  RefreshCw,
  UserCheck,
  Trash2
} from 'lucide-vue-next';
import SearchableSelect from '../../SearchableSelect.vue';
import { useAdminStaff, type AdminStaffItem } from '../../../composables/admin/useAdminStaff';
import { useToast } from '../../../composables/useToast';
import { useConfirm } from '../../../composables/useConfirm';
import {
  TESTER_ROSTER,
  normalizeTesterToCode,
  getTesterDisplayName
} from '../../../data/testers';

const props = defineProps<{
  members: any[];
}>();

const emit = defineEmits<{
  (e: 'staffChanged'): void;
}>();

const toast = useToast();
const { confirm: confirmModal } = useConfirm();
const { staffList, loadingStaff, fetchStaff, promoteStaff, removeStaff } = useAdminStaff();

const staffSearch = ref('');
const staffModalOpen = ref(false);
const isSubmittingStaff = ref(false);
const staffError = ref('');

const staffForm = reactive({
  member_code: '',
  username: '',
  password: '',
  role: 'staff_tester' as 'superadmin' | 'leader' | 'vice_leader' | 'staff_tester' | 'staff_meet',
  tester_name: 'Ramsky',
  title: 'Staff Tester',
  category: 'dewan staff',
});

onMounted(() => {
  if (staffList.value.length === 0) {
    fetchStaff();
  }
});

const filteredStaffList = computed(() => {
  if (!staffSearch.value.trim()) return staffList.value;
  const q = staffSearch.value.toLowerCase().trim();
  return staffList.value.filter(
    (s) =>
      (s.username && s.username.toLowerCase().includes(q)) ||
      (s.member_nickname && s.member_nickname.toLowerCase().includes(q)) ||
      (s.member_name && s.member_name.toLowerCase().includes(q)) ||
      (s.role && s.role.toLowerCase().includes(q)) ||
      (s.tester_name && s.tester_name.toLowerCase().includes(q))
  );
});

const staffMemberCandidates = computed(() => {
  return props.members.map((m) => ({
    id: m.member_code || String(m.id),
    name: `${m.nickname} — ${m.name} (${m.member_code || 'Tanpa Kode'}) [${m.category || 'Member'}]`,
    member: m,
  }));
});

const testerOptions = computed(() => {
  return TESTER_ROSTER.map((t) => ({
    id: t.code,
    name: `${t.name} (${t.nickname})`,
  }));
});

const openPromoteStaffModal = () => {
  staffError.value = '';
  staffForm.member_code = '';
  staffForm.username = '';
  staffForm.password = '';
  staffForm.role = 'staff_tester';
  staffForm.tester_name = TESTER_ROSTER[0].code;
  staffForm.title = 'Staff Tester';
  staffForm.category = 'dewan staff';
  staffModalOpen.value = true;
};

const onStaffMemberSelect = (val?: string | number) => {
  if (val) {
    staffForm.member_code = String(val);
  }
  const m = props.members.find(
    (item) => item.member_code === staffForm.member_code || String(item.id) === staffForm.member_code
  );
  if (m) {
    if (m.member_code) {
      staffForm.member_code = m.member_code;
    }
    const cleanNick = (m.nickname || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!staffForm.username) {
      staffForm.username = cleanNick || `staff_${m.id}`;
    }
    const testerCode = normalizeTesterToCode(m.member_code) || normalizeTesterToCode(m.nickname);
    if (testerCode && TESTER_ROSTER.some((t) => t.code === testerCode)) {
      staffForm.tester_name = testerCode;
    } else if (m.member_code) {
      staffForm.tester_name = m.member_code;
    }
  }
};

const onStaffRoleChange = () => {
  switch (staffForm.role) {
    case 'superadmin':
      staffForm.title = 'Owner';
      staffForm.category = 'dewan staff';
      staffForm.tester_name = '';
      break;
    case 'leader':
      staffForm.title = 'Leader';
      staffForm.category = 'dewan staff';
      staffForm.tester_name = '';
      break;
    case 'vice_leader':
      staffForm.title = 'Vice Leader';
      staffForm.category = 'dewan staff';
      staffForm.tester_name = '';
      break;
    case 'staff_tester':
      staffForm.title = 'Staff Tester';
      staffForm.category = 'dewan staff';
      if (!staffForm.tester_name) staffForm.tester_name = TESTER_ROSTER[0].code;
      break;
    case 'staff_meet':
      staffForm.title = 'Staff Meetup';
      staffForm.category = 'dewan staff';
      staffForm.tester_name = '';
      break;
  }
};

const submitStaffPromotion = async () => {
  staffError.value = '';
  if (!staffForm.member_code) {
    staffError.value = 'Silakan pilih member yang ingin diangkat.';
    return;
  }
  if (!staffForm.username.trim()) {
    staffError.value = 'Username login admin wajib diisi.';
    return;
  }
  if (staffForm.role === 'staff_tester' && !staffForm.tester_name) {
    staffError.value = 'Staff tester wajib memilih nama tester penguji.';
    return;
  }

  isSubmittingStaff.value = true;
  const res = await promoteStaff({
    member_code: staffForm.member_code,
    username: staffForm.username.trim(),
    password: staffForm.password ? staffForm.password.trim() : undefined,
    role: staffForm.role,
    tester_name: staffForm.role === 'staff_tester' ? staffForm.tester_name : null,
    title: staffForm.title,
    category: staffForm.category,
  });

  if (res.success) {
    staffModalOpen.value = false;
    emit('staffChanged');
    toast.success(res.message || 'Berhasil mengangkat staff!', 'Staff Baru Ditambahkan');
  } else {
    staffError.value = res.message || 'Gagal menyimpan data staff.';
  }
  isSubmittingStaff.value = false;
};

const demoteStaff = async (staff: AdminStaffItem) => {
  if (staff.id === 1 || staff.username === 'admin') {
    toast.warning('Akun Superadmin Utama (ID 1) tidak dapat dicopot atau dihapus!', 'Tindakan Ditolak');
    return;
  }

  const ok = await confirmModal({
    title: 'COPOT JABATAN DEWAN STAFF',
    message: `Apakah Anda yakin ingin mencopot jabatan ${staff.member_nickname || staff.username} dari dewan staff?\nAkun admin akan dihapus dan kategori member akan dikembalikan ke member biasa.`,
    confirmText: 'Ya, Copot Jabatan',
    cancelText: 'Batal',
    type: 'danger',
  });
  if (!ok) return;

  const res = await removeStaff(staff.id);
  if (res.success) {
    emit('staffChanged');
    toast.success('Jabatan staff berhasil dicopot.', 'Staff Dicopot');
  } else {
    toast.error(res.message || 'Gagal mencopot jabatan staff.', 'Gagal');
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="rounded-2xl border border-pink-500/20 bg-[#0c121e]/80 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <Crown class="w-5 h-5 text-pink-400" />
          <h3 class="text-base font-bold font-orbitron text-pink-400">
            MANAJEMEN DEWAN STAFF &amp; HAK AKSES PANEL
          </h3>
        </div>
        <p class="text-xs text-gray-400 font-mono mt-1">
          Wewenang eksklusif Superadmin (Owner): Angkat member jadi dewan staff, tentukan role, tester roster, dan buat akun login.
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <button
          @click="openPromoteStaffModal"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-orbitron font-bold text-xs tracking-wider uppercase transition shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
        >
          <UserPlus class="w-4 h-4" />
          <span>Angkat Member Jadi Staff</span>
        </button>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 p-4 relative overflow-hidden">
        <span class="text-[11px] font-orbitron uppercase tracking-wider text-gray-400">Total Akun Admin</span>
        <div class="text-2xl font-extrabold font-orbitron text-white mt-1">{{ staffList.length }}</div>
        <Users class="absolute right-3 bottom-2 w-12 h-12 text-white/5" />
      </div>

      <div class="rounded-2xl border border-pink-500/20 bg-[#0c121e]/80 p-4 relative overflow-hidden">
        <span class="text-[11px] font-orbitron uppercase tracking-wider text-pink-400">Superadmin (Owner)</span>
        <div class="text-2xl font-extrabold font-orbitron text-pink-300 mt-1">
          {{ staffList.filter((s) => s.role === 'superadmin').length }}
        </div>
        <Crown class="absolute right-3 bottom-2 w-12 h-12 text-pink-500/10" />
      </div>

      <div class="rounded-2xl border border-amber-500/20 bg-[#0c121e]/80 p-4 relative overflow-hidden">
        <span class="text-[11px] font-orbitron uppercase tracking-wider text-amber-400">Leader &amp; Vice</span>
        <div class="text-2xl font-extrabold font-orbitron text-amber-300 mt-1">
          {{ staffList.filter((s) => s.role === 'leader' || s.role === 'vice_leader').length }}
        </div>
        <Shield class="absolute right-3 bottom-2 w-12 h-12 text-amber-500/10" />
      </div>

      <div class="rounded-2xl border border-cyan-500/20 bg-[#0c121e]/80 p-4 relative overflow-hidden">
        <span class="text-[11px] font-orbitron uppercase tracking-wider text-cyan-400">Staff Tester &amp; Meet</span>
        <div class="text-2xl font-extrabold font-orbitron text-cyan-300 mt-1">
          {{ staffList.filter((s) => s.role === 'staff_tester' || s.role === 'staff_meet').length }}
        </div>
        <Award class="absolute right-3 bottom-2 w-12 h-12 text-cyan-500/10" />
      </div>
    </div>

    <!-- Staff Table -->
    <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 overflow-hidden">
      <div class="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="relative w-full sm:w-72">
          <Search class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="staffSearch"
            type="text"
            placeholder="Cari admin, nickname, role, tester..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-gray-800 focus:border-pink-500 text-white text-xs outline-none font-mono"
          />
        </div>

        <div class="text-xs text-gray-400 font-mono">
          Menampilkan {{ filteredStaffList.length }} dari {{ staffList.length }} Akun Staff
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs min-w-[700px]">
          <thead>
            <tr class="border-b border-white/5 text-gray-400 font-orbitron text-[10px] tracking-wider uppercase bg-black/40">
              <th class="py-3 px-4">Member XFIVE Terkait</th>
              <th class="py-3 px-4">Username Login</th>
              <th class="py-3 px-4">Role Sistem</th>
              <th class="py-3 px-4">Tester Roster (OT)</th>
              <th class="py-3 px-4">Jabatan Member</th>
              <th class="py-3 px-4">Dibuat Pada</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-if="loadingStaff">
              <td colspan="7" class="text-center py-12 text-gray-400 font-mono">
                <RefreshCw class="w-5 h-5 animate-spin mx-auto mb-2 text-pink-400" />
                Memuat daftar dewan staff...
              </td>
            </tr>
            <tr v-else-if="filteredStaffList.length === 0">
              <td colspan="7" class="text-center py-12 text-gray-500 font-mono">
                Tidak ada data staff yang cocok dengan pencarian.
              </td>
            </tr>
            <tr
              v-for="s in filteredStaffList"
              :key="s.id"
              class="hover:bg-white/[0.02] transition"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-2.5">
                  <img
                    :src="s.member_avatar || '/img/default-avatar.png'"
                    class="w-8 h-8 rounded-full object-cover border border-pink-500/30"
                  />
                  <div class="min-w-0">
                    <div class="font-bold text-white font-orbitron truncate">
                      {{ s.member_nickname || '(Akun Sistem)' }}
                    </div>
                    <div class="text-[10px] text-gray-400 font-mono truncate">
                      {{ s.member_code || s.member_name || '-' }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-cyan-300 font-mono text-[11px] font-bold">
                  {{ s.username }}
                </span>
              </td>

              <td class="py-3 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-orbitron uppercase border"
                  :class="{
                    'bg-pink-950/80 border-pink-500 text-pink-300': s.role === 'superadmin',
                    'bg-amber-950/80 border-amber-500 text-amber-300': s.role === 'leader',
                    'bg-yellow-950/80 border-yellow-500 text-yellow-300': s.role === 'vice_leader',
                    'bg-cyan-950/80 border-cyan-500 text-cyan-300': s.role === 'staff_tester',
                    'bg-purple-950/80 border-purple-500 text-purple-300': s.role === 'staff_meet',
                  }"
                >
                  {{ s.role.replace('_', ' ') }}
                </span>
              </td>

              <td class="py-3 px-4">
                <span
                  v-if="s.tester_name"
                  class="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono text-[11px] font-bold flex items-center gap-1 w-fit"
                >
                  <UserCheck class="w-3 h-3 text-purple-400" />
                  {{ getTesterDisplayName(s.tester_name) }}
                </span>
                <span v-else class="text-gray-600 font-mono text-xs">-</span>
              </td>

              <td class="py-3 px-4 text-gray-300 font-mono text-xs">
                <div>{{ s.member_title || '-' }}</div>
                <div class="text-[10px] text-gray-500 uppercase">{{ s.member_category || '-' }}</div>
              </td>

              <td class="py-3 px-4 text-gray-400 font-mono text-[11px]">
                {{ s.created_at ? s.created_at.slice(0, 10) : '-' }}
              </td>

              <td class="py-3 px-4 text-right">
                <span
                  v-if="s.id === 1 || s.username === 'admin'"
                  class="px-2 py-1 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 text-[10px] font-orbitron font-bold uppercase"
                >
                  ROOT OWNER
                </span>
                <button
                  v-else
                  @click="demoteStaff(s)"
                  class="px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                  title="Copot jabatan &amp; hapus akun admin"
                >
                  <Trash2 class="w-3 h-3" />
                  <span>Copot Jabatan</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Angkat Member Menjadi Dewan Staff -->
    <div
      v-if="staffModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      @click.self="staffModalOpen = false"
    >
      <div class="rounded-2xl border border-pink-500/40 bg-[#0d121c] p-3.5 sm:p-6 w-full max-w-lg shadow-[0_0_50px_rgba(244,63,94,0.2)] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-4 sm:mb-5">
          <div class="flex items-center gap-2.5 text-pink-400">
            <Crown class="w-5 h-5 text-pink-400 shrink-0" />
            <h3 class="font-bold font-orbitron text-sm sm:text-lg text-white">ANGKAT MEMBER JADI STAFF</h3>
          </div>
          <button @click="staffModalOpen = false" class="text-gray-400 hover:text-white cursor-pointer text-sm sm:text-base">✕</button>
        </div>

        <form @submit.prevent="submitStaffPromotion" class="space-y-4">
          <div>
            <label class="block text-xs uppercase tracking-wider text-pink-300 mb-1.5 font-orbitron font-bold">
              Pilih Member *
            </label>
            <SearchableSelect
              v-model="staffForm.member_code"
              :options="staffMemberCandidates"
              label="Member"
              placeholder="-- Cari Nickname / Nama / Member Code --"
              :icon="Users"
              @change="onStaffMemberSelect"
            />
            <p class="text-[10px] text-gray-400 font-mono mt-1">Cari dan pilih anggota komunitas yang akan diberi jabatan dan akun admin.</p>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-pink-300 mb-1 font-orbitron font-bold">
              Role &amp; Hak Akses Panel *
            </label>
            <select
              v-model="staffForm.role"
              @change="onStaffRoleChange"
              class="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-pink-500 text-white text-xs outline-none font-bold"
            >
              <option value="staff_tester" class="bg-[#0c121e] text-cyan-300">Staff Tester (Database, Blacklist, Verifikasi)</option>
              <option value="staff_meet" class="bg-[#0c121e] text-purple-300">Staff Meetup (Khusus Acara &amp; Presensi Meetup)</option>
              <option value="vice_leader" class="bg-[#0c121e] text-yellow-300">Vice Leader (Semua Fitur Operasional)</option>
              <option value="leader" class="bg-[#0c121e] text-amber-300">Leader (Semua Fitur Operasional)</option>
              <option value="superadmin" class="bg-[#0c121e] text-pink-400">Superadmin (Owner - Akses Penuh)</option>
            </select>
          </div>

          <div v-if="staffForm.role === 'staff_tester'" class="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
            <label class="block text-xs uppercase tracking-wider text-cyan-300 font-orbitron font-bold flex items-center gap-1.5">
              <UserCheck class="w-3.5 h-3.5 text-cyan-400" />
              Nama Tester di Roster Registrasi *
            </label>
            <SearchableSelect
              v-model="staffForm.tester_name"
              :options="testerOptions"
              label="Tester"
              placeholder="-- Cari &amp; Pilih Tester --"
              :icon="UserCheck"
            />
            <p class="text-[10px] text-gray-400 font-mono leading-relaxed">
              Staff tester ini hanya akan memiliki wewenang mengelola (hapus, blacklist, toggle full edit) member yang diuji/di-OT atas nama ini.
            </p>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-orbitron">
              Judul Jabatan (Title)
            </label>
            <input
              v-model="staffForm.title"
              type="text"
              placeholder="Contoh: Staff Tester, Event Coordinator, Leader"
              class="w-full px-3 py-2 rounded-xl bg-black/60 border border-gray-800 focus:border-pink-500 text-white text-xs outline-none"
            />
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-orbitron">
              Username Login Admin Panel *
            </label>
            <input
              v-model="staffForm.username"
              type="text"
              placeholder="Contoh: ramsky, fadel_tester"
              class="w-full px-3 py-2 rounded-xl bg-black/60 border border-gray-800 focus:border-pink-500 text-white text-xs outline-none font-mono"
              required
            />
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-orbitron">
              Password Login Admin Panel *
            </label>
            <input
              v-model="staffForm.password"
              type="password"
              placeholder="Minimal 6 karakter rahasia"
              class="w-full px-3 py-2 rounded-xl bg-black/60 border border-gray-800 focus:border-pink-500 text-white text-xs outline-none font-mono"
            />
            <p class="text-[10px] text-gray-400 font-mono mt-1">Kosongkan jika akun sudah ada dan tidak ingin mengganti password.</p>
          </div>

          <div v-if="staffError" class="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono">
            {{ staffError }}
          </div>

          <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              @click="staffModalOpen = false"
              class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-800 hover:bg-white/5 text-gray-400 text-xs font-orbitron transition cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmittingStaff"
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw v-if="isSubmittingStaff" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSubmittingStaff ? 'Menyimpan...' : 'Angkat & Simpan Akun' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
