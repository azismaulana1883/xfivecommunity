<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Camera,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  AlertTriangle,
  Sparkles,
  Upload
} from 'lucide-vue-next';
import { useAdminGallery, type GalleryPhoto } from '@/composables/admin/useAdminGallery';
import { formatDate } from '@/utils/admin/adminFormatters';
import { compressBannerImage, formatFileSize } from '@/utils/imageCompressor';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import { adminApi } from '@/utils/admin/adminApi';

const props = withDefaults(
  defineProps<{
    meetupsList?: Array<{ id: number; title: string; meetup_date: string }>;
  }>(),
  {
    meetupsList: () => []
  }
);

const toast = useToast();
const { confirm: confirmModal } = useConfirm();
const { galleryList, loadingGallery, fetchGallery, saveGalleryPhoto, deleteGalleryPhoto } = useAdminGallery();

const gallerySearch = ref('');
const galleryRegionFilter = ref('all');
const galleryModalOpen = ref(false);
const galleryModalMode = ref<'create' | 'edit'>('create');
const editingGalleryId = ref<number | null>(null);
const galleryFormError = ref('');
const galleryUploadMode = ref<'url' | 'upload'>('url');
const isUploadingGalleryPhoto = ref(false);
const isSavingGallery = ref(false);
const galleryUploadError = ref('');
const galleryDateInputRef = ref<HTMLInputElement | null>(null);

const galleryCompressionStats = ref<{
  original: string;
  compressed: string;
  reduction: number;
} | null>(null);

const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const galleryForm = reactive({
  title: '',
  event_date: getLocalTodayDate(),
  region: 'BEKASI',
  location_name: '',
  meetup_id: null as number | null,
  image_url: '',
  description: '',
});

onMounted(() => {
  if (galleryList.value.length === 0) {
    fetchGallery();
  }
});

const openGalleryDatePicker = () => {
  if (galleryDateInputRef.value) {
    try {
      if (typeof (galleryDateInputRef.value as any).showPicker === 'function') {
        (galleryDateInputRef.value as any).showPicker();
      } else {
        galleryDateInputRef.value.focus();
      }
    } catch {
      galleryDateInputRef.value?.focus();
    }
  }
};

const setQuickGalleryDate = (offsetDays: number | 'last-sat' | 'last-sun') => {
  const d = new Date();
  if (typeof offsetDays === 'number') {
    d.setDate(d.getDate() + offsetDays);
  } else if (offsetDays === 'last-sat') {
    const day = d.getDay();
    const diff = day >= 6 ? (day - 6) : (day + 1);
    d.setDate(d.getDate() - (diff === 0 ? 7 : diff));
  } else if (offsetDays === 'last-sun') {
    const day = d.getDay();
    const diff = day === 0 ? 7 : day;
    d.setDate(d.getDate() - diff);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  galleryForm.event_date = `${year}-${month}-${day}`;
};

const filteredGallery = computed(() => {
  let list = galleryList.value;
  if (galleryRegionFilter.value !== 'all') {
    list = list.filter((g) => (g.region || '').toLowerCase() === galleryRegionFilter.value.toLowerCase());
  }
  if (gallerySearch.value.trim()) {
    const q = gallerySearch.value.toLowerCase().trim();
    list = list.filter((g) =>
      (g.title || '').toLowerCase().includes(q) ||
      (g.description || '').toLowerCase().includes(q) ||
      (g.location_name || '').toLowerCase().includes(q) ||
      (g.uploaded_by || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const openAddGalleryModal = () => {
  galleryModalMode.value = 'create';
  editingGalleryId.value = null;
  galleryForm.title = '';
  galleryForm.event_date = getLocalTodayDate();
  galleryForm.region = 'BEKASI';
  galleryForm.location_name = '';
  galleryForm.meetup_id = null;
  galleryForm.image_url = '';
  galleryForm.description = '';
  galleryFormError.value = '';
  galleryUploadMode.value = 'url';
  galleryCompressionStats.value = null;
  galleryUploadError.value = '';
  galleryModalOpen.value = true;
};

const openEditGalleryModal = (item: GalleryPhoto) => {
  galleryModalMode.value = 'edit';
  editingGalleryId.value = item.id;
  galleryForm.title = item.title || '';
  galleryForm.event_date = item.event_date ? String(item.event_date).split('T')[0] : getLocalTodayDate();
  galleryForm.region = item.region || 'BEKASI';
  galleryForm.location_name = item.location_name || '';
  galleryForm.meetup_id = item.meetup_id || null;
  galleryForm.image_url = item.image_url || '';
  galleryForm.description = item.description || '';
  galleryFormError.value = '';
  galleryUploadMode.value = item.image_url && item.image_url.startsWith('/uploads') ? 'upload' : 'url';
  galleryCompressionStats.value = null;
  galleryUploadError.value = '';
  galleryModalOpen.value = true;
};

const processAndUploadGalleryPhoto = async (file: File) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    galleryUploadError.value = 'File harus berupa gambar (JPG, PNG, WebP).';
    return;
  }

  isUploadingGalleryPhoto.value = true;
  galleryUploadError.value = '';

  try {
    const originalSize = file.size;
    const compressedResult = await compressBannerImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85,
      targetAspect: 16 / 9,
    });
    const compressedSize = compressedResult.compressedSize;
    const reduction = compressedResult.reductionPercentage;

    galleryCompressionStats.value = {
      original: formatFileSize(originalSize),
      compressed: formatFileSize(compressedSize),
      reduction: Math.max(0, reduction),
    };

    const formData = new FormData();
    formData.append('photo', compressedResult.file);

    const res = await adminApi.post('/api/v1/gallery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.data?.success && res.data?.url) {
      galleryForm.image_url = res.data.url;
      toast.success('Foto dokumentasi berhasil dikompresi & diunggah.', 'Upload Berhasil');
    } else {
      galleryUploadError.value = res.data?.message || 'Gagal mengunggah foto.';
    }
  } catch (err: any) {
    console.error('Error compress & upload gallery photo:', err);
    galleryUploadError.value = err.response?.data?.message || err.message || 'Gagal memproses gambar.';
  } finally {
    isUploadingGalleryPhoto.value = false;
  }
};

const handleGalleryFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processAndUploadGalleryPhoto(target.files[0]);
  }
};

