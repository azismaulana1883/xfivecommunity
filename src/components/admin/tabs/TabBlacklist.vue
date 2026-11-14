<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  UserX,
  Plus,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Users
} from 'lucide-vue-next';
import SearchableSelect from '../../SearchableSelect.vue';
import { type BlacklistRecord } from '../../../composables/admin/useAdminBlacklist';
import { useAdminAuth } from '../../../composables/admin/useAdminAuth';
import { getTesterDisplayName, normalizeTesterToCode } from '../../../data/testers';

const props = defineProps<{
  blacklistList: BlacklistRecord[];
  loadingBlacklist: boolean;
  members: any[];
}>();

const emit = defineEmits<{
  (e: 'saveBlacklist', payload: any): Promise<boolean>;
  (e: 'deleteBlacklist', id: number): Promise<boolean>;
}>();

const { currentUser } = useAdminAuth();

const addBlacklistModalOpen = ref(false);
const isSavingBlacklist = ref(false);
const blacklistFormError = ref('');
const selectedMemberForBlacklist = ref('');

const blacklistCategories = [
  { id: 'Out Community', name: 'Out Community (Keluar Baik-Baik / Mundur)' },
  { id: 'Toxic / Perilaku Buruk', name: 'Toxic / Perilaku Buruk' },
  { id: 'Drama / Keributan', name: 'Drama / Keributan Antar Anggota' },
  { id: 'Pelanggaran Regulasi Komunitas', name: 'Pelanggaran Regulasi Komunitas' },
  { id: 'Problem Matik / Internal', name: 'Problem Matik / Internal' },
  { id: 'Fake Photo / Identitas Palsu', name: 'Fake Photo / Identitas Palsu' },
  { id: 'Penipuan / Fraud Micash', name: 'Penipuan / Fraud Micash' },
  { id: 'Program Ilegal / Cheat', name: 'Program Ilegal / Cheat' },
  { id: 'Others', name: 'Others (Lainnya / Pelanggaran Khusus)' },
];

const blacklistForm = reactive({
  member_code: '',
  nama: '',
  nickname: '',
  kategori: 'Out Community',
  remarks: '',
  pelanggaran: '',
  out_date: new Date().toISOString().split('T')[0],
  is_blacklist: 'N' as 'Y' | 'N',
  duration: 3,
});

const onKategoriChange = (val: string | number) => {
  const k = String(val);
  blacklistForm.kategori = k;
  if (k === 'Out Community') {
    blacklistForm.is_blacklist = 'N';
    blacklistForm.duration = 3;
  } else if (k === 'Program Ilegal / Cheat' || k === 'Penipuan / Fraud Micash') {
    blacklistForm.is_blacklist = 'Y';
  }
};

const onSelectMemberForBlacklist = (val: string | number) => {
  const code = String(val);
  const found = (props.members || []).find((m) => m && (m.member_code === code || m.nickname === code));
  if (found) {
    blacklistForm.member_code = found.member_code || '';
    blacklistForm.nickname = found.nickname || '';
    blacklistForm.nama = found.name || found.nama || '';
  }
};

const canManageMember = (m: any): boolean => {
  if (!m) return false;
  const role = (currentUser?.role || '').toLowerCase();
  if (role === 'superadmin' || role === 'owner' || role === 'admin') return true;
  if (role === 'leader' || role === 'vice_leader') {
    return (m.category || '').toLowerCase() !== 'owner';
  }
  if (role === 'staff_tester') {
    const isNormalMember = (m.category || 'member').toLowerCase() === 'member';
    if (!isNormalMember) return false;
    if (!currentUser?.tester_name || !m.tester) return false;
    const memberTesterCode = normalizeTesterToCode(m.tester);
    const myTesterCode = normalizeTesterToCode(currentUser.tester_name);
    return Boolean(
      (memberTesterCode && myTesterCode && memberTesterCode.toUpperCase() === myTesterCode.toUpperCase()) ||
      (m.tester && m.tester.toLowerCase() === currentUser.tester_name.toLowerCase())
    );
  }
  return false;
};

const canManageBlacklistItem = (item: BlacklistRecord): boolean => {
  if (!item) return false;
  const role = (currentUser?.role || '').toLowerCase();
  if (role === 'superadmin' || role === 'owner' || role === 'admin') return true;
  if (role === 'leader' || role === 'vice_leader') return true;
  if (role === 'staff_tester') {
    if (!item.member_code) return false;
    const targetMember = (props.members || []).find((m) => m && m.member_code === item.member_code);
    if (!targetMember) return false;
    return canManageMember(targetMember);
  }
  return false;
};

