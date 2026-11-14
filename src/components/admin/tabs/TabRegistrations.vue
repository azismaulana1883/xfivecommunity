<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  ShieldCheck,
  FileSpreadsheet,
  RefreshCw,
  Users,
  Clock,
  Camera,
  Shield,
  Search,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Globe,
  MapPin,
  Hash,
  Phone,
  Mail,
  AtSign,
  Monitor,
  ExternalLink,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import { useAdminRegistrations, type RegistrationItem } from '@/composables/admin/useAdminRegistrations';
import { useAdminAuth } from '@/composables/admin/useAdminAuth';
import { useToast } from '@/composables/useToast';
import { getTesterDisplayName } from '@/data/testers';

const toast = useToast();
const { currentUser } = useAdminAuth();
const {
  registrationsList,
  loadingRegistrations,
  fetchRegistrationsAdmin,
  deleteRegistration
} = useAdminRegistrations();

const registrationSearch = ref('');
const registrationVpnFilter = ref<'all' | 'clean' | 'vpn'>('all');
const expandedRegistrationId = ref<number | null>(null);
const selectedRegistrationFaceModal = ref<string | null>(null);
const registrationToDelete = ref<RegistrationItem | null>(null);
const deleteRegistrationModalOpen = ref(false);
const isDeletingRegistration = ref(false);

onMounted(() => {
  if (registrationsList.value.length === 0) {
    fetchRegistrationsAdmin();
  }
});

const toggleExpandRegistration = (id: number) => {
  expandedRegistrationId.value = expandedRegistrationId.value === id ? null : id;
};

const getRegistrationFaceUrl = (reg: RegistrationItem) => {
  if (reg.face_image_path) return reg.face_image_path;
  const key = reg.face_image_key || reg.face_image_id;
  if (key) return `/.netlify/functions/serve-biometric?id=${encodeURIComponent(key)}`;
  return null;
};

const formatRegDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatRegTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '-';
  }
};

const filteredRegistrations = computed(() => {
  let list = registrationsList.value;
  if (registrationVpnFilter.value === 'clean') {
    list = list.filter((r) => !r.is_vpn || !r.is_vpn.toLowerCase().includes('terdeteksi'));
  } else if (registrationVpnFilter.value === 'vpn') {
    list = list.filter((r) => r.is_vpn && r.is_vpn.toLowerCase().includes('terdeteksi'));
  }

  if (!registrationSearch.value.trim()) return list;
  const q = registrationSearch.value.toLowerCase().trim();
  const has = (val: string | null | undefined) => Boolean(val && val.toLowerCase().includes(q));

  return list.filter(
    (r) =>
      has(r.nama_panggilan) ||
      has(r.nickname_ayodance) ||
      has(r.member_code) ||
      has(r.nomor_wa) ||
      has(r.email) ||
      has(r.username_sosmed) ||
      has(r.tester) ||
      has(r.domisili) ||
      has(r.user_ip) ||
      has(r.user_location)
  );
});

const todayRegistrationsCount = computed(() => {
  const today = new Date().toDateString();
  return registrationsList.value.filter((r) => r.created_at && new Date(r.created_at).toDateString() === today).length;
});

const vpnRegistrationsCount = computed(() => {
  return registrationsList.value.filter((r) => r.is_vpn && r.is_vpn.toLowerCase().includes('terdeteksi')).length;
});

const faceRegistrationsCount = computed(() => {
  return registrationsList.value.filter((r) => Boolean(r.face_image_path || r.face_image_key || r.face_image_id)).length;
});

