<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Search,
  History,
  RefreshCw,
  UserCheck,
  Check,
  Copy,
  Camera,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ZoomIn,
  Users,
  ExternalLink,
  Download,
  AlertTriangle,
  X
} from 'lucide-vue-next';
import { useAdminMembers, type Member, type HistoricalRecord } from '@/composables/admin/useAdminMembers';
import { useAdminAuth } from '@/composables/admin/useAdminAuth';
import { useToast } from '@/composables/useToast';
import { getTesterDisplayName } from '@/data/testers';
import ModalNicknameHistory from '@/components/admin/modals/ModalNicknameHistory.vue';

const props = defineProps<{
  members: Member[];
  loadingMembers: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const toast = useToast();
const { currentUser } = useAdminAuth();
const {
  deleteMember,
  toggleEditPermission,
  fetchHistory,
  canManageMember: checkCanManage,
} = useAdminMembers();

const memberSearch = ref('');
const roleFilter = ref('all');
const domisiliFilter = ref('all');
const currentPage = ref(1);
const perPage = ref(15);
const copiedCode = ref<string | null>(null);

const photoVerificationModalOpen = ref(false);
const selectedMemberForPhoto = ref<Member | null>(null);
const lightboxImage = ref<string | null>(null);

const deleteMemberModalOpen = ref(false);
const memberToDelete = ref<Member | null>(null);
const isDeletingMember = ref(false);
const deleteError = ref('');
const updatingPermissionCode = ref<string | null>(null);

const historyModalOpen = ref(false);
const historySearch = ref('');

const uniqueDomisiliList = computed(() => {
  const set = new Set<string>();
  props.members.forEach((m) => {
    if (m.domisili && m.domisili.trim() && m.domisili !== '-') {
      set.add(m.domisili.trim());
    }
  });
  return Array.from(set).sort();
});

const filteredMembers = computed(() => {
  let list = props.members;

  if (roleFilter.value !== 'all') {
    list = list.filter((m) => (m.category || '').toLowerCase() === roleFilter.value.toLowerCase());
  }

  if (domisiliFilter.value !== 'all') {
    list = list.filter((m) => (m.domisili || '').toLowerCase() === domisiliFilter.value.toLowerCase());
  }

  if (memberSearch.value.trim()) {
    const q = memberSearch.value.toLowerCase().trim();
    list = list.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.nickname && m.nickname.toLowerCase().includes(q)) ||
        (m.member_code && m.member_code.toLowerCase().includes(q)) ||
        (m.unique_code_edit && m.unique_code_edit.toLowerCase().includes(q)) ||
        (m.domisili && m.domisili.toLowerCase().includes(q))
    );
  }

  return list;
});

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / perPage.value) || 1);

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredMembers.value.slice(start, start + perPage.value);
});

const canManage = (m: Member) => {
  return checkCanManage(m, currentUser);
};

const openPhotoVerificationModal = (m: Member) => {
  selectedMemberForPhoto.value = m;
  photoVerificationModalOpen.value = true;
};

const promptDeleteMember = (m: Member) => {
  memberToDelete.value = m;
  deleteError.value = '';
  deleteMemberModalOpen.value = true;
};

const confirmDeleteMember = async () => {
  if (!memberToDelete.value || !memberToDelete.value.member_code) return;
  isDeletingMember.value = true;
  deleteError.value = '';

  const res = await deleteMember(memberToDelete.value.member_code);
  if (res.success) {
    deleteMemberModalOpen.value = false;
    memberToDelete.value = null;
    emit('refresh');
    toast.success('Data member berhasil dihapus.', 'Berhasil');
  } else {
    deleteError.value = res.message || 'Gagal menghapus member.';
  }
  isDeletingMember.value = false;
};