const handleGalleryDrop = (e: DragEvent) => {
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    processAndUploadGalleryPhoto(e.dataTransfer.files[0]);
  }
};

const resetGalleryPhoto = () => {
  galleryForm.image_url = '';
  galleryCompressionStats.value = null;
  galleryUploadError.value = '';
};

const handleSaveGallery = async () => {
  if (!galleryForm.title.trim()) {
    galleryFormError.value = 'Judul foto dokumentasi wajib diisi.';
    return;
  }
  if (!galleryForm.event_date) {
    galleryFormError.value = 'Tanggal acara wajib dipilih.';
    return;
  }
  if (!galleryForm.image_url.trim()) {
    galleryFormError.value = 'Foto dokumentasi (URL atau Upload) wajib diisi.';
    return;
  }

  isSavingGallery.value = true;
  galleryFormError.value = '';

  const payload = {
    title: galleryForm.title.trim(),
    event_date: galleryForm.event_date,
    region: galleryForm.region,
    location_name: galleryForm.location_name.trim() || null,
    meetup_id: galleryForm.meetup_id || null,
    image_url: galleryForm.image_url.trim(),
    description: galleryForm.description.trim() || null,
  };

  const res = await saveGalleryPhoto(galleryModalMode.value, editingGalleryId.value, payload);
  if (res.success) {
    toast.success(
      galleryModalMode.value === 'create' ? 'Foto galeri berhasil ditambahkan.' : 'Foto galeri berhasil diperbarui.',
      'Berhasil'
    );
    galleryModalOpen.value = false;
  } else {
    galleryFormError.value = res.message || 'Gagal menyimpan foto galeri.';
  }
  isSavingGallery.value = false;
};