const exportRegistrationsToExcel = () => {
  if (filteredRegistrations.value.length === 0) {
    toast.error('Tidak ada data registrasi untuk diexport.');
    return;
  }
  const data = filteredRegistrations.value.map((r, i) => ({
    No: i + 1,
    ID: r.id,
    'Nama Panggilan': r.nama_panggilan,
    'Nickname Ayodance': r.nickname_ayodance,
    'Kode Member': r.member_code || '-',
    'Nomor WhatsApp': r.nomor_wa || '-',
    Email: r.email || '-',
    'Status Email': r.email_status || '-',
    'Username Sosmed': r.username_sosmed ? '@' + r.username_sosmed : '-',
    'Tanggal Lahir': r.tanggal_lahir || '-',
    Domisili: r.domisili || '-',
    Divisi: r.divisi_community || '-',
    Tester: r.tester || '-',
    'IP Address': r.user_ip || '-',
    'Lokasi (GeoIP)': r.user_location || '-',
    'VPN / Proxy': r.is_vpn || '-',
    'User Agent': r.user_agent || '-',
    Quote: r.quote || '-',
    'Waktu Registrasi': `${formatRegDate(r.created_at)} ${formatRegTime(r.created_at)}`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Registrasi');
  XLSX.writeFile(workbook, `XFIVE_Audit_Registrasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast.success('File XLSX berhasil diexport!', 'Export Berhasil');
};

const confirmDeleteRegistration = (item: RegistrationItem) => {
  registrationToDelete.value = item;
  deleteRegistrationModalOpen.value = true;
};

const executeDeleteRegistration = async () => {
  if (!registrationToDelete.value) return;
  isDeletingRegistration.value = true;
  const res = await deleteRegistration(registrationToDelete.value.id);
  if (res.success) {
    toast.success('Data registrasi berhasil dihapus.', 'Berhasil');
    deleteRegistrationModalOpen.value = false;
    registrationToDelete.value = null;
  } else {
    toast.error(res.message || 'Gagal menghapus registrasi.');
  }
  isDeletingRegistration.value = false;
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Top Header & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border border-cyan-500/20 bg-[#0d121c]/90 backdrop-blur-md">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <h2 class="text-base sm:text-lg font-bold font-orbitron text-white tracking-wide">
            Audit Pendaftaran &amp; Verifikasi Biometrik
          </h2>
        </div>
        <p class="text-xs text-gray-400 font-mono">
          Audit log pendaftaran online, verifikasi foto biometrik wajah, rekam jejak IP address, dan analisis keamanan VPN/Proxy.
        </p>
      </div>
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          @click="exportRegistrationsToExcel"
          :disabled="registrationsList.length === 0"
          class="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-orbitron font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Export XLSX</span>
        </button>
        <button
          @click="fetchRegistrationsAdmin"
          :disabled="loadingRegistrations"
          class="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 text-xs font-orbitron font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loadingRegistrations }" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Metric Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
      <div class="p-4 rounded-xl border border-cyan-500/20 bg-[#0d121c]/90 backdrop-blur-md relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Pendaftar</span>
          <Users class="w-5 h-5 text-cyan-400" />
        </div>
        <div class="text-2xl sm:text-3xl font-black font-orbitron text-white mt-2">
          {{ registrationsList.length }}
        </div>
        <div class="text-[11px] text-gray-400 mt-1">Seluruh arsip registrasi</div>
      </div>

      <div class="p-4 rounded-xl border border-purple-500/20 bg-[#0d121c]/90 backdrop-blur-md relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Hari Ini</span>
          <Clock class="w-5 h-5 text-purple-400" />
        </div>
        <div class="text-2xl sm:text-3xl font-black font-orbitron text-purple-300 mt-2">
          {{ todayRegistrationsCount }}
        </div>
        <div class="text-[11px] text-purple-400/70 mt-1">Pendaftaran 24 jam ini</div>
      </div>

      <div class="p-4 rounded-xl border border-emerald-500/20 bg-[#0d121c]/90 backdrop-blur-md relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Foto Biometrik</span>
          <Camera class="w-5 h-5 text-emerald-400" />
        </div>
        <div class="text-2xl sm:text-3xl font-black font-orbitron text-emerald-400 mt-2">
          {{ faceRegistrationsCount }}
        </div>
        <div class="text-[11px] text-emerald-400/70 mt-1">Verifikasi scan wajah</div>
      </div>

      <div
        class="p-4 rounded-xl border bg-[#0d121c]/90 backdrop-blur-md relative overflow-hidden"
        :class="vpnRegistrationsCount > 0 ? 'border-red-500/30' : 'border-gray-800'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider">VPN / Proxy</span>
          <Shield class="w-5 h-5" :class="vpnRegistrationsCount > 0 ? 'text-red-400' : 'text-gray-500'" />
        </div>
        <div
          class="text-2xl sm:text-3xl font-black font-orbitron mt-2"
          :class="vpnRegistrationsCount > 0 ? 'text-red-400' : 'text-white'"
        >
          {{ vpnRegistrationsCount }}
        </div>
        <div class="text-[11px] mt-1" :class="vpnRegistrationsCount > 0 ? 'text-red-400/80 font-bold' : 'text-gray-400'">
          {{ vpnRegistrationsCount > 0 ? 'Perlu diaudit teliti' : 'Koneksi bersih terdeteksi' }}
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="p-4 rounded-xl border border-white/10 bg-[#0d121c]/90 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="registrationSearch"
          type="text"
          placeholder="Cari nama, nickname, kode member, no WA, email, IP, lokasi, tester..."
          class="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
        />
        <button
          v-if="registrationSearch"
          @click="registrationSearch = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div class="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
        <button
          @click="registrationVpnFilter = 'all'"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
          :class="registrationVpnFilter === 'all' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'"
        >
          Semua ({{ registrationsList.length }})
        </button>
        <button
          @click="registrationVpnFilter = 'clean'"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          :class="registrationVpnFilter === 'clean' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-emerald-400'"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          Clean
        </button>
        <button
          @click="registrationVpnFilter = 'vpn'"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          :class="registrationVpnFilter === 'vpn' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-red-400'"
        >
          <span class="w-2 h-2 rounded-full bg-red-400"></span>
          VPN ({{ vpnRegistrationsCount }})
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loadingRegistrations" class="p-12 text-center rounded-2xl border border-white/10 bg-[#0d121c]/90">
      <RefreshCw class="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
      <p class="text-xs font-orbitron text-cyan-400 tracking-wider">MEMUAT DATA AUDIT REGISTRASI...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRegistrations.length === 0" class="p-12 text-center rounded-2xl border border-white/10 bg-[#0d121c]/90">
      <Users class="w-12 h-12 text-gray-600 mx-auto mb-3" />
      <p class="text-sm font-orbitron text-gray-400">
        {{ registrationSearch ? 'Tidak ada data registrasi yang sesuai pencarian' : 'Belum ada data registrasi tersimpan' }}
      </p>
    </div>

    <!-- Registrations Card List -->
    <div v-else class="space-y-3 font-mono">
      <div
        v-for="(reg, index) in filteredRegistrations"
        :key="reg.id"
        class="rounded-xl border border-white/10 hover:border-cyan-500/50 bg-[#0d121c]/90 p-4 transition-all duration-200"
      >
        <div class="flex items-center gap-3 sm:gap-4 cursor-pointer select-none" @click="toggleExpandRegistration(reg.id)">
          <div class="text-gray-500 font-orbitron text-xs w-7 sm:w-8 text-center shrink-0">
            #{{ index + 1 }}
          </div>

          <div class="relative shrink-0">
            <div
              v-if="getRegistrationFaceUrl(reg)"
              @click.stop="selectedRegistrationFaceModal = getRegistrationFaceUrl(reg)"
              class="w-12 h-12 rounded-full border-2 border-purple-500/70 hover:border-cyan-400 p-0.5 overflow-hidden transition cursor-pointer group shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              title="Klik untuk memperbesar foto wajah biometrik"
            >
              <img
                :src="getRegistrationFaceUrl(reg)!"
                :alt="reg.nama_panggilan"
                class="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-300"
                loading="lazy"
              />
            </div>
            <div v-else class="w-12 h-12 rounded-full border border-gray-700 bg-gray-900 flex items-center justify-center text-gray-600">
              <ImageIcon class="w-5 h-5" />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-orbitron font-bold text-cyan-300 text-xs sm:text-sm truncate">
                {{ reg.nama_panggilan }}
              </h3>
              <span v-if="reg.member_code || reg.upload_code" class="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                {{ reg.member_code || reg.upload_code }}
              </span>
              <span
                v-if="reg.is_vpn"
                class="text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider"
                :class="reg.is_vpn.toLowerCase().includes('terdeteksi') ? 'border-red-500/40 text-red-400 bg-red-500/10' : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'"
              >
                {{ reg.is_vpn.toLowerCase().includes('terdeteksi') ? 'VPN Terdeteksi' : 'Clean IP' }}
              </span>
              <span
                v-if="reg.email_status"
                class="text-[9px] px-2 py-0.5 rounded-full border font-mono"
                :class="reg.email_status === 'sent' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gray-700 text-gray-400 bg-black/40'"
              >
                Email: {{ reg.email_status }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-400 truncate">
              <span class="text-white font-semibold font-orbitron text-[11px]">{{ reg.nickname_ayodance }}</span>
              <span v-if="reg.divisi_community" class="text-gray-500">• {{ reg.divisi_community }}</span>
              <span v-if="reg.tester" class="text-purple-300 font-mono text-[10px]">• Tester: {{ getTesterDisplayName(reg.tester) }}</span>
            </div>
          </div>

          <div class="hidden lg:flex items-center gap-4 text-xs text-gray-400 shrink-0">
            <div v-if="reg.user_ip" class="flex items-center gap-1.5" :title="'IP Address: ' + reg.user_ip">
              <Globe class="w-3.5 h-3.5 text-cyan-400" />
              <span class="font-mono text-[11px]">{{ reg.user_ip }}</span>
            </div>
            <div v-if="reg.user_location && reg.user_location !== 'Unknown'" class="flex items-center gap-1.5" :title="'Lokasi: ' + reg.user_location">
              <MapPin class="w-3.5 h-3.5 text-pink-400" />
              <span class="text-[11px] max-w-[120px] truncate">{{ reg.user_location }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <div class="text-right hidden sm:block">
              <div class="text-[11px] text-gray-300 font-semibold">{{ formatRegDate(reg.created_at) }}</div>
              <div class="text-[10px] text-gray-500">{{ formatRegTime(reg.created_at) }}</div>
            </div>
            <button
              class="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              :title="expandedRegistrationId === reg.id ? 'Tutup Rincian' : 'Buka Rincian'"
            >
              <component :is="expandedRegistrationId === reg.id ? ChevronUp : ChevronDown" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Expanded Detailed Audit Panel -->
        <div v-if="expandedRegistrationId === reg.id" class="mt-4 pt-4 border-t border-white/10 space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <Hash class="w-3 h-3 text-purple-400" />
                <span>Kode Member Resmi</span>
              </div>
              <div class="font-orbitron font-bold text-purple-300 text-sm">
                {{ reg.member_code || reg.upload_code || '-' }}
              </div>
              <div v-if="reg.unique_code_edit" class="text-[10px] text-gray-500 font-mono">
                Kunci Edit: <span class="text-gray-400">{{ reg.unique_code_edit }}</span>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <Phone class="w-3 h-3 text-emerald-400" />
                <span>Nomor WhatsApp</span>
              </div>
              <div v-if="reg.nomor_wa">
                <a
                  :href="`https://wa.me/${reg.nomor_wa.replace(/[^0-9]/g, '')}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  @click.stop
                >
                  {{ reg.nomor_wa }}
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
              <div v-else class="text-gray-400">-</div>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <Mail class="w-3 h-3 text-cyan-400" />
                <span>Email Pendaftar</span>
              </div>
              <div class="text-gray-200 truncate font-semibold">{{ reg.email || '-' }}</div>
              <div class="text-[10px] text-gray-500">Status: {{ reg.email_status || 'pending' }}</div>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <AtSign class="w-3 h-3 text-pink-400" />
                <span>Media Sosial</span>
              </div>
              <div class="text-gray-200 font-semibold truncate">
                {{ reg.username_sosmed ? '@' + reg.username_sosmed : (reg.sosial_media_name || '-') }}
              </div>
              <div v-if="reg.social_confirmed" class="text-[10px] text-emerald-400">Konfirmasi Follow: YA</div>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <Clock class="w-3 h-3 text-purple-400" />
                <span>Waktu Registrasi</span>
              </div>
              <div class="text-gray-200 font-semibold">{{ formatRegDate(reg.created_at) }} {{ formatRegTime(reg.created_at) }}</div>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <Globe class="w-3 h-3 text-cyan-400" />
                <span>IP Address Klien</span>
              </div>
              <div class="font-mono text-cyan-300 font-bold">{{ reg.user_ip || '-' }}</div>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <MapPin class="w-3 h-3 text-pink-400" />
                <span>Lokasi Terdeteksi</span>
              </div>
              <div class="text-gray-200 font-semibold">{{ reg.user_location || '-' }}</div>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <Shield class="w-3 h-3 text-amber-400" />
                <span>Deteksi VPN / Proxy</span>
              </div>
              <div
                class="font-bold"
                :class="reg.is_vpn && reg.is_vpn.toLowerCase().includes('terdeteksi') ? 'text-red-400' : 'text-emerald-400'"
              >
                {{ reg.is_vpn || '-' }}
              </div>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 sm:col-span-2 lg:col-span-1">
              <div class="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider">
                <Monitor class="w-3 h-3 text-blue-400" />
                <span>Perangkat / User Agent</span>
              </div>
              <div class="text-[11px] text-gray-300 truncate" :title="reg.user_agent || ''">
                {{ reg.user_agent || '-' }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1" v-if="reg.tanggal_lahir">
              <div class="text-[10px] text-gray-500 uppercase tracking-wider">Tanggal Lahir</div>
              <div class="text-gray-200 font-semibold">{{ reg.tanggal_lahir }}</div>
            </div>
            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1" v-if="reg.domisili">
              <div class="text-[10px] text-gray-500 uppercase tracking-wider">Domisili</div>
              <div class="text-gray-200 font-semibold">{{ reg.domisili }}</div>
            </div>
            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1" v-if="reg.divisi_community">
              <div class="text-[10px] text-gray-500 uppercase tracking-wider">Divisi Komunitas</div>
              <div class="text-gray-200 font-semibold">{{ reg.divisi_community }}</div>
            </div>
            <div class="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1" v-if="reg.tester">
              <div class="text-[10px] text-gray-500 uppercase tracking-wider">Staff Tester</div>
              <div class="text-purple-300 font-semibold font-mono">{{ getTesterDisplayName(reg.tester) }}</div>
            </div>
          </div>

          <div v-if="reg.quote" class="p-3 rounded-lg bg-black/40 border border-white/5 italic text-gray-300">
            &ldquo;{{ reg.quote }}&rdquo;
          </div>

          <div class="flex items-center justify-between gap-3 pt-2 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
              <button
                v-if="getRegistrationFaceUrl(reg)"
                @click.stop="selectedRegistrationFaceModal = getRegistrationFaceUrl(reg)"
                class="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-purple-300 text-xs font-orbitron font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Camera class="w-3.5 h-3.5" />
                <span>Lihat Foto Biometrik</span>
              </button>
              <button
                v-if="reg.avatar_image_path"
                @click.stop="selectedRegistrationFaceModal = reg.avatar_image_path"
                class="px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 text-cyan-300 text-xs font-orbitron font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon class="w-3.5 h-3.5" />
                <span>Lihat Foto Profil</span>
              </button>
            </div>

            <button
              v-if="currentUser.role === 'superadmin' || currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'leader'"
              @click.stop="confirmDeleteRegistration(reg)"
              class="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-orbitron font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Lightbox Biometrik / Avatar -->
    <Teleport to="body">
      <div
        v-if="selectedRegistrationFaceModal"
        class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer backdrop-blur-sm animate-fade-in"
        @click="selectedRegistrationFaceModal = null"
      >
        <button
          class="absolute top-4 right-4 text-white hover:text-cyan-400 transition-colors p-2"
          @click="selectedRegistrationFaceModal = null"
        >
          <X class="w-7 h-7" />
        </button>
        <div class="relative max-w-2xl max-h-[85vh] p-1 rounded-2xl border-2 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)] overflow-hidden bg-black" @click.stop>
          <img
            :src="selectedRegistrationFaceModal"
            alt="Foto Biometrik / Profil"
            class="max-w-full max-h-[82vh] object-contain rounded-xl"
          />
        </div>
      </div>
    </Teleport>

    <!-- Modal: Confirm Delete Registrasi -->
    <div
      v-if="deleteRegistrationModalOpen && registrationToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      @click.self="deleteRegistrationModalOpen = false"
    >
      <div class="rounded-2xl border border-red-500/40 bg-[#0d121c] p-6 max-w-md w-full shadow-[0_0_40px_rgba(239,68,68,0.2)]">
        <div class="flex items-center gap-3 text-red-400 mb-3">
          <AlertTriangle class="w-6 h-6 shrink-0" />
          <h3 class="font-bold font-orbitron text-base text-white">HAPUS DATA REGISTRASI</h3>
        </div>
        <p class="text-xs text-gray-300 font-mono mb-6 leading-relaxed">
          Apakah Anda yakin ingin menghapus data pendaftaran <span class="text-cyan-400 font-bold">{{ registrationToDelete.nickname_ayodance }}</span> ({{ registrationToDelete.nama_panggilan }})? Data yang dihapus tidak dapat dipulihkan.
        </p>
        <div class="flex justify-end gap-3 font-orbitron text-xs">
          <button
            @click="deleteRegistrationModalOpen = false"
            class="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
          >
            BATAL
          </button>
          <button
            @click="executeDeleteRegistration"
            :disabled="isDeletingRegistration"
            class="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 class="w-4 h-4" />
            <span>{{ isDeletingRegistration ? 'MENGHAPUS...' : 'HAPUS PERMANEN' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