const memberOptions = computed(() => {
  return (props.members || [])
    .filter((m) => Boolean(m) && canManageMember(m))
    .map((m) => ({
      id: m.member_code || m.nickname || '',
      name: `${m.nickname || 'Unknown'} — ${m.name || m.nama || ''} (${m.member_code || 'Tanpa Kode'})${m.tester ? ' [OT: ' + getTesterDisplayName(m.tester) + ']' : ''}`,
      member: m,
    }));
});

const openAddBlacklistModal = () => {
  blacklistForm.member_code = '';
  blacklistForm.nama = '';
  blacklistForm.nickname = '';
  blacklistForm.kategori = 'Out Community';
  blacklistForm.remarks = '';
  blacklistForm.pelanggaran = '';
  blacklistForm.out_date = new Date().toISOString().split('T')[0];
  blacklistForm.is_blacklist = 'N';
  blacklistForm.duration = 3;
  selectedMemberForBlacklist.value = '';
  blacklistFormError.value = '';
  addBlacklistModalOpen.value = true;
};

const handleSaveBlacklist = async () => {
  blacklistFormError.value = '';
  if (!blacklistForm.nickname.trim()) {
    blacklistFormError.value = 'Nickname member wajib diisi atau dipilih dari daftar.';
    return;
  }

  const isOthersOrPermanent = blacklistForm.kategori === 'Others' || blacklistForm.is_blacklist === 'Y';
  if (isOthersOrPermanent && !blacklistForm.remarks.trim() && !blacklistForm.pelanggaran.trim()) {
    blacklistFormError.value = 'Keterangan alasan (remarks) wajib diisi untuk kategori Others atau sanksi Permanent.';
    return;
  }

  isSavingBlacklist.value = true;
  try {
    const payload = {
      member_code: blacklistForm.member_code || null,
      nama: blacklistForm.nama || '-',
      nickname: blacklistForm.nickname.trim(),
      kategori: blacklistForm.kategori,
      remarks: blacklistForm.remarks.trim() || null,
      pelanggaran: blacklistForm.remarks.trim() || blacklistForm.kategori,
      out_date: blacklistForm.out_date,
      is_blacklist: blacklistForm.is_blacklist,
      duration: blacklistForm.is_blacklist === 'Y' ? null : Number(blacklistForm.duration) || 3,
    };

    const success = await emit('saveBlacklist', payload);
    if (success !== false) {
      addBlacklistModalOpen.value = false;
    }
  } catch (err: any) {
    blacklistFormError.value = err.message || 'Gagal menyimpan status blacklist.';
  } finally {
    isSavingBlacklist.value = false;
  }
};

const deleteBlacklistModalOpen = ref(false);
const blacklistToDelete = ref<BlacklistRecord | null>(null);
const isDeletingBlacklist = ref(false);

const promptDeleteBlacklist = (item: BlacklistRecord) => {
  blacklistToDelete.value = item;
  deleteBlacklistModalOpen.value = true;
};