const handleDeleteGallery = async (item: GalleryPhoto) => {
  const confirmed = await confirmModal({
    title: 'HAPUS FOTO DOKUMENTASI',
    message: `Apakah Anda yakin ingin menghapus foto "${item.title}" (${item.region})?\nTindakan ini tidak dapat dibatalkan.`,
    confirmText: 'Ya, Hapus Foto',
    cancelText: 'Batal',
    type: 'danger',
  });

  if (!confirmed) return;

  const res = await deleteGalleryPhoto(item.id);
  if (res.success) {
    toast.success('Foto galeri berhasil dihapus.', 'Terhapus');
  } else {
    toast.error(res.message || 'Gagal menghapus foto galeri.', 'Gagal');
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Top Bar: Header & Actions -->
    <div class="rounded-2xl border border-cyan-500/20 bg-[#0c121e]/80 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <Camera class="w-5 h-5 text-cyan-400" />
          <h2 class="text-lg font-bold font-orbitron text-white">GALLERY MEET UP &amp; DOKUMENTASI</h2>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            {{ galleryList.length }} Foto
          </span>
        </div>
        <p class="text-xs text-gray-400 font-mono mt-1">
          Kelola foto kegiatan dan dokumentasi meetup regional komunitas XFIVE.
        </p>
      </div>
      <button
        @click="openAddGalleryModal"
        class="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-orbitron font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,255,0.3)] shrink-0"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Foto Dokumentasi</span>
      </button>
    </div>

    <!-- Summary Metric Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="rounded-2xl border border-white/5 bg-[#0c121e]/60 p-4">
        <span class="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Total Dokumentasi</span>
        <div class="text-2xl font-bold font-orbitron text-cyan-400 mt-1">{{ galleryList.length }}</div>
        <span class="text-[10px] text-gray-500 font-mono">Seluruh wilayah</span>
      </div>
      <div class="rounded-2xl border border-white/5 bg-[#0c121e]/60 p-4">
        <span class="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Bekasi</span>
        <div class="text-2xl font-bold font-orbitron text-emerald-400 mt-1">
          {{ galleryList.filter(g => (g.region || '').toUpperCase() === 'BEKASI').length }}
        </div>
        <span class="text-[10px] text-gray-500 font-mono">Foto regional Bekasi</span>
      </div>
      <div class="rounded-2xl border border-white/5 bg-[#0c121e]/60 p-4">
        <span class="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Tangerang</span>
        <div class="text-2xl font-bold font-orbitron text-purple-400 mt-1">
          {{ galleryList.filter(g => (g.region || '').toUpperCase() === 'TANGERANG').length }}
        </div>
        <span class="text-[10px] text-gray-500 font-mono">Foto regional Tangerang</span>
      </div>
      <div class="rounded-2xl border border-white/5 bg-[#0c121e]/60 p-4">
        <span class="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Jakarta &amp; Lainnya</span>
        <div class="text-2xl font-bold font-orbitron text-amber-400 mt-1">
          {{ galleryList.filter(g => !['BEKASI', 'TANGERANG'].includes((g.region || '').toUpperCase())).length }}
        </div>
        <span class="text-[10px] text-gray-500 font-mono">Jakarta, Bogor &amp; Gathering</span>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
      <div class="flex flex-wrap gap-2 w-full md:w-auto flex-1">
        <div class="relative flex-1 min-w-[200px]">
          <Search class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="gallerySearch"
            type="text"
            placeholder="Cari judul dokumentasi, tempat, uploader..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none font-mono"
          />
        </div>

        <select
          v-model="galleryRegionFilter"
          class="px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-gray-300 text-xs outline-none"
        >
          <option value="all">Semua Wilayah</option>
          <option value="BEKASI">Bekasi</option>
          <option value="TANGERANG">Tangerang</option>
          <option value="JAKARTA">Jakarta</option>
          <option value="BOGOR-DEPOK">Bogor-Depok</option>
          <option value="NASIONAL">Nasional</option>
          <option value="LAINNYA">Lainnya</option>
        </select>
      </div>

      <button
        @click="fetchGallery"
        class="px-3.5 py-2 rounded-xl bg-black/60 border border-gray-800 hover:border-cyan-400 text-gray-300 hover:text-white text-xs font-mono transition flex items-center gap-2 cursor-pointer"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="loadingGallery ? 'animate-spin text-cyan-400' : ''" />
        <span>Refresh</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loadingGallery" class="p-12 text-center rounded-2xl border border-white/5 bg-[#0c121e]/40">
      <RefreshCw class="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
      <p class="text-xs font-mono text-gray-400">Memuat data galeri meetup...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredGallery.length === 0" class="p-12 text-center rounded-2xl border border-white/5 bg-[#0c121e]/40">
      <Camera class="w-10 h-10 text-gray-600 mx-auto mb-3" />
      <p class="text-sm font-orbitron font-bold text-gray-300">Belum Ada Foto Dokumentasi</p>
      <p class="text-xs font-mono text-gray-500 mt-1 max-w-md mx-auto">
        {{ gallerySearch || galleryRegionFilter !== 'all' ? 'Tidak ada foto yang cocok dengan pencarian / filter Anda.' : 'Belum ada foto dokumentasi yang ditambahkan ke galeri meetup.' }}
      </p>
      <button
        v-if="!gallerySearch && galleryRegionFilter === 'all'"
        @click="openAddGalleryModal"
        class="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-black text-xs font-orbitron font-bold transition cursor-pointer"
      >
        + Tambah Foto Sekarang
      </button>
    </div>

    <!-- Gallery Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="photo in filteredGallery"
        :key="photo.id"
        class="group rounded-2xl border border-white/10 hover:border-cyan-500/50 bg-[#0c121e]/80 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.12)]"
      >
        <div class="relative aspect-video w-full bg-black/60 overflow-hidden">
          <img
            :src="photo.image_url"
            :alt="photo.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-orbitron font-bold bg-cyan-500/90 text-black shadow-md backdrop-blur-sm">
              {{ photo.region }}
            </span>
            <span v-if="photo.meetup_title" class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/70 border border-white/10 text-cyan-300 backdrop-blur-sm">
              {{ photo.meetup_title }}
            </span>
          </div>

          <div class="absolute top-3 right-3">
            <a
              :href="photo.image_url"
              target="_blank"
              rel="noopener noreferrer"
              title="Buka foto ukuran penuh"
              class="p-1.5 rounded-lg bg-black/70 hover:bg-cyan-500 text-gray-300 hover:text-black transition border border-white/10 backdrop-blur-sm inline-flex items-center"
            >
              <ExternalLink class="w-3.5 h-3.5" />
            </a>
          </div>

          <div class="absolute bottom-2.5 left-3 text-[11px] font-mono text-gray-300 flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5 text-cyan-400" />
            <span>{{ formatDate(photo.event_date) }}</span>
          </div>
        </div>

        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div class="space-y-1.5">
            <h3 class="text-sm font-bold font-orbitron text-white group-hover:text-cyan-400 transition line-clamp-1">
              {{ photo.title }}
            </h3>
            <div v-if="photo.location_name" class="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
              <MapPin class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span class="truncate">{{ photo.location_name }}</span>
            </div>
            <p v-if="photo.description" class="text-xs text-gray-400 font-mono line-clamp-2 leading-relaxed">
              {{ photo.description }}
            </p>
          </div>

          <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span class="text-[10px] text-gray-500">
              Oleh: <span class="text-gray-300">@{{ photo.uploaded_by || 'staff' }}</span>
            </span>
            <div class="flex items-center gap-1.5">
              <button
                @click="openEditGalleryModal(photo)"
                title="Edit Foto Dokumentasi"
                class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30 text-[11px] font-orbitron font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Edit class="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                @click="handleDeleteGallery(photo)"
                title="Hapus Foto Dokumentasi"
                class="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add / Edit Gallery Photo -->
    <div
      v-if="galleryModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div class="rounded-2xl border border-cyan-500/40 bg-[#0d121c] p-4 sm:p-6 w-full max-w-xl shadow-[0_0_50px_rgba(0,255,255,0.15)] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 sm:pb-4 mb-4 border-b border-white/10">
          <div class="flex items-center gap-2.5 text-cyan-400 font-orbitron font-bold text-xs sm:text-base">
            <Camera class="w-5 h-5" />
            <span>{{ galleryModalMode === 'create' ? 'TAMBAH FOTO DOKUMENTASI' : 'EDIT FOTO DOKUMENTASI' }}</span>
          </div>
          <button @click="galleryModalOpen = false" class="text-gray-400 hover:text-white cursor-pointer text-sm sm:text-base">✕</button>
        </div>

        <form @submit.prevent="handleSaveGallery" class="space-y-4 text-xs">
          <div v-if="galleryFormError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>{{ galleryFormError }}</span>
          </div>

          <div>
            <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Judul Foto Dokumentasi *</label>
            <input
              v-model="galleryForm.title"
              type="text"
              required
              placeholder="Contoh: Keseruan Meetup Akbar Jabodetabek di Shinkai Cafe"
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold flex items-center justify-between">
                <span>Tanggal Acara *</span>
                <span class="text-[10px] font-mono text-cyan-400 font-normal">Date Picker</span>
              </label>
              <div class="relative">
                <input
                  ref="galleryDateInputRef"
                  v-model="galleryForm.event_date"
                  type="date"
                  required
                  style="color-scheme: dark"
                  class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition cursor-pointer [color-scheme:dark]"
                  @click="openGalleryDatePicker"
                />
              </div>
              <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span class="text-[10px] font-mono text-gray-500">Pilih Cepat:</span>
                <button
                  type="button"
                  @click="setQuickGalleryDate(0)"
                  class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-[10px] font-mono transition cursor-pointer border border-white/5 hover:border-cyan-500/30"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  @click="setQuickGalleryDate(-1)"
                  class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-[10px] font-mono transition cursor-pointer border border-white/5 hover:border-cyan-500/30"
                >
                  Kemarin
                </button>
                <button
                  type="button"
                  @click="setQuickGalleryDate('last-sat')"
                  class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-[10px] font-mono transition cursor-pointer border border-white/5 hover:border-cyan-500/30"
                >
                  Sabtu Lalu
                </button>
                <button
                  type="button"
                  @click="setQuickGalleryDate('last-sun')"
                  class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-[10px] font-mono transition cursor-pointer border border-white/5 hover:border-cyan-500/30"
                >
                  Minggu Lalu
                </button>
              </div>
            </div>

            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Wilayah Domisili *</label>
              <select
                v-model="galleryForm.region"
                required
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              >
                <option value="BEKASI">Bekasi</option>
                <option value="TANGERANG">Tangerang</option>
                <option value="JAKARTA">Jakarta</option>
                <option value="BOGOR-DEPOK">Bogor-Depok</option>
                <option value="NASIONAL">Nasional</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Nama Tempat / Venue</label>
              <input
                v-model="galleryForm.location_name"
                type="text"
                placeholder="Contoh: Shinkai Pool & Cafe"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              />
            </div>

            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Terhubung ke Agenda Meetup</label>
              <select
                v-model="galleryForm.meetup_id"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              >
                <option :value="null">-- Dokumentasi Bebas (Tanpa Agenda) --</option>
                <option v-for="m in props.meetupsList" :key="m.id" :value="m.id">
                  {{ m.title }} ({{ formatDate(m.meetup_date) }})
                </option>
              </select>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider font-bold">Foto Dokumentasi *</label>
              <div class="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/5">
                <button
                  type="button"
                  @click="galleryUploadMode = 'url'"
                  :class="galleryUploadMode === 'url' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                  class="px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer"
                >
                  URL Link
                </button>
                <button
                  type="button"
                  @click="galleryUploadMode = 'upload'"
                  :class="galleryUploadMode === 'upload' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                  class="px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles class="w-3 h-3" />
                  <span>Upload WebP (~70KB)</span>
                </button>
              </div>
            </div>

            <div v-if="galleryUploadMode === 'url'" class="space-y-2">
              <input
                v-model="galleryForm.image_url"
                type="url"
                placeholder="https://images.unsplash.com/... atau URL gambar"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              />
              <p class="text-[10px] text-gray-500 font-mono">
                Tempel link foto langsung dari hosting gambar, Imgur, Cloudinary, atau Unsplash.
              </p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-if="!galleryForm.image_url"
                @dragover.prevent
                @drop.prevent="handleGalleryDrop"
                class="border-2 border-dashed border-gray-800 hover:border-cyan-500/60 rounded-xl p-4 sm:p-5 text-center bg-black/40 transition cursor-pointer relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  @change="handleGalleryFileSelect"
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div v-if="isUploadingGalleryPhoto" class="space-y-2 py-2">
                  <RefreshCw class="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <p class="text-xs font-mono text-cyan-300">Mengompresi ke WebP 16:9 &amp; mengunggah...</p>
                </div>
                <div v-else class="space-y-1 py-1">
                  <Upload class="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <p class="text-xs font-orbitron text-gray-200">Tarik &amp; lepas foto atau <span class="text-cyan-400 underline">Pilih File</span></p>
                  <p class="text-[10px] font-mono text-gray-500">
                    Otomatis dikompresi ke WebP 16:9 (~70KB) tanpa mengurangi ketajaman foto.
                  </p>
                </div>
              </div>

              <div v-if="galleryUploadError" class="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono flex items-center gap-2">
                <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ galleryUploadError }}</span>
              </div>

              <div
                v-if="galleryCompressionStats"
                class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono"
              >
                <div class="flex items-center gap-2 text-cyan-300">
                  <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kompresi: {{ galleryCompressionStats.original }} &rarr; <strong class="text-white">{{ galleryCompressionStats.compressed }}</strong></span>
                </div>
                <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Hemat {{ galleryCompressionStats.reduction }}%
                </span>
              </div>
            </div>

            <div v-if="galleryForm.image_url" class="relative mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/60 aspect-video group">
              <img
                :src="galleryForm.image_url"
                alt="Preview Dokumentasi"
                class="w-full h-full object-cover"
                @error="galleryUploadError = 'Gambar tidak dapat dimuat, periksa URL atau coba file lain.'"
              />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  @click="resetGalleryPhoto"
                  class="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-orbitron font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>Ganti Foto</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Keterangan / Caption Momen</label>
            <textarea
              v-model="galleryForm.description"
              rows="3"
              placeholder="Ceritakan momen seru saat kumpul, dresscode, games, atau cerita menarik di balik meetup ini..."
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition resize-none"
            ></textarea>
          </div>

          <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              @click="galleryModalOpen = false"
              class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSavingGallery || isUploadingGalleryPhoto"
              class="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              <RefreshCw v-if="isSavingGallery" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSavingGallery ? 'Menyimpan...' : (galleryModalMode === 'create' ? 'Simpan Dokumentasi' : 'Perbarui Dokumentasi') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