const handleToggleEditPermission = async (m: Member) => {
  if (!canManage(m)) return;
  updatingPermissionCode.value = m.member_code;
  const res = await toggleEditPermission(m);
  if (res.success) {
    toast.success(res.message || 'Izin edit diperbarui.', 'Izin Profil');
  } else {
    toast.error(res.message || 'Gagal memperbarui izin edit member.', 'Akses Ditolak');
  }
  updatingPermissionCode.value = null;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  copiedCode.value = text;
  toast.info(`Kode ${text} disalin ke clipboard!`, 'Tersalin');
  setTimeout(() => {
    if (copiedCode.value === text) copiedCode.value = null;
  }, 2000);
};

const openHistoryModal = (memberCode?: string) => {
  historySearch.value = memberCode || '';
  historyModalOpen.value = true;
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Filters & Search -->
    <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
      <div class="flex flex-wrap gap-2 w-full md:w-auto flex-1">
        <div class="relative flex-1 min-w-[200px]">
          <Search class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="memberSearch"
            type="text"
            placeholder="Cari nama, nickname, member code, edit code, kota..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none font-mono"
          />
        </div>

        <select
          v-model="roleFilter"
          class="px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-gray-300 text-xs outline-none"
        >
          <option value="all">Semua Role</option>
          <option value="dewan staff">Dewan Staff</option>
          <option value="member">Member</option>
        </select>

        <select
          v-model="domisiliFilter"
          class="px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-gray-300 text-xs outline-none max-w-[160px] truncate"
        >
          <option value="all">Semua Domisili</option>
          <option v-for="d in uniqueDomisiliList" :key="d" :value="d">{{ d }}</option>
        </select>

        <button
          @click="openHistoryModal()"
          type="button"
          class="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-orbitron font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(0,255,255,0.08)]"
          title="Lihat seluruh log riwayat member yang mengganti nickname"
        >
          <History class="w-3.5 h-3.5" />
          <span>Riwayat Nickname</span>
        </button>
      </div>

      <div class="text-xs text-gray-400 font-mono whitespace-nowrap">
        Ditemukan <span class="text-cyan-400 font-bold">{{ filteredMembers.length }}</span> member
      </div>
    </div>

    <!-- Members Table -->
    <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse min-w-[750px]">
          <thead class="bg-black/50 text-cyan-400 border-b border-white/5 font-orbitron uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3 px-4">Member</th>
              <th class="py-3 px-4">Tester</th>
              <th class="py-3 px-4">Member Code</th>
              <th class="py-3 px-4">Unique Edit Code</th>
              <th class="py-3 px-4 text-center">Izin Edit Full</th>
              <th class="py-3 px-4">Domisili</th>
              <th class="py-3 px-4">Role</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-sans">
            <tr v-if="props.loadingMembers">
              <td colspan="9" class="text-center py-12 text-gray-500 font-mono">
                <RefreshCw class="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                Memuat data anggota...
              </td>
            </tr>
            <tr v-else-if="paginatedMembers.length === 0">
              <td colspan="9" class="text-center py-12 text-gray-500 font-mono">
                Tidak ada member yang cocok dengan filter pencarian.
              </td>
            </tr>
            <tr
              v-for="m in paginatedMembers"
              :key="m.id"
              class="hover:bg-cyan-500/[0.02] transition"
            >
              <!-- Avatar & Name -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="relative cursor-pointer group shrink-0"
                    @click="openPhotoVerificationModal(m)"
                    title="Klik untuk verifikasi foto sistem vs foto profil"
                  >
                    <img
                      :src="m.avatar || '/img/default-avatar.png'"
                      class="w-9 h-9 rounded-full object-cover border border-cyan-500/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_10px_rgba(0,255,255,0.4)] transition"
                    />
                    <span
                      v-if="m.face_image_path"
                      class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[9px] font-bold border border-black"
                      title="Memiliki data foto verifikasi sistem"
                    >
                      ✓
                    </span>
                  </div>
                  <div>
                    <div class="font-bold text-white font-orbitron">{{ m.nickname }}</div>
                    <div class="text-[10px] text-gray-400">
                      {{ m.name }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Tester -->
              <td class="py-3 px-4">
                <div
                  v-if="m.tester"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-bold"
                  :title="'Penguji / OT: ' + getTesterDisplayName(m.tester)"
                >
                  <UserCheck class="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{{ getTesterDisplayName(m.tester) }}</span>
                </div>
                <span v-else class="text-gray-600 font-mono text-xs">-</span>
              </td>

              <!-- Member Code -->
              <td class="py-3 px-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold">
                  <span>{{ m.member_code || '-' }}</span>
                  <button
                    v-if="m.member_code"
                    @click="copyToClipboard(m.member_code)"
                    class="hover:text-white transition cursor-pointer"
                    title="Salin Member Code"
                  >
                    <Check v-if="copiedCode === m.member_code" class="w-3 h-3 text-emerald-400" />
                    <Copy v-else class="w-3 h-3 text-cyan-400/60" />
                  </button>
                </div>
              </td>

              <!-- Unique Edit Code -->
              <td class="py-3 px-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-fuchsia-950/60 border border-fuchsia-500/30 text-fuchsia-300 font-mono text-[11px] font-bold">
                  <span>{{ m.unique_code_edit || '-' }}</span>
                  <button
                    v-if="m.unique_code_edit"
                    @click="copyToClipboard(m.unique_code_edit)"
                    class="hover:text-white transition cursor-pointer"
                    title="Salin Kunci Edit Profil"
                  >
                    <Check v-if="copiedCode === m.unique_code_edit" class="w-3 h-3 text-emerald-400" />
                    <Copy v-else class="w-3 h-3 text-fuchsia-400/60" />
                  </button>
                </div>
              </td>

              <!-- Izin Edit Full -->
              <td class="py-3 px-4 text-center">
                <div class="inline-flex flex-col items-center">
                  <button
                    @click="canManage(m) ? handleToggleEditPermission(m) : null"
                    :disabled="!canManage(m) || updatingPermissionCode === m.member_code"
                    type="button"
                    class="relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none"
                    :class="[
                      canManage(m) ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
                      m.can_edit_full ? 'bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.6)]' : 'bg-gray-800 border border-gray-700'
                    ]"
                    :title="!canManage(m) ? 'Anda tidak memiliki hak akses mengubah izin member ini' : (m.can_edit_full ? 'Izin Edit Lengkap AKTIF (Klik untuk nonaktifkan)' : 'Hanya Nickname (Klik untuk izinkan edit lengkap)')"
                  >
                    <span
                      class="inline-block h-3.5 w-3.5 transform rounded-full shadow-sm transition-transform duration-200"
                      :class="m.can_edit_full ? 'translate-x-[22px] bg-black' : 'translate-x-1 bg-gray-400'"
                      :style="m.can_edit_full ? 'transform: translateX(22px);' : 'transform: translateX(4px);'"
                    />
                  </button>
                  <span
                    class="text-[9px] font-mono mt-0.5 tracking-tighter"
                    :class="m.can_edit_full ? 'text-cyan-400 font-bold' : 'text-gray-500'"
                  >
                    {{ updatingPermissionCode === m.member_code ? 'UPDATING...' : (m.can_edit_full ? 'FULL EDIT' : 'NICK ONLY') }}
                  </span>
                </div>
              </td>

              <!-- Domisili -->
              <td class="py-3 px-4 text-gray-300 font-mono">
                {{ m.domisili || '-' }}
              </td>

              <!-- Role -->
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold font-orbitron uppercase"
                  :class="m.category === 'dewan staff' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-gray-800 text-gray-400'"
                >
                  {{ m.category || 'Member' }}
                </span>
              </td>

              <!-- Status -->
              <td class="py-3 px-4">
                <span v-if="m.is_blacklisted" class="inline-flex items-center gap-1 text-[11px] text-red-400 font-mono">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span> Sanksi / Out
                </span>
                <span v-else class="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Valid
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right">
                <div class="inline-flex items-center gap-1.5">
                  <button
                    @click="openPhotoVerificationModal(m)"
                    class="px-2 py-1 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Lihat &amp; verifikasi foto sistem vs foto profil"
                  >
                    <Camera class="w-3 h-3 text-purple-400" />
                    <span>Cek Foto</span>
                  </button>

                  <button
                    @click="openHistoryModal(m.member_code)"
                    class="px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Lihat riwayat perubahan nickname member ini"
                  >
                    <History class="w-3 h-3 text-cyan-400" />
                    <span>Riwayat</span>
                  </button>

                  <button
                    v-if="canManage(m)"
                    @click="promptDeleteMember(m)"
                    class="px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Hapus member permanen"
                  >
                    <Trash2 class="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                  <button
                    v-else
                    disabled
                    class="px-2.5 py-1 rounded-lg border border-gray-800 bg-gray-900/40 text-gray-600 text-[11px] font-bold flex items-center gap-1 cursor-not-allowed opacity-40"
                    title="Hanya Superadmin / Tester terkait yang berhak menghapus"
                  >
                    <Trash2 class="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span class="text-gray-400 font-mono">
          Halaman {{ currentPage }} dari {{ totalPages }} ({{ filteredMembers.length }} Total)
        </span>

        <div class="flex items-center gap-1">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-cyan-400 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-cyan-400 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Verifikasi Foto Identitas Member -->
    <Teleport to="body">
      <div
        v-if="photoVerificationModalOpen && selectedMemberForPhoto"
        class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        @click.self="photoVerificationModalOpen = false"
      >
      <div class="rounded-2xl border border-cyan-500/40 bg-[#0d121c] p-3.5 sm:p-6 w-full max-w-4xl shadow-[0_0_50px_rgba(0,255,255,0.15)] max-h-[92vh] flex flex-col">
        <div class="flex items-start justify-between gap-2.5 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
          <div class="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <ShieldCheck class="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold font-orbitron text-xs sm:text-base text-white flex items-center gap-2 leading-tight break-words">
                VERIFIKASI FOTO IDENTITAS MEMBER
              </h3>
              <p class="text-[10px] sm:text-xs text-gray-400 font-mono mt-0.5 break-words">
                <span class="text-cyan-300 font-bold font-orbitron">{{ selectedMemberForPhoto.nickname }}</span>
                <span class="text-gray-500"> ({{ selectedMemberForPhoto.name }})</span>
                • Kode: <span class="text-purple-300">{{ selectedMemberForPhoto.member_code || '-' }}</span>
              </p>
            </div>
          </div>
          <button
            @click="photoVerificationModalOpen = false"
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-700 hover:border-white text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 text-xs sm:text-sm"
          >
            ✕
          </button>
        </div>

        <div class="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-black/50 border border-white/5 font-mono text-xs">
            <div>
              <div class="text-[10px] text-gray-500 uppercase">Domisili</div>
              <div class="text-gray-200 font-semibold truncate">{{ selectedMemberForPhoto.domisili || '-' }}</div>
            </div>
            <div>
              <div class="text-[10px] text-gray-500 uppercase">Role / Kategori</div>
              <div class="text-cyan-300 font-semibold truncate">{{ selectedMemberForPhoto.category || 'Member' }}</div>
            </div>
            <div>
              <div class="text-[10px] text-gray-500 uppercase">Tanggal Lahir</div>
              <div class="text-gray-200 truncate">{{ selectedMemberForPhoto.dob || '-' }}</div>
            </div>
            <div>
              <div class="text-[10px] text-gray-500 uppercase">Unique Code Edit</div>
              <div class="text-fuchsia-300 font-bold truncate">{{ selectedMemberForPhoto.unique_code_edit || '-' }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- FOTO 1: SISTEM FACE SCAN -->
            <div class="rounded-xl border border-cyan-500/30 bg-black/60 p-4 space-y-3 flex flex-col">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span class="font-orbitron font-bold text-xs text-cyan-300 tracking-wider uppercase">
                    FOTO 1: SISTEM FACE SCAN
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  INTERNAL SISTEM
                </span>
              </div>
              <p class="text-[11px] text-gray-400 leading-relaxed">
                Diambil otomatis via kamera biometrik saat Step 2 pendaftaran untuk validasi keaslian orang &amp; pencegahan smurf.
              </p>

              <div class="relative flex-1 min-h-[260px] max-h-[360px] rounded-lg overflow-hidden border border-cyan-500/20 bg-gray-950 flex items-center justify-center group">
                <template v-if="selectedMemberForPhoto.face_image_path">
                  <img
                    :src="selectedMemberForPhoto.face_image_path"
                    alt="Foto Biometrik Sistem"
                    class="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition duration-300"
                    @click="lightboxImage = selectedMemberForPhoto.face_image_path"
                  />
                  <div class="absolute inset-0 bg-cyan-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span class="px-3 py-1.5 rounded-lg bg-black/80 text-cyan-300 font-orbitron text-xs flex items-center gap-1.5 border border-cyan-400">
                      <ZoomIn class="w-3.5 h-3.5" /> Klik Untuk Memperbesar
                    </span>
                  </div>
                </template>
                <div v-else class="text-center p-6 space-y-2">
                  <Camera class="w-8 h-8 text-gray-600 mx-auto" />
                  <p class="text-xs text-gray-500 font-mono">Foto scan sistem belum tersedia</p>
                  <p class="text-[10px] text-gray-600">(Member terdaftar sebelum sistem biometrik aktif)</p>
                </div>
              </div>

              <div v-if="selectedMemberForPhoto.face_image_path" class="pt-1 flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span class="truncate max-w-[200px]" :title="selectedMemberForPhoto.face_image_path">
                  {{ selectedMemberForPhoto.face_image_path.split('/').pop() }}
                </span>
                <a
                  :href="selectedMemberForPhoto.face_image_path"
                  target="_blank"
                  class="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink class="w-3 h-3" /> Buka Tab Baru
                </a>
              </div>
            </div>

            <!-- FOTO 2: FOTO PROFIL MEMBER -->
            <div class="rounded-xl border border-fuchsia-500/30 bg-black/60 p-4 space-y-3 flex flex-col">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-fuchsia-400"></span>
                  <span class="font-orbitron font-bold text-xs text-fuchsia-300 tracking-wider uppercase">
                    FOTO 2: FOTO PROFIL
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                  AVATAR PUBLIK
                </span>
              </div>
              <p class="text-[11px] text-gray-400 leading-relaxed">
                Foto yang diunggah member di Step 5 formulir (maks. 2 MB WebP). Ditampilkan di publik website &amp; E-Passport.
              </p>

              <div class="relative flex-1 min-h-[260px] max-h-[360px] rounded-lg overflow-hidden border border-fuchsia-500/20 bg-gray-950 flex items-center justify-center group">
                <template v-if="selectedMemberForPhoto.avatar">
                  <img
                    :src="selectedMemberForPhoto.avatar"
                    alt="Foto Profil Avatar Member"
                    class="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition duration-300"
                    @click="lightboxImage = selectedMemberForPhoto.avatar"
                  />
                  <div class="absolute inset-0 bg-fuchsia-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span class="px-3 py-1.5 rounded-lg bg-black/80 text-fuchsia-300 font-orbitron text-xs flex items-center gap-1.5 border border-fuchsia-400">
                      <ZoomIn class="w-3.5 h-3.5" /> Klik Untuk Memperbesar
                    </span>
                  </div>
                </template>
                <div v-else class="text-center p-6 space-y-2">
                  <Users class="w-8 h-8 text-gray-600 mx-auto" />
                  <p class="text-xs text-gray-500 font-mono">Foto profil belum diunggah</p>
                </div>
              </div>

              <div v-if="selectedMemberForPhoto.avatar" class="pt-1 flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span class="truncate max-w-[200px]" :title="selectedMemberForPhoto.avatar">
                  {{ selectedMemberForPhoto.avatar.split('/').pop() }}
                </span>
                <a
                  :href="selectedMemberForPhoto.avatar"
                  target="_blank"
                  class="text-fuchsia-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink class="w-3 h-3" /> Buka Tab Baru
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div class="text-[10px] sm:text-[11px] text-gray-400 font-mono flex items-center gap-1.5 sm:gap-2 text-center sm:text-left">
            <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span>Data siap diverifikasi oleh Dewan Staff / Owner XFIVE</span>
          </div>
          <button
            @click="photoVerificationModalOpen = false"
            class="w-full sm:w-auto px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-orbitron font-bold text-xs uppercase transition cursor-pointer text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Lightbox Zoom Modal -->
    <Teleport to="body">
      <div
        v-if="lightboxImage"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in"
        @click="lightboxImage = null"
      >
        <div class="relative max-w-5xl max-h-[95vh] flex flex-col items-center">
          <button
            @click="lightboxImage = null"
            class="absolute -top-12 right-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer flex items-center gap-1.5 border border-white/20"
          >
            ✕ Tutup [ESC]
          </button>
          <img
            :src="lightboxImage"
            alt="Preview Resolusi Penuh"
            class="max-w-full max-h-[85vh] object-contain rounded-xl border border-cyan-500/40 shadow-[0_0_50px_rgba(0,255,255,0.2)]"
            @click.stop
          />
          <div class="mt-3 flex items-center gap-3">
            <a
              :href="lightboxImage"
              target="_blank"
              download
              class="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs flex items-center gap-2 transition"
              @click.stop
            >
              <Download class="w-3.5 h-3.5" /> Unduh Gambar
            </a>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Confirm Delete Member -->
    <Teleport to="body">
      <div
        v-if="deleteMemberModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      >
      <div class="rounded-2xl border border-red-500/40 bg-[#0d121c] p-4 sm:p-6 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div class="flex items-center gap-2.5 sm:gap-3 text-red-400 mb-3 sm:mb-4">
          <AlertTriangle class="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <h3 class="font-bold font-orbitron text-sm sm:text-lg text-white">KONFIRMASI HAPUS MEMBER</h3>
        </div>

        <p class="text-xs text-gray-300 leading-relaxed mb-4">
          Apakah kamu yakin ingin menghapus member ini secara permanen dari database? Aksi ini tidak dapat dibatalkan.
        </p>

        <div v-if="memberToDelete" class="p-3 sm:p-3.5 rounded-xl bg-black/60 border border-red-500/20 mb-4 sm:mb-5 font-mono text-xs space-y-1">
          <div class="text-white font-bold font-orbitron">{{ memberToDelete.nickname }} ({{ memberToDelete.name }})</div>
          <div class="text-cyan-400">Member Code: <span class="text-white">{{ memberToDelete.member_code }}</span></div>
        </div>

        <div v-if="deleteError" class="mb-4 p-2.5 rounded-lg bg-red-950/80 border border-red-500 text-red-300 text-xs">
          {{ deleteError }}
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            @click="deleteMemberModalOpen = false"
            class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="button"
            @click="confirmDeleteMember"
            :disabled="isDeletingMember"
            class="w-full sm:w-auto px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw v-if="isDeletingMember" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isDeletingMember ? 'Menghapus...' : 'Ya, Hapus Member' }}</span>
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Modal: Nickname Change History Log -->
    <ModalNicknameHistory
      v-if="historyModalOpen"
      :initial-member-code="historySearch"
      @close="historyModalOpen = false"
    />
  </div>
</template>