const confirmDeleteBlacklist = async () => {
  if (!blacklistToDelete.value) return;
  isDeletingBlacklist.value = true;
  try {
    const success = await emit('deleteBlacklist', blacklistToDelete.value.id);
    if (success !== false) {
      deleteBlacklistModalOpen.value = false;
      blacklistToDelete.value = null;
    }
  } finally {
    isDeletingBlacklist.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in select-none">
    <!-- Top Bar -->
    <div class="rounded-2xl border border-red-500/20 bg-[#0c121e]/80 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <h3 class="text-sm font-bold font-orbitron text-red-400 flex items-center gap-2">
          <UserX class="w-4 h-4" /> REKOR SANKSI BLACKLIST &amp; OUTLIST
        </h3>
        <p class="text-xs text-gray-400 font-mono mt-0.5">Total {{ blacklistList.length }} entri terdaftar di tabel database blacklist_out.</p>
      </div>

      <button
        @click="openAddBlacklistModal"
        class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
      >
        <Plus class="w-4 h-4" />
        <span>TAMBAH SANKSI / OUT</span>
      </button>
    </div>

    <!-- Blacklist Table -->
    <div class="rounded-2xl border border-red-500/20 bg-[#0c121e]/80 overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse min-w-[750px]">
          <thead class="bg-black/50 text-red-400 border-b border-red-500/20 font-orbitron uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3.5 px-4">Nickname / Nama</th>
              <th class="py-3.5 px-4">Member Code</th>
              <th class="py-3.5 px-4">Jenis Sanksi</th>
              <th class="py-3.5 px-4">Durasi</th>
              <th class="py-3.5 px-4">Tanggal Keluar</th>
              <th class="py-3.5 px-4">Pelanggaran / Alasan</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-sans">
            <tr v-if="loadingBlacklist">
              <td colspan="7" class="text-center py-12 text-gray-500 font-mono">
                <RefreshCw class="w-5 h-5 animate-spin mx-auto text-red-400 mb-2" />
                Memuat database blacklist_out...
              </td>
            </tr>
            <tr v-else-if="blacklistList.length === 0">
              <td colspan="7" class="text-center py-12 text-gray-500 font-mono">
                Belum ada data blacklist atau outlist.
              </td>
            </tr>
            <tr
              v-for="item in blacklistList"
              :key="item.id"
              class="hover:bg-red-500/[0.03] transition"
            >
              <!-- Nickname / Nama -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-white font-orbitron">{{ item.nickname }}</div>
                <div class="text-[10px] text-gray-400 font-mono">{{ item.nama || '-' }}</div>
              </td>

              <!-- Member Code -->
              <td class="py-3.5 px-4">
                <span v-if="item.member_code" class="px-2 py-0.5 rounded bg-black/60 border border-red-500/30 text-red-300 font-mono text-[10px] font-bold">
                  {{ item.member_code }}
                </span>
                <span v-else class="text-gray-600 font-mono text-xs">-</span>
              </td>

              <!-- Jenis Sanksi -->
              <td class="py-3.5 px-4">
                <span
                  v-if="item.is_blacklist === 'Y'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold font-orbitron uppercase bg-red-950/80 border border-red-500 text-red-400"
                >
                  Blacklist Permanen
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold font-orbitron uppercase bg-amber-950/80 border border-amber-500 text-amber-400"
                >
                  Outlist Sementara
                </span>
              </td>

              <!-- Durasi -->
              <td class="py-3.5 px-4">
                <span
                  class="font-mono text-xs font-bold"
                  :class="item.is_blacklist === 'Y' || item.duration === 'Permanent' ? 'text-red-400' : 'text-amber-300'"
                >
                  {{ item.duration }}
                </span>
              </td>

              <!-- Out Date -->
              <td class="py-3.5 px-4 text-gray-300 font-mono">
                {{ item.outDate || '-' }}
              </td>

              <!-- Pelanggaran -->
              <td class="py-3.5 px-4 text-gray-300 max-w-xs leading-relaxed">
                <div class="font-bold text-white text-xs font-orbitron">{{ item.kategori || 'Out Community' }}</div>
                <div class="text-[11px] text-gray-400 mt-0.5 font-mono">{{ item.remarks || item.pelanggaran }}</div>
              </td>

              <!-- Action -->
              <td class="py-3.5 px-4 text-right">
                <button
                  v-if="canManageBlacklistItem(item)"
                  @click="promptDeleteBlacklist(item)"
                  class="px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/30 text-red-400 text-[11px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                  title="Hapus status blacklist/outlist ini"
                >
                  <Trash2 class="w-3 h-3" />
                  <span>Hapus</span>
                </button>
                <button
                  v-else
                  disabled
                  class="px-2.5 py-1 rounded-lg border border-gray-800 bg-gray-900/40 text-gray-600 text-[11px] font-bold flex items-center gap-1 ml-auto cursor-not-allowed opacity-40"
                  title="Hanya Superadmin / Tester terkait yang berwenang menghapus blacklist ini"
                >
                  <Trash2 class="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: ADD BLACKLIST -->
    <Teleport to="body">
      <div
        v-if="addBlacklistModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      >
        <div class="rounded-2xl border border-red-500/40 bg-[#0d121c] p-3.5 sm:p-6 w-full max-w-lg shadow-[0_0_50px_rgba(239,68,68,0.2)] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/5">
            <div class="flex items-center gap-2.5 text-red-400 font-orbitron font-bold text-sm sm:text-base">
              <UserX class="w-5 h-5" />
              <span>TAMBAH SANKSI / OUTLIST</span>
            </div>
            <button @click="addBlacklistModalOpen = false" class="text-gray-400 hover:text-white cursor-pointer text-sm sm:text-base">✕</button>
          </div>

          <form @submit.prevent="handleSaveBlacklist" class="space-y-4 text-xs">
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1.5 font-bold">
                Pilih Member Dari Database
              </label>
              <SearchableSelect
                v-model="selectedMemberForBlacklist"
                :options="memberOptions"
                label="Pilih Member"
                placeholder="-- Cari Nickname / Nama / Member Code --"
                :icon="Users"
                @change="onSelectMemberForBlacklist"
              />
              <p class="text-[10px] text-gray-500 mt-1">Memilih member akan otomatis mengisi data Member Code, Nama, dan Nickname.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
              <div>
                <span class="text-[10px] text-gray-500 font-mono uppercase">Member Code</span>
                <input
                  v-model="blacklistForm.member_code"
                  type="text"
                  placeholder="X5-MEMBER-..."
                  class="w-full mt-1 p-2 rounded-lg bg-black/60 border border-gray-800 text-cyan-300 font-mono text-xs outline-none"
                />
              </div>
              <div>
                <span class="text-[10px] text-gray-500 font-mono uppercase">Nickname</span>
                <input
                  v-model="blacklistForm.nickname"
                  type="text"
                  required
                  placeholder="Nickname"
                  class="w-full mt-1 p-2 rounded-lg bg-black/60 border border-gray-800 text-white font-orbitron text-xs outline-none"
                />
              </div>
              <div class="col-span-1 sm:col-span-2">
                <span class="text-[10px] text-gray-500 font-mono uppercase">Nama Lengkap</span>
                <input
                  v-model="blacklistForm.nama"
                  type="text"
                  placeholder="Nama Lengkap Member"
                  class="w-full mt-1 p-2 rounded-lg bg-black/60 border border-gray-800 text-gray-300 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1.5 font-bold">
                Kategori / Alasan Sanksi
              </label>
              <select
                v-model="blacklistForm.kategori"
                @change="onKategoriChange(blacklistForm.kategori)"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-red-500 text-white text-xs outline-none"
              >
                <option v-for="cat in blacklistCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">
                  Tipe Sanksi
                </label>
                <select
                  v-model="blacklistForm.is_blacklist"
                  class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-red-500 text-white text-xs outline-none"
                >
                  <option value="N">Outlist Sementara (Durasi Bulan)</option>
                  <option value="Y">Blacklist Permanen</option>
                </select>
              </div>
              <div>
                <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">
                  Tanggal Keluar
                </label>
                <input
                  v-model="blacklistForm.out_date"
                  type="date"
                  class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-red-500 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div v-if="blacklistForm.is_blacklist === 'N'">
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">
                Durasi Sanksi (Bulan)
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="blacklistForm.duration"
                  type="number"
                  min="1"
                  max="60"
                  class="w-24 p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-red-500 text-white text-xs outline-none text-center font-bold"
                />
                <span class="text-xs text-gray-400 font-mono">Bulan (Default 3 bulan untuk Out Community)</span>
              </div>
            </div>

            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">
                Keterangan Alasan (Remarks)
              </label>
              <textarea
                v-model="blacklistForm.remarks"
                rows="3"
                placeholder="Tuliskan alasan rinci, bukti nomor rekening jika penipuan, atau keterangan keluar..."
                class="w-full p-3 rounded-xl bg-black/60 border border-gray-800 focus:border-red-500 text-white text-xs outline-none"
              ></textarea>
            </div>

            <div v-if="blacklistFormError" class="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{{ blacklistFormError }}</span>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-white/5">
              <button
                type="button"
                @click="addBlacklistModalOpen = false"
                class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSavingBlacklist"
                class="w-full sm:w-auto px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw v-if="isSavingBlacklist" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ isSavingBlacklist ? 'Menyimpan...' : 'Simpan Data Sanksi' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: DELETE BLACKLIST -->
    <Teleport to="body">
      <div
        v-if="deleteBlacklistModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      >
        <div class="rounded-2xl border border-red-500/40 bg-[#0d121c] p-6 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.3)]">
          <div class="flex items-center gap-3 text-red-400 mb-4">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Trash2 class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold font-orbitron text-sm uppercase tracking-wider text-white">Hapus Status Sanksi</h4>
              <p class="text-[11px] text-gray-400 font-mono">Tindakan ini akan mencabut status blacklist/outlist.</p>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 mb-5 text-xs font-mono">
            <div class="text-white font-bold">{{ blacklistToDelete?.nickname }}</div>
            <div class="text-gray-400">Nama: {{ blacklistToDelete?.nama }}</div>
            <div class="text-gray-500 text-[10px]">Alasan: {{ blacklistToDelete?.remarks || blacklistToDelete?.pelanggaran }}</div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              @click="deleteBlacklistModalOpen = false"
              class="px-4 py-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="isDeletingBlacklist"
              @click="confirmDeleteBlacklist"
              class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-orbitron font-bold transition flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw v-if="isDeletingBlacklist" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isDeletingBlacklist ? 'Menghapus...' : 'Ya, Cabut Sanksi' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
