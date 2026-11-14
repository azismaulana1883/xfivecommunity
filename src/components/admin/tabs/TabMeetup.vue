<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import {
  Search,
  Plus,
  RefreshCw,
  Users,
  Check,
  Trash2,
  Calendar,
  MapPin,
  Sparkles,
  Upload,
  AlertTriangle,
  QrCode,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import { useAdminMeetups, type MeetupItem, type MeetupAttendanceItem } from '@/composables/admin/useAdminMeetups';
import { formatDate } from '@/utils/admin/adminFormatters';
import { compressBannerImage, formatFileSize } from '@/utils/imageCompressor';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import { adminApi } from '@/utils/admin/adminApi';
import MultiSearchSelect, { type MultiSelectOption, type MultiSelectPreset } from '@/components/MultiSearchSelect.vue';
import { ALL_INDONESIA_REGENCIES } from '@/data/indonesiaRegencies';

const toast = useToast();
const { confirm: confirmModal } = useConfirm();
const {
  meetupsList,
  loadingMeetups,
  fetchMeetups,
  saveMeetup,
  finalizeMeetup,
  deleteMeetup,
  fetchAttendances,
  updateAttendanceStatus,
  parseMapsLink
} = useAdminMeetups();

const meetupSearch = ref('');
const meetupRegionFilter = ref('all');
const addMeetupModalOpen = ref(false);
const isSavingMeetup = ref(false);
const meetupFormError = ref('');
const meetupBannerMode = ref<'url' | 'upload'>('url');
const isUploadingMeetupBanner = ref(false);
const meetupBannerDragOver = ref(false);
const meetupBannerError = ref('');
const meetupBannerCompressionStats = ref<{
  original: string;
  compressed: string;
  reduction: number;
} | null>(null);

const monitorMeetupModalOpen = ref(false);
const selectedMeetup = ref<MeetupItem | null>(null);
const loadingAttendances = ref(false);
const attendancesList = ref<MeetupAttendanceItem[]>([]);
const attendanceStatusFilter = ref('all');
const attendanceSearchQuery = ref('');
const attendancePage = ref(1);
const attendancePageSize = 10;
const isFinalizingMeetup = ref(false);

const qrModalOpen = ref(false);
const qrMeetup = ref<MeetupItem | null>(null);

const isParsingMapsLink = ref(false);
const mapsParseFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const isDetectingAdminGps = ref(false);
const meetupDateInputRef = ref<HTMLInputElement | null>(null);

const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Opsi Lengkap Kota / Kabupaten Seluruh Indonesia (Daerah Tingkat II Kemendagri / Pemprov)
const regionOptions = ref<MultiSelectOption[]>(ALL_INDONESIA_REGENCIES);

const regionPresets: MultiSelectPreset[] = [
  { label: '+ Jabodetabek', values: ['JAKARTA', 'KOTA BOGOR', 'KABUPATEN BOGOR', 'KOTA DEPOK', 'TANGERANG', 'BEKASI'] },
  { label: '+ Jakarta - Tangerang', values: ['JAKARTA', 'TANGERANG'] },
  { label: '+ Bekasi - Depok', values: ['BEKASI', 'KOTA DEPOK'] },
  { label: '+ Bogor - Depok', values: ['BOGOR', 'KOTA DEPOK'] },
  { label: '+ Medan & Sumut', values: ['KOTA MEDAN', 'KOTA BINJAI', 'KABUPATEN DELI SERDANG'] },
  { label: '+ Palembang & Sumsel', values: ['KOTA PALEMBANG'] },
  { label: '+ Bandung Raya', values: ['BANDUNG', 'KOTA CIMAHI'] },
  { label: '+ Surabaya & Sidoarjo', values: ['SURABAYA'] },
  { label: '+ Akbar (Nasional)', values: ['NASIONAL'] },
];

const selectedRegions = ref<string[]>(['TANGERANG']);

const onSelectedRegionsChange = (vals: string[]) => {
  meetupForm.region = vals.join(', ') || 'TANGERANG';
};

const meetupForm = reactive({
  title: '',
  meetup_date: getLocalTodayDate(),
  start_time: '14:00',
  end_time: '18:00',
  region: 'TANGERANG',
  location_name: '',
  banner_image: '',
  maps_url: '',
  latitude: -6.2412,
  longitude: 106.6212,
  radius_meters: 10,
  description: '',
});

onMounted(() => {
  if (meetupsList.value.length === 0) {
    fetchMeetups();
  }
});

const filteredMeetups = computed(() => {
  let list = meetupsList.value;
  if (meetupRegionFilter.value !== 'all') {
    const f = meetupRegionFilter.value.toUpperCase();
    list = list.filter((m) => {
      if (!m.region) return false;
      const upper = m.region.toUpperCase();
      if (upper.includes('NASIONAL') || upper.includes('SEMUA')) return true;
      const arr = upper.split(',').map((s) => s.trim());
      if (arr.includes('BOGOR-DEPOK') && (f === 'BOGOR' || f === 'DEPOK')) return true;
      return arr.includes(f);
    });
  }
  if (meetupSearch.value.trim()) {
    const q = meetupSearch.value.toLowerCase().trim();
    list = list.filter(
      (m) =>
        (m.title || '').toLowerCase().includes(q) ||
        (m.location_name || '').toLowerCase().includes(q) ||
        (m.region || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const filteredAttendances = computed(() => {
  let list = attendancesList.value;
  if (attendanceStatusFilter.value !== 'all') {
    list = list.filter((a) => a.status === attendanceStatusFilter.value);
  }
  if (attendanceSearchQuery.value.trim()) {
    const q = attendanceSearchQuery.value.toLowerCase().trim();
    list = list.filter(
      (a) =>
        (a.member_code || '').toLowerCase().includes(q) ||
        (a.member_name || '').toLowerCase().includes(q) ||
        (a.nickname || '').toLowerCase().includes(q) ||
        (a.member_domisili || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const attendanceTotalPages = computed(() => {
  return Math.ceil(filteredAttendances.value.length / attendancePageSize) || 1;
});

const paginatedAttendances = computed(() => {
  const start = (attendancePage.value - 1) * attendancePageSize;
  return filteredAttendances.value.slice(start, start + attendancePageSize);
});

watch([attendanceStatusFilter, attendanceSearchQuery], () => {
  attendancePage.value = 1;
});

const openMeetupDatePicker = () => {
  if (meetupDateInputRef.value) {
    try {
      if (typeof (meetupDateInputRef.value as any).showPicker === 'function') {
        (meetupDateInputRef.value as any).showPicker();
      } else {
        meetupDateInputRef.value.focus();
      }
    } catch {
      meetupDateInputRef.value?.focus();
    }
  }
};

const setQuickMeetupDate = (offsetDays: number | 'next-sat' | 'next-sun') => {
  const d = new Date();
  if (typeof offsetDays === 'number') {
    d.setDate(d.getDate() + offsetDays);
  } else if (offsetDays === 'next-sat') {
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
  } else if (offsetDays === 'next-sun') {
    const day = d.getDay();
    const diff = (7 - day) % 7 || 7;
    d.setDate(d.getDate() + diff);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  meetupForm.meetup_date = `${year}-${month}-${day}`;
};

const openAddMeetupModal = () => {
  meetupForm.title = '';
  meetupForm.meetup_date = getLocalTodayDate();
  meetupForm.start_time = '14:00';
  meetupForm.end_time = '18:00';
  meetupForm.region = 'TANGERANG';
  selectedRegions.value = ['TANGERANG'];
  meetupForm.location_name = '';
  meetupForm.banner_image = '';
  meetupForm.maps_url = '';
  meetupForm.latitude = -6.2412;
  meetupForm.longitude = 106.6212;
  meetupForm.radius_meters = 10;
  meetupForm.description = '';
  meetupFormError.value = '';
  mapsParseFeedback.value = null;
  meetupBannerMode.value = 'url';
  meetupBannerError.value = '';
  meetupBannerCompressionStats.value = null;
  addMeetupModalOpen.value = true;
};

const handleMeetupBannerFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    await processAndUploadMeetupBanner(file);
  }
};

const handleMeetupBannerDrop = async (e: DragEvent) => {
  meetupBannerDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    await processAndUploadMeetupBanner(file);
  }
};

const processAndUploadMeetupBanner = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    meetupBannerError.value = 'File yang dipilih harus berupa gambar (JPG, PNG, WebP).';
    return;
  }

  isUploadingMeetupBanner.value = true;
  meetupBannerError.value = '';

  try {
    const compressed = await compressBannerImage(file, 1280, 720, 0.8);
    meetupBannerCompressionStats.value = {
      original: formatFileSize(compressed.originalSize),
      compressed: formatFileSize(compressed.compressedSize),
      reduction: compressed.reductionPercentage,
    };
    const formData = new FormData();
    formData.append('banner', compressed.file);

    const res = await adminApi.post('/api/v1/meetups/upload-banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.data?.success && res.data?.url) {
      meetupForm.banner_image = res.data.url;
    } else {
      meetupBannerError.value = res.data?.message || 'Gagal mengunggah banner meetup.';
    }
  } catch (err: any) {
    console.error('Error compress & upload meetup banner:', err);
    meetupBannerError.value =
      err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses banner meetup.';
  } finally {
    isUploadingMeetupBanner.value = false;
  }
};

const resetMeetupBanner = () => {
  meetupForm.banner_image = '';
  meetupBannerCompressionStats.value = null;
  meetupBannerError.value = '';
};

const insertMeetupDescriptionTemplate = (type: 'ketentuan' | 'dresscode' | 'rundown') => {
  let template = '';
  if (type === 'ketentuan') {
    template = `\n\n⚠️ KETENTUAN KEHADIRAN & POINT MEETUP:\n- Wajib hadir bagi seluruh member regional sesuai agenda.\n- Kehadiran bernilai +1 Point Keaktifan Komunitas.\n- Member yang mangkir / tidak hadir tanpa konfirmasi dikenakan penalti -1 Point.\n- Izin dinas / sakit wajib konfirmasi ke staff sebelum acara dimulai (Dispensasi 0 Point).`;
  } else if (type === 'dresscode') {
    template = `\n\n👕 DRESSCODE & ATURAN:\n- Pakaian bebas, rapi, dan sopan (Kaos Komunitas XFIVE sangat disarankan).\n- Dilarang membawa senjata tajam / miras / zat terlarang.\n- Menjaga nama baik komunitas XFIVE dan kebersihan venue.`;
  } else if (type === 'rundown') {
    template = `\n\n🕒 ESTIMASI SUSUNAN ACARA (RUNDOWN):\n- 14:00 - 14:30: Kumpul, registrasi & scan QR presensi GPS\n- 14:30 - 16:00: Main bareng / Billing santai / Fun mini tournament\n- 16:00 - 17:00: Sesi sharing, evaluasi komunitas & foto dokumentasi bersama\n- 17:00 - 18:00: Ramah tamah, makan bareng & penutupan`;
  }

  if (meetupForm.description && meetupForm.description.trim()) {
    meetupForm.description += template;
  } else {
    meetupForm.description = template.trim();
  }
};

const handleParseMapsLink = async () => {
  const url = meetupForm.maps_url.trim();
  if (!url) {
    mapsParseFeedback.value = {
      type: 'error',
      message: 'Masukkan tautan Google Maps terlebih dahulu (bisa link share maps.app.goo.gl atau URL browser).',
    };
    return;
  }

  isParsingMapsLink.value = true;
  mapsParseFeedback.value = null;

  try {
    const res = await parseMapsLink(url);
    if (res?.success) {
      const { name, latitude, longitude, region, maps_url } = res.data || {};
      if (name) meetupForm.location_name = name;
      if (latitude) meetupForm.latitude = latitude;
      if (longitude) meetupForm.longitude = longitude;
      if (region) {
        meetupForm.region = region;
        selectedRegions.value = region.split(',').map((r: string) => r.trim().toUpperCase());
      }
      if (maps_url) meetupForm.maps_url = maps_url;

      mapsParseFeedback.value = {
        type: 'success',
        message: `Berhasil mengekstrak lokasi: "${name || 'Lokasi'}" (${latitude}, ${longitude}) - Wilayah: ${region}`,
      };
    } else {
      mapsParseFeedback.value = {
        type: 'error',
        message: res?.message || 'Tidak dapat mendeteksi koordinat dari tautan tersebut. Silakan isi manual.',
      };
    }
  } catch (err: any) {
    mapsParseFeedback.value = {
      type: 'error',
      message: err.message || 'Gagal menghubungi server untuk parsing link.',
    };
  } finally {
    isParsingMapsLink.value = false;
  }
};

const getQrImageUrl = (token: string) => {
  if (!token) return '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const scanUrl = `${origin}/meetup/scan?token=${token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(scanUrl)}`;
};

const detectAdminGps = () => {
  if (!navigator.geolocation) {
    toast.error('Browser tidak mendukung Geolocation GPS.', 'GPS Tidak Didukung');
    return;
  }
  isDetectingAdminGps.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      meetupForm.latitude = Math.round(pos.coords.latitude * 1000000) / 1000000;
      meetupForm.longitude = Math.round(pos.coords.longitude * 1000000) / 1000000;
      isDetectingAdminGps.value = false;
      toast.success('Koordinat GPS berhasil dikunci!', 'GPS Terdeteksi');
    },
    (err) => {
      isDetectingAdminGps.value = false;
      toast.error('Gagal mendeteksi lokasi GPS: ' + err.message, 'GPS Error');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

const handleSaveMeetup = async () => {
  meetupFormError.value = '';
  if (!meetupForm.title.trim() || !meetupForm.location_name.trim()) {
    meetupFormError.value = 'Judul acara dan nama tempat meetup wajib diisi.';
    return;
  }

  isSavingMeetup.value = true;
  const res = await saveMeetup({
    title: meetupForm.title.trim(),
    meetup_date: meetupForm.meetup_date,
    start_time: meetupForm.start_time,
    end_time: meetupForm.end_time,
    region: selectedRegions.value.join(', ') || 'TANGERANG',
    location_name: meetupForm.location_name.trim(),
    banner_image: meetupForm.banner_image.trim() || null,
    maps_url: meetupForm.maps_url.trim(),
    latitude: meetupForm.latitude,
    longitude: meetupForm.longitude,
    radius_meters: meetupForm.radius_meters,
    description: meetupForm.description.trim(),
  });

  if (res.success) {
    addMeetupModalOpen.value = false;
  } else {
    meetupFormError.value = res.message || 'Gagal membuat meetup.';
  }
  isSavingMeetup.value = false;
};

const openQrModal = (m: MeetupItem) => {
  qrMeetup.value = m;
  qrModalOpen.value = true;
};

const openMonitorModal = async (m: MeetupItem) => {
  selectedMeetup.value = m;
  attendanceStatusFilter.value = 'all';
  attendanceSearchQuery.value = '';
  attendancePage.value = 1;
  monitorMeetupModalOpen.value = true;
  await loadAttendances(m.id);
};

const loadAttendances = async (meetupId: number) => {
  loadingAttendances.value = true;
  attendancesList.value = await fetchAttendances(meetupId);
  loadingAttendances.value = false;
};

const handleFinalizeMeetup = async (m: MeetupItem) => {
  const ok = await confirmModal({
    title: 'FINALISASI MEETUP & PENALTI',
    message: `Apakah kamu yakin ingin menyelesaikan meetup "${m.title}"?\nSeluruh member yang berstatus TIDAK_HADIR akan langsung dikenakan penalti -1 Poin di profil mereka.`,
    confirmText: 'Ya, Finalisasi Sekarang',
    cancelText: 'Batal',
    type: 'danger',
  });
  if (!ok) return;

  isFinalizingMeetup.value = true;
  const res = await finalizeMeetup(m.id);
  if (res.success) {
    toast.success(res.message || 'Meetup berhasil difinalisasi.', 'Meetup Selesai');
    if (selectedMeetup.value && selectedMeetup.value.id === m.id) {
      await loadAttendances(m.id);
    }
  } else {
    toast.error(res.message || 'Gagal memfinalisasi meetup.', 'Gagal Finalisasi');
  }
  isFinalizingMeetup.value = false;
};

const changeAttendanceStatus = async (att: MeetupAttendanceItem, newStatus: string) => {
  const res = await updateAttendanceStatus(att.meetup_id, att.member_code, newStatus);
  if (res.success) {
    toast.success(`Status ${att.nickname} diubah menjadi ${newStatus}.`, 'Absensi Diperbarui');
    if (selectedMeetup.value) {
      await loadAttendances(selectedMeetup.value.id);
    }
  } else {
    toast.error(res.message || 'Gagal mengubah status absensi.', 'Gagal');
  }
};

const handleDeleteMeetup = async (m: MeetupItem) => {
  const ok = await confirmModal({
    title: 'HAPUS MEETUP',
    message: `Hapus agenda meetup "${m.title}" beserta seluruh data absensinya secara permanen?`,
    confirmText: 'Ya, Hapus Meetup',
    cancelText: 'Batal',
    type: 'danger',
  });
  if (!ok) return;

  const res = await deleteMeetup(m.id);
  if (res.success) {
    toast.success(`Meetup "${m.title}" berhasil dihapus.`, 'Meetup Dihapus');
  } else {
    toast.error(res.message || 'Gagal menghapus meetup.', 'Gagal');
  }
};

const exportAttendanceToExcel = () => {
  const fullList = attendancesList.value;
  if (!fullList || fullList.length === 0) {
    toast.warning('Tidak ada data presensi yang tercatat untuk diekspor.', 'Data Kosong');
    return;
  }

  const exportData = fullList.map((att) => ({
    'Member Code': att.member_code || '-',
    Nama: att.member_name || '-',
    Nickname: att.nickname || '-',
    Domisili: att.member_domisili || '-',
    Status: att.status || '-',
    'Poin Delta': att.points_delta,
    Keterangan: att.keterangan || '-',
    'Jarak (Meter)': att.distance_meters !== null && att.distance_meters !== undefined ? `${att.distance_meters}m` : '-',
    'Waktu Scan': att.scanned_at ? new Date(att.scanned_at).toLocaleString('id-ID') : '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi Meetup');

  const safeTitle = (selectedMeetup.value?.title || 'Meetup').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeDate = selectedMeetup.value?.meetup_date || 'date';
  const fileName = `Presensi_${safeTitle}_${safeDate}.xlsx`;

  XLSX.writeFile(workbook, fileName);
  toast.success(`Berhasil mengunduh seluruh ${fullList.length} data presensi ke Excel.`, 'Export Sukses');
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Top Bar: Actions & Filters -->
    <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
      <div class="flex flex-wrap gap-2 w-full md:w-auto flex-1">
        <div class="relative flex-1 min-w-[200px]">
          <Search class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="meetupSearch"
            type="text"
            placeholder="Cari judul acara, tempat, wilayah..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none font-mono"
          />
        </div>

        <select
          v-model="meetupRegionFilter"
          class="px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-gray-300 text-xs outline-none"
        >
          <option value="all">Semua Wilayah</option>
          <option value="TANGERANG">Tangerang</option>
          <option value="JAKARTA">Jakarta</option>
          <option value="BEKASI">Bekasi</option>
          <option value="DEPOK">Depok</option>
          <option value="BOGOR">Bogor</option>
          <option value="BANDUNG">Bandung</option>
          <option value="SERANG-CILEGON">Serang / Cilegon</option>
          <option value="SEMARANG">Semarang</option>
          <option value="SURABAYA">Surabaya</option>
          <option value="YOGYAKARTA">Yogyakarta</option>
          <option value="NASIONAL">Nasional (Akbar)</option>
        </select>
      </div>

      <button
        @click="openAddMeetupModal"
        class="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-orbitron font-bold tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,255,0.3)] whitespace-nowrap"
      >
        <Plus class="w-4 h-4" />
        <span>Inisiasi Meetup Baru</span>
      </button>
    </div>

    <!-- Meetup List Table -->
    <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead class="bg-black/50 text-cyan-400 border-b border-white/5 font-orbitron uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3 px-4">Agenda Meetup</th>
              <th class="py-3 px-4">Wilayah</th>
              <th class="py-3 px-4">Waktu &amp; Tanggal</th>
              <th class="py-3 px-4">Lokasi &amp; Radius GPS</th>
              <th class="py-3 px-4 text-center">Presensi (H / M / I)</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-sans">
            <tr v-if="loadingMeetups">
              <td colspan="7" class="text-center py-12 text-gray-500 font-mono">
                <RefreshCw class="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                Memuat data agenda meetup...
              </td>
            </tr>
            <tr v-else-if="filteredMeetups.length === 0">
              <td colspan="7" class="text-center py-12 text-gray-500 font-mono">
                Belum ada agenda meetup yang sesuai.
              </td>
            </tr>
            <tr
              v-for="m in filteredMeetups"
              :key="m.id"
              class="hover:bg-cyan-500/[0.02] transition"
            >
              <td class="py-3 px-4">
                <div class="font-bold text-white font-orbitron text-xs">{{ m.title }}</div>
                <div class="text-[10px] text-cyan-400 font-mono mt-0.5">Token: {{ m.qr_token }}</div>
              </td>

              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1 max-w-[200px]">
                  <span
                    v-for="r in (m.region || '').split(',').map((s: string) => s.trim()).filter(Boolean)"
                    :key="r"
                    class="px-2 py-0.5 rounded text-[10px] font-bold font-orbitron uppercase transition whitespace-nowrap"
                    :class="
                      r === 'NASIONAL'
                        ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                        : 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-300'
                    "
                  >
                    {{ r }}
                  </span>
                </div>
              </td>

              <td class="py-3 px-4 font-mono text-gray-300">
                <div>{{ m.meetup_date }}</div>
                <div class="text-[10px] text-gray-500">{{ m.start_time }} – {{ m.end_time }} WIB</div>
              </td>

              <td class="py-3 px-4 text-gray-300 font-mono">
                <div class="font-bold text-white flex items-center gap-1.5">
                  <span class="truncate max-w-[180px]">{{ m.location_name }}</span>
                  <a
                    :href="m.maps_url || `https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-cyan-400 hover:text-cyan-300 text-xs"
                    title="Buka Lokasi di Google Maps"
                  >
                    <ExternalLink class="w-3 h-3" />
                  </a>
                </div>
                <div class="text-[10px] text-gray-400">
                  GPS: {{ Number(m.latitude).toFixed(4) }}, {{ Number(m.longitude).toFixed(4) }} (±{{ m.radius_meters || 10 }}m)
                </div>
              </td>

              <td class="py-3 px-4 text-center font-mono">
                <span class="text-emerald-400 font-bold" title="Hadir">{{ m.total_hadir || 0 }}</span> / 
                <span class="text-red-400 font-bold" title="Mangkir / Minus">{{ m.total_tidak_hadir || 0 }}</span> / 
                <span class="text-amber-400 font-bold" title="Izin">{{ m.total_izin || 0 }}</span>
              </td>

              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold font-orbitron uppercase"
                  :class="
                    m.status === 'ACTIVE' ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' :
                    m.status === 'COMPLETED' ? 'bg-gray-800 text-gray-400' :
                    'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                  "
                >
                  {{ m.status }}
                </span>
              </td>

              <td class="py-3 px-4 text-right">
                <div class="inline-flex items-center gap-1.5">
                  <button
                    @click="openQrModal(m)"
                    class="px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Tampilkan Barcode QR untuk Proyektor / Sharing"
                  >
                    <QrCode class="w-3.5 h-3.5" />
                    <span>QR Code</span>
                  </button>

                  <button
                    @click="openMonitorModal(m)"
                    class="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Pantau daftar absensi &amp; atur izin"
                  >
                    <Users class="w-3 h-3 text-cyan-400" />
                    <span>Absensi</span>
                  </button>

                  <button
                    v-if="m.status === 'ACTIVE'"
                    @click="handleFinalizeMeetup(m)"
                    :disabled="isFinalizingMeetup"
                    class="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Selesaikan meetup &amp; kenakan penalti -1 poin otomatis bagi yang mangkir"
                  >
                    <Check class="w-3 h-3 text-emerald-400" />
                    <span>Finalisasi</span>
                  </button>

                  <button
                    @click="handleDeleteMeetup(m)"
                    class="p-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] transition cursor-pointer"
                    title="Hapus meetup"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Inisiasi Meetup Baru -->
    <Teleport to="body">
      <div
        v-if="addMeetupModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
        @click.self="addMeetupModalOpen = false"
      >
        <div 
          class="rounded-2xl border border-cyan-500/40 bg-[#0d121c] p-4 sm:p-6 w-full max-w-xl shadow-[0_0_50px_rgba(0,255,255,0.2)] my-auto overflow-y-auto"
          style="max-height: min(90vh, 700px);"
        >
        <div class="flex items-center justify-between pb-3 sm:pb-4 mb-4 border-b border-white/5">
          <div class="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-sm sm:text-base">
            <Plus class="w-5 h-5" />
            <span>INISIASI AGENDA MEETUP BARU</span>
          </div>
          <button @click="addMeetupModalOpen = false" class="text-gray-400 hover:text-white cursor-pointer text-sm sm:text-base">✕</button>
        </div>

        <form @submit.prevent="handleSaveMeetup" class="space-y-4 text-xs">
          <div>
            <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Judul Acara Meetup *</label>
            <input
              v-model="meetupForm.title"
              type="text"
              required
              placeholder="Contoh: Meetup Rutin Regional Tangerang #5"
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div>
              <MultiSearchSelect
                v-model="selectedRegions"
                label="Domisili"
                placeholder="Cari & pilih 1 atau lebih Kota/Kab..."
                :options="regionOptions"
                :presets="regionPresets"
                @change="onSelectedRegionsChange"
              />
            </div>
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1.5 font-bold">Tanggal Acara *</label>
              <input
                ref="meetupDateInputRef"
                v-model="meetupForm.meetup_date"
                type="date"
                required
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none [color-scheme:dark]"
                @click="openMeetupDatePicker"
              />
              <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span class="text-[10px] font-mono text-gray-500">Pilih Cepat:</span>
                <button
                  type="button"
                  @click="setQuickMeetupDate(0)"
                  class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-[10px] font-mono transition cursor-pointer border border-white/5 hover:border-cyan-500/30"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  @click="setQuickMeetupDate(1)"
                  class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-[10px] font-mono transition cursor-pointer border border-white/5 hover:border-cyan-500/30"
                >
                  Besok
                </button>
                <button
                  type="button"
                  @click="setQuickMeetupDate('next-sat')"
                  class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-[10px] font-mono transition cursor-pointer border border-white/5 hover:border-cyan-500/30"
                >
                  Sabtu Ini
                </button>
                <button
                  type="button"
                  @click="setQuickMeetupDate('next-sun')"
                  class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-[10px] font-mono transition cursor-pointer border border-white/5 hover:border-cyan-500/30"
                >
                  Minggu Ini
                </button>
              </div>
            </div>
          </div>

          <!-- Cover Banner Meetup -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider font-bold">Foto Cover Banner Meetup</label>
              <div class="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/5">
                <button
                  type="button"
                  @click="meetupBannerMode = 'url'"
                  :class="meetupBannerMode === 'url' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                  class="px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer"
                >
                  URL Link
                </button>
                <button
                  type="button"
                  @click="meetupBannerMode = 'upload'"
                  :class="meetupBannerMode === 'upload' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                  class="px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles class="w-3 h-3" />
                  <span>Upload WebP (~70KB)</span>
                </button>
              </div>
            </div>

            <div v-if="meetupBannerMode === 'url'" class="space-y-1.5">
              <input
                v-model="meetupForm.banner_image"
                type="url"
                placeholder="https://images.unsplash.com/... atau URL banner"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              />
            </div>

            <div v-else class="space-y-2">
              <div
                v-if="!meetupForm.banner_image"
                @dragover.prevent="meetupBannerDragOver = true"
                @dragleave.prevent="meetupBannerDragOver = false"
                @drop.prevent="handleMeetupBannerDrop"
                :class="meetupBannerDragOver ? 'border-cyan-400 bg-cyan-950/20' : 'border-gray-800 bg-black/40'"
                class="border-2 border-dashed hover:border-cyan-500/60 rounded-xl p-4 text-center transition cursor-pointer relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  @change="handleMeetupBannerFileSelect"
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div v-if="isUploadingMeetupBanner" class="space-y-2 py-2">
                  <RefreshCw class="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <p class="text-xs font-mono text-cyan-300">Mengompresi ke WebP 16:9 &amp; mengunggah...</p>
                </div>
                <div v-else class="space-y-1 py-1">
                  <Upload class="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <p class="text-xs font-orbitron text-gray-200">Tarik &amp; lepas banner meetup atau <span class="text-cyan-400 underline">Pilih File</span></p>
                  <p class="text-[10px] font-mono text-gray-500">Otomatis di-convert ke WebP 16:9 ultra-ringan (~70KB).</p>
                </div>
              </div>

              <div
                v-if="meetupBannerCompressionStats"
                class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono"
              >
                <div class="flex items-center gap-2 text-cyan-300">
                  <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kompresi: {{ meetupBannerCompressionStats.original }} &rarr; <strong class="text-white">{{ meetupBannerCompressionStats.compressed }}</strong></span>
                </div>
                <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Hemat {{ meetupBannerCompressionStats.reduction }}%
                </span>
              </div>

              <div v-if="meetupBannerError" class="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono flex items-center gap-2">
                <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ meetupBannerError }}</span>
              </div>
            </div>

            <div v-if="meetupForm.banner_image" class="relative mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/60 aspect-video max-h-40 group">
              <img :src="meetupForm.banner_image" alt="Banner Preview" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  @click="resetMeetupBanner"
                  class="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-orbitron font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>Ganti Banner</span>
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Jam Mulai</label>
              <input
                v-model="meetupForm.start_time"
                type="time"
                required
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 text-white text-xs outline-none"
              />
            </div>
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Jam Selesai</label>
              <input
                v-model="meetupForm.end_time"
                type="time"
                required
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 text-white text-xs outline-none"
              />
            </div>
          </div>

          <!-- Link Google Maps -->
          <div class="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
            <div class="flex items-center justify-between">
              <label class="block font-orbitron text-cyan-300 uppercase tracking-wider font-bold text-xs flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5" />
                <span>Link Google Maps (Rekomendasi Auto-Fill)</span>
              </label>
            </div>
            <div class="flex gap-2">
              <input
                v-model="meetupForm.maps_url"
                type="url"
                placeholder="https://maps.app.goo.gl/... atau link Google Maps"
                class="flex-1 p-2.5 rounded-xl bg-black/60 border border-cyan-500/40 text-white text-xs outline-none font-mono"
              />
              <button
                type="button"
                @click="handleParseMapsLink"
                :disabled="isParsingMapsLink || !meetupForm.maps_url"
                class="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
              >
                <RefreshCw v-if="isParsingMapsLink" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ isParsingMapsLink ? 'Parsing...' : 'Ekstrak Lokasi' }}</span>
              </button>
            </div>

            <div
              v-if="mapsParseFeedback"
              :class="mapsParseFeedback.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-red-950/60 border-red-500/40 text-red-300'"
              class="p-2.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5"
            >
              <span>{{ mapsParseFeedback.message }}</span>
            </div>
          </div>

          <div>
            <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Nama Tempat / Venue Fisik *</label>
            <input
              v-model="meetupForm.location_name"
              type="text"
              required
              placeholder="Contoh: Warnet Level One Gandaria / Kopi Kenangan"
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 text-white text-xs outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Latitude GPS</label>
              <input
                v-model.number="meetupForm.latitude"
                type="number"
                step="any"
                required
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 text-cyan-300 font-mono text-xs outline-none"
              />
            </div>
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Longitude GPS</label>
              <input
                v-model.number="meetupForm.longitude"
                type="number"
                step="any"
                required
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 text-cyan-300 font-mono text-xs outline-none"
              />
            </div>
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Radius Toleransi</label>
              <select
                v-model.number="meetupForm.radius_meters"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 text-white text-xs outline-none"
              >
                <option :value="10">10 Meter (Ketepatan Tinggi)</option>
                <option :value="20">20 Meter</option>
                <option :value="30">30 Meter (Rekomendasi)</option>
                <option :value="50">50 Meter (Area Luas / Mall)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            @click="detectAdminGps"
            :disabled="isDetectingAdminGps"
            class="w-full py-2 rounded-xl border border-dashed border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw v-if="isDetectingAdminGps" class="w-3.5 h-3.5 animate-spin" />
            <MapPin v-else class="w-3.5 h-3.5" />
            <span>Kunci Titik GPS Berdasarkan Lokasi Saya Saat Ini</span>
          </button>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider font-bold">Deskripsi &amp; Peraturan Meetup</label>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="insertMeetupDescriptionTemplate('ketentuan')"
                  class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                >
                  + Template Point
                </button>
                <button
                  type="button"
                  @click="insertMeetupDescriptionTemplate('dresscode')"
                  class="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition cursor-pointer"
                >
                  + Dresscode
                </button>
                <button
                  type="button"
                  @click="insertMeetupDescriptionTemplate('rundown')"
                  class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                >
                  + Rundown
                </button>
              </div>
            </div>
            <textarea
              v-model="meetupForm.description"
              rows="4"
              placeholder="Deskripsi kegiatan, rundown, ketentuan absensi..."
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none"
            ></textarea>
          </div>

          <div v-if="meetupFormError" class="p-2.5 rounded-lg bg-red-950/80 border border-red-500 text-red-300 text-xs">
            {{ meetupFormError }}
          </div>

          <div class="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-white/5">
            <button
              type="button"
              @click="addMeetupModalOpen = false"
              class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSavingMeetup"
              class="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw v-if="isSavingMeetup" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSavingMeetup ? 'Menyimpan...' : 'Buat Agenda Meetup' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>

    <!-- Modal: Monitoring Presensi & Atur Izin -->
    <Teleport to="body">
      <div
        v-if="monitorMeetupModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
        @click.self="monitorMeetupModalOpen = false"
      >
        <div 
          class="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-[#0d131f] p-3.5 sm:p-5 shadow-2xl flex flex-col my-auto overflow-hidden"
          style="max-height: calc(100vh - 2.5rem); height: min(85vh, 720px);"
        >
        <div class="flex items-start justify-between gap-2.5 pb-3 sm:pb-4 border-b border-white/10 mb-3 sm:mb-4 shrink-0">
          <div class="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Users class="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-xs sm:text-base font-black font-orbitron uppercase tracking-wider text-white leading-tight break-words">
                Pantau Presensi Meetup: {{ selectedMeetup?.title }}
              </h2>
              <p class="text-[10px] sm:text-[11px] text-gray-400 font-mono mt-0.5 break-words">
                Wilayah {{ selectedMeetup?.region }} · Lokasi: {{ selectedMeetup?.location_name }}
              </p>
            </div>
          </div>
          <button
            @click="monitorMeetupModalOpen = false"
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer shrink-0 text-xs sm:text-sm"
          >
            ✕
          </button>
        </div>

        <div class="flex flex-col gap-2.5 mb-3 sm:mb-4 shrink-0">
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              v-for="s in [
                { key: 'all', label: 'Semua Status' },
                { key: 'HADIR', label: 'Hadir' },
                { key: 'TIDAK_HADIR', label: 'Mangkir (-1)' },
                { key: 'IZIN', label: 'Izin (0)' }
              ]"
              :key="s.key"
              @click="attendanceStatusFilter = s.key"
              class="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono transition cursor-pointer whitespace-nowrap shrink-0"
              :class="attendanceStatusFilter === s.key ? 'bg-cyan-500 text-black font-bold' : 'bg-black/50 border border-white/10 text-gray-400 hover:text-white'"
            >
              {{ s.label }}
            </button>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div class="relative w-full sm:flex-1 sm:max-w-xs">
              <input
                v-model="attendanceSearchQuery"
                type="text"
                placeholder="Cari Member Code / Nama / Nick / Domisili..."
                class="w-full pl-8 pr-7 py-1.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-cyan-300 font-mono text-xs outline-none"
              />
              <Search class="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <button
                v-if="attendanceSearchQuery"
                @click="attendanceSearchQuery = ''"
                class="text-gray-500 hover:text-white absolute right-2 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 sm:pb-0 shrink-0">
              <button
                @click="exportAttendanceToExcel"
                class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-mono flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.15)] whitespace-nowrap shrink-0"
                title="Unduh seluruh data presensi meetup ini ke file Excel (.xlsx)"
              >
                <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span class="whitespace-nowrap">Export to Excel</span>
              </button>

              <button
                v-if="selectedMeetup"
                @click="loadAttendances(selectedMeetup.id)"
                class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-[11px] sm:text-xs font-mono flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <RefreshCw :class="loadingAttendances ? 'animate-spin' : ''" class="w-3 h-3 text-cyan-400 shrink-0" />
                <span class="whitespace-nowrap">Refresh</span>
              </button>

              <button
                v-if="selectedMeetup && selectedMeetup.status === 'ACTIVE'"
                @click="handleFinalizeMeetup(selectedMeetup)"
                class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-orbitron font-bold transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)] whitespace-nowrap shrink-0"
              >
                <Check class="w-3.5 h-3.5 shrink-0" />
                <span class="whitespace-nowrap">Finalisasi Poin</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Table Container -->
        <div class="flex-1 min-h-0 overflow-x-auto overflow-y-auto border border-white/5 rounded-xl bg-black/40 relative">
          <table class="w-full text-left text-xs border-collapse min-w-[860px]">
            <thead class="bg-black/60 text-cyan-400 border-b border-white/5 font-orbitron uppercase tracking-wider text-[10px] sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th class="py-2.5 px-3 whitespace-nowrap">Member Code</th>
                <th class="py-2.5 px-3 whitespace-nowrap">Nama</th>
                <th class="py-2.5 px-3 whitespace-nowrap">Nickname</th>
                <th class="py-2.5 px-3 whitespace-nowrap">Domisili</th>
                <th class="py-2.5 px-3 text-center whitespace-nowrap">Status Kehadiran</th>
                <th class="py-2.5 px-3 text-center whitespace-nowrap">Point</th>
                <th class="py-2.5 px-3 whitespace-nowrap">Verifikasi</th>
                <th class="py-2.5 px-3 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-sans">
              <tr v-if="loadingAttendances">
                <td colspan="8" class="text-center py-12 text-gray-500 font-mono">
                  <RefreshCw class="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                  Memuat data presensi meetup...
                </td>
              </tr>
              <tr v-else-if="filteredAttendances.length === 0">
                <td colspan="8" class="text-center py-12 text-gray-500 font-mono">
                  Belum ada catatan presensi yang cocok dengan filter / pencarian.
                </td>
              </tr>
              <tr
                v-for="att in paginatedAttendances"
                :key="att.id"
                class="hover:bg-cyan-500/[0.03] transition"
              >
                <td class="py-2.5 px-3 font-mono text-cyan-300 font-bold text-[11px] whitespace-nowrap">
                  {{ att.member_code }}
                </td>
                <td class="py-2.5 px-3 text-white font-medium text-xs max-w-[180px] break-words">
                  {{ att.member_name || '-' }}
                </td>
                <td class="py-2.5 px-3 font-orbitron font-bold text-cyan-400 whitespace-nowrap">
                  {{ att.nickname }}
                </td>
                <td class="py-2.5 px-3 text-gray-300 font-mono text-[11px] whitespace-nowrap">
                  {{ att.member_domisili || '-' }}
                </td>
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <span
                    class="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-orbitron uppercase"
                    :class="
                      att.status === 'HADIR' ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' :
                      att.status === 'TIDAK_HADIR' ? 'bg-red-950 border border-red-500/40 text-red-300' :
                      'bg-amber-950 border border-amber-500/40 text-amber-300'
                    "
                  >
                    {{ att.status }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-center font-mono font-bold whitespace-nowrap">
                  <span
                    :class="
                      att.points_delta > 0 ? 'text-emerald-400' :
                      att.points_delta < 0 ? 'text-red-400' :
                      'text-gray-400'
                    "
                  >
                    {{ att.points_delta > 0 ? '+' : '' }}{{ att.points_delta }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-[11px] font-mono min-w-[200px]">
                  <div class="text-gray-300">{{ att.keterangan || '-' }}</div>
                  <div v-if="att.distance_meters !== null && att.distance_meters !== undefined" class="text-[10px] text-cyan-400 mt-0.5">
                    📍 Jarak: {{ att.distance_meters }}m · {{ att.scanned_at ? new Date(att.scanned_at).toLocaleTimeString('id-ID') : '' }}
                  </div>
                </td>
                <td class="py-2.5 px-3 text-right whitespace-nowrap">
                  <button
                    @click="changeAttendanceStatus(att, att.status === 'IZIN' ? 'HADIR' : 'IZIN')"
                    class="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-mono transition cursor-pointer whitespace-nowrap"
                    title="Atur Dispensasi / Izin Dinas, Sakit, atau Kapal"
                  >
                    {{ att.status === 'IZIN' ? 'Ubah Hadir' : 'Set Izin (0 Poin)' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer & Pagination -->
        <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-gray-400 font-mono shrink-0">
          <div class="text-[11px] sm:text-xs text-center sm:text-left">
            Menampilkan <strong class="text-white">{{ filteredAttendances.length === 0 ? 0 : (attendancePage - 1) * attendancePageSize + 1 }}</strong> – 
            <strong class="text-white">{{ Math.min(attendancePage * attendancePageSize, filteredAttendances.length) }}</strong> 
            dari <strong class="text-cyan-400">{{ filteredAttendances.length }}</strong> data presensi
            <span v-if="filteredAttendances.length !== attendancesList.length" class="text-gray-500 text-[10px] ml-1">
              (difilter dari {{ attendancesList.length }})
            </span>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div v-if="attendanceTotalPages > 1" class="flex items-center gap-1 mx-auto sm:mx-0">
              <button
                @click="attendancePage--"
                :disabled="attendancePage <= 1"
                class="w-7 h-7 rounded-lg border border-white/10 bg-black/40 text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft class="w-3.5 h-3.5" />
              </button>
              <button
                v-for="p in attendanceTotalPages"
                :key="p"
                @click="attendancePage = p"
                class="w-7 h-7 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer"
                :class="attendancePage === p ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white'"
              >
                {{ p }}
              </button>
              <button
                @click="attendancePage++"
                :disabled="attendancePage >= attendanceTotalPages"
                class="w-7 h-7 rounded-lg border border-white/10 bg-black/40 text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              @click="monitorMeetupModalOpen = false"
              class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-orbitron text-xs transition cursor-pointer whitespace-nowrap ml-auto sm:ml-0"
            >
              TUTUP
            </button>
          </div>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Modal: QR Code Meetup -->
    <Teleport to="body">
      <div
        v-if="qrModalOpen && qrMeetup"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto"
        @click.self="qrModalOpen = false"
      >
        <div 
          class="rounded-2xl sm:rounded-3xl border border-cyan-500/50 bg-[#0d131f] p-4 sm:p-8 max-w-md w-full text-center shadow-[0_0_80px_rgba(0,255,255,0.25)] relative my-auto overflow-y-auto"
          style="max-height: min(92vh, 720px);"
        >
          <button
            @click="qrModalOpen = false"
            class="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-white p-1.5 sm:p-2 rounded-xl bg-white/5 cursor-pointer text-xs sm:text-sm"
          >
            ✕
          </button>

          <span class="inline-block px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-orbitron text-[10px] sm:text-xs font-bold uppercase mb-2 sm:mb-3">
            PRESENSI RESMI WILAYAH {{ qrMeetup.region }}
          </span>

          <h3 class="text-base sm:text-xl font-black font-orbitron text-white mb-1 break-words">
            {{ qrMeetup.title }}
          </h3>
          <p class="text-[10px] sm:text-xs text-gray-400 font-mono mb-4 sm:mb-6 break-words">
            {{ qrMeetup.location_name }} · Radius toleransi: {{ qrMeetup.radius_meters || 10 }}m
          </p>

          <div class="p-3 sm:p-6 bg-white rounded-2xl inline-block shadow-2xl mb-4 sm:mb-5 mx-auto border-2 sm:border-4 border-cyan-400 max-w-[260px] sm:max-w-none">
            <img
              :src="getQrImageUrl(qrMeetup.qr_token)"
              class="w-44 h-44 sm:w-64 sm:h-64 object-contain mx-auto"
              alt="QR Code Meetup"
            />
          </div>

          <p class="text-[11px] sm:text-xs text-cyan-300 font-mono font-bold mb-4">
            📱 Scan barcode ini menggunakan kamera HP &amp; nyalakan GPS untuk memvalidasi kehadiran
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <a
              :href="`/meetup/scan?token=${qrMeetup.qr_token}`"
              target="_blank"
              class="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs transition text-center"
            >
              Buka Halaman Scanner
            </a>
            <button
              @click="qrModalOpen = false"
              class="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-orbitron text-xs transition cursor-pointer text-center"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
