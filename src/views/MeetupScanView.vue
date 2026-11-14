<template>
  <div class="min-h-screen bg-[#07090e] text-gray-200 font-sans pb-16 selection:bg-cyan-500 selection:text-black">
    <div class="container mx-auto px-4 max-w-xl py-8">
      <!-- HEADER CARD -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 mb-3 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
          <i class="fas fa-qrcode text-2xl"></i>
        </div>
        <h1 class="text-2xl font-black font-orbitron uppercase tracking-widest text-white">
          PRESENSI SCAN &amp; GPS
        </h1>
        <p class="text-xs text-gray-400 font-mono mt-1">
          Validasi Kehadiran Meetup Komunitas XFIVE
        </p>
      </div>

      <!-- LOADING MEETUP INFO -->
      <div v-if="loadingMeetup" class="p-8 text-center bg-[#0c121e] border border-white/5 rounded-2xl">
        <i class="fas fa-spinner fa-spin text-cyan-400 text-2xl mb-3"></i>
        <p class="text-xs text-gray-400 font-mono">Memuat data acara meetup...</p>
      </div>

      <!-- MEETUP NOT FOUND OR INVALID -->
      <div v-else-if="!currentMeetup" class="p-6 text-center bg-red-950/40 border border-red-500/40 rounded-2xl space-y-3">
        <i class="fas fa-exclamation-triangle text-red-400 text-3xl"></i>
        <h3 class="text-base font-bold font-orbitron text-white">Token Barcode Tidak Ditemukan</h3>
        <p class="text-xs text-red-300 leading-relaxed">
          Barcode yang kamu scan tidak valid atau acara belum dimulai. Silakan hubungi Dewan Staff di lokasi acara.
        </p>
        <router-link
          to="/meetup"
          class="inline-block mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-orbitron"
        >
          Lihat Jadwal Meetup
        </router-link>
      </div>

      <!-- MAIN SCAN & CHECKIN FORM -->
      <div v-else class="space-y-5">
        <!-- MEETUP INFO CARD -->
        <div class="rounded-2xl border border-cyan-500/30 bg-[#0d1424] p-5 shadow-[0_0_30px_rgba(0,255,255,0.08)]">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-orbitron text-[10px] font-bold uppercase">
              📍 WILAYAH {{ currentMeetup.region }}
            </span>
            <span class="px-2.5 py-0.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
              ● SEDANG BERLANGSUNG
            </span>
          </div>

          <h2 class="text-lg font-bold font-orbitron text-white mb-2">
            {{ currentMeetup.title }}
          </h2>

          <div class="space-y-1 text-xs text-gray-300 font-mono">
            <div><i class="fas fa-map-marker-alt text-red-400 w-4"></i> {{ currentMeetup.location_name }}</div>
            <div><i class="fas fa-clock text-cyan-400 w-4"></i> {{ currentMeetup.start_time }} – {{ currentMeetup.end_time }} WIB</div>
            <div><i class="fas fa-bullseye text-amber-400 w-4"></i> Toleransi Radius GPS: <strong class="text-amber-300">{{ formatDistance(currentMeetup.radius_meters || 10) }}</strong></div>
          </div>
        </div>

        <!-- STEP 1: GPS LOCATION CHECK -->
        <div class="rounded-2xl border p-5 transition-all"
          :class="isInsideRadius ? 'bg-emerald-950/20 border-emerald-500/40' : (gpsError ? 'bg-red-950/30 border-red-500/40' : 'bg-[#0c121e] border-white/10')"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold font-orbitron uppercase tracking-wider flex items-center gap-2"
              :class="isInsideRadius ? 'text-emerald-300' : 'text-gray-300'"
            >
              <i class="fas fa-satellite"></i>
              <span>1. Validasi Lokasi Fisik (GPS)</span>
            </h3>

            <button
              @click="requestLocation"
              class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 text-[10px] font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <i class="fas fa-sync-alt" :class="detectingLocation ? 'fa-spin' : ''"></i>
              <span>Deteksi Ulang</span>
            </button>
          </div>

          <!-- Detecting Indicator -->
          <div v-if="detectingLocation" class="p-4 rounded-xl bg-black/40 text-center space-y-2">
            <i class="fas fa-spinner fa-spin text-cyan-400 text-lg"></i>
            <p class="text-xs text-cyan-300 font-mono">Mendeteksi koordinat GPS perangkat kamu...</p>
          </div>

          <!-- GPS Error (Permission Denied, etc) -->
          <div v-else-if="gpsError" class="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs space-y-2">
            <div class="flex items-center gap-2 font-bold">
              <i class="fas fa-exclamation-circle text-red-400"></i>
              <span>Layanan Lokasi (GPS) Wajib Diaktifkan</span>
            </div>
            <p class="text-[11px] leading-relaxed text-gray-300">
              {{ gpsError }}
            </p>
            <button
              @click="requestLocation"
              class="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-orbitron font-bold transition cursor-pointer"
            >
              Nyalakan GPS &amp; Coba Lagi
            </button>
          </div>

          <!-- Location Detected & Inside Range -->
          <div v-else-if="isInsideRadius" class="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-1.5">
            <div class="flex items-center gap-2 font-bold text-emerald-300">
              <i class="fas fa-check-circle text-emerald-400 text-base"></i>
              <span>LOKASI TERVERIFIKASI DI TEMPAT MEETUP!</span>
            </div>
            <p class="text-[11px] font-mono text-gray-300">
              Jarak kamu: <strong class="text-emerald-400 font-bold">{{ formatDistance(distanceMeters) }}</strong> dari titik meetup (Toleransi: {{ formatDistance(currentMeetup.radius_meters || 10) }}).
            </p>
          </div>

          <!-- Location Detected But Outside Range -->
          <div v-else-if="distanceMeters !== null" class="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs space-y-1.5">
            <div class="flex items-center gap-2 font-bold text-red-300">
              <i class="fas fa-times-circle text-red-400 text-base"></i>
              <span>KAMU DI LUAR LOKASI ACARA!</span>
            </div>
            <p class="text-[11px] font-mono text-gray-300">
              Jarak kamu terdeteksi: <strong class="text-red-400 font-bold">{{ formatDistance(distanceMeters) }}</strong> dari tempat acara (Batas toleransi: {{ formatDistance(currentMeetup.radius_meters || 10) }}).
            </p>
            <p class="text-[10px] text-gray-400 italic">
              *Demi mencegah kecurangan, absensi hanya dapat dilakukan jika kamu berada di dalam area lokasi meetup.
            </p>
          </div>

          <!-- Waiting prompt -->
          <div v-else class="text-center py-3 text-xs text-gray-400 font-mono">
            Klik "Deteksi Ulang" untuk membaca posisi GPS kamu.
          </div>
        </div>

        <!-- STEP 2: MEMBER SELECTION & CONFIRMATION -->
        <div class="rounded-2xl border border-white/10 bg-[#0c121e] p-5 space-y-4">
          <h3 class="text-xs font-bold font-orbitron uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <i class="fas fa-user-check text-cyan-400"></i>
            <span>2. Pilih Data Member Kamu</span>
          </h3>

          <!-- Searchable Select / Dropdown -->
          <div>
            <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">
              Nickname Ayodance Kamu *
            </label>
            <div class="relative">
              <input
                v-model="memberSearchQuery"
                @focus="showDropdown = true"
                @input="showDropdown = true"
                type="text"
                placeholder="Ketik atau cari Nickname kamu..."
                class="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-cyan-500/30 focus:border-cyan-400 text-cyan-300 font-orbitron font-bold text-sm outline-none"
              />
              <button
                v-if="memberSearchQuery"
                type="button"
                @click="memberSearchQuery = ''; selectedMember = null; showDropdown = false"
                class="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                <i class="fas fa-times"></i>
              </button>
              <i class="fas fa-search absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"></i>
            </div>

            <!-- Autocomplete list -->
            <div
              v-if="showDropdown && filteredMembers.length > 0"
              class="mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#080d15] shadow-2xl divide-y divide-white/5 z-20"
            >
              <div
                v-for="m in filteredMembers.slice(0, 50)"
                :key="m.id"
                @click="selectMember(m)"
                class="p-2.5 hover:bg-cyan-500/10 cursor-pointer flex items-center justify-between text-xs transition"
              >
                <div>
                  <div class="font-bold text-white font-orbitron">{{ m.nickname }}</div>
                  <div class="text-[10px] text-gray-400">{{ m.name }} · {{ m.domisili || 'No Domisili' }}</div>
                </div>
                <span class="text-[10px] font-mono text-cyan-400">{{ m.member_code }}</span>
              </div>
              <div v-if="filteredMembers.length > 50" class="p-2 text-center text-[11px] text-gray-500 font-mono">
                Menampilkan 50 dari {{ filteredMembers.length }} member. Ketik nama untuk mempersempit pencarian...
              </div>
            </div>
            <div
              v-else-if="showDropdown && memberSearchQuery.trim()"
              class="mt-1 p-3 rounded-xl border border-white/10 bg-[#080d15] text-center text-xs text-gray-400 font-mono"
            >
              Nickname atau member tidak ditemukan.
            </div>
          </div>

          <!-- Selected Member Card -->
          <div v-if="selectedMember" class="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img
                :src="selectedMember.avatar || '/img/default-avatar.png'"
                class="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
              />
              <div>
                <div class="text-sm font-bold text-white font-orbitron">{{ selectedMember.nickname }}</div>
                <div class="text-[10px] text-cyan-300 font-mono">{{ selectedMember.member_code }}</div>
                <div class="text-[10px] text-gray-400">{{ selectedMember.domisili }}</div>
              </div>
            </div>
            <button
              @click="selectedMember = null; memberSearchQuery = ''"
              class="text-gray-400 hover:text-white p-1 text-xs"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Alert Feedback -->
          <div v-if="submitError" class="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <i class="fas fa-exclamation-triangle text-red-400"></i>
            <span>{{ submitError }}</span>
          </div>

          <div v-if="submitSuccess" class="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs space-y-2">
            <div class="flex items-center gap-2 font-bold text-emerald-300 text-sm">
              <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
              <span>PRESENSI BERHASIL DICATAT!</span>
            </div>
            <p class="leading-relaxed">
              {{ submitSuccess }}
            </p>
            <router-link
              to="/meetup"
              class="inline-block mt-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-orbitron font-bold text-[11px]"
            >
              Lihat Papan Poin Kehadiran
            </router-link>
          </div>

          <!-- SUBMIT BUTTON -->
          <button
            v-if="!submitSuccess"
            @click="handleCheckin"
            :disabled="!isInsideRadius || !selectedMember || isSubmitting"
            class="w-full py-3.5 px-4 rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            :class="isInsideRadius && selectedMember ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-gray-800 text-gray-400'"
          >
            <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
            <i class="fas fa-check" v-else></i>
            <span>{{ isSubmitting ? 'MEMVERIFIKASI PRESENSI...' : 'KONFIRMASI HADIR MEETUP' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const currentMeetup = ref(null);
const loadingMeetup = ref(true);

// GPS State
const userLat = ref(null);
const userLon = ref(null);
const detectingLocation = ref(false);
const gpsError = ref('');
const distanceMeters = ref(null);

// Member Selection
const membersList = ref([]);
const memberSearchQuery = ref('');
const showDropdown = ref(false);
const selectedMember = ref(null);

// Submit State
const isSubmitting = ref(false);
const submitError = ref('');
const submitSuccess = ref('');

const isInsideRadius = computed(() => {
  if (distanceMeters.value === null || !currentMeetup.value) return false;
  const radius = currentMeetup.value.radius_meters || 10;
  return distanceMeters.value <= radius;
});

const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return '-';
  const m = parseFloat(meters);
  if (isNaN(m)) return '-';
  if (m >= 1000) {
    const km = m / 1000;
    return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`;
  }
  return `${m < 10 ? m.toFixed(1) : Math.round(m)} meter`;
};

const filteredMembers = computed(() => {
  if (!memberSearchQuery.value.trim()) return membersList.value;
  const q = memberSearchQuery.value.toLowerCase().trim();
  return membersList.value.filter(m =>
    (m.nickname && m.nickname.toLowerCase().includes(q)) ||
    (m.member_code && m.member_code.toLowerCase().includes(q)) ||
    (m.name && m.name.toLowerCase().includes(q)) ||
    (m.domisili && m.domisili.toLowerCase().includes(q))
  );
});

const selectMember = (m) => {
  selectedMember.value = m;
  memberSearchQuery.value = m.nickname;
  showDropdown.value = false;
};

// Haversine calculation in client
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10;
}

const requestLocation = () => {
  gpsError.value = '';
  detectingLocation.value = true;

  if (!navigator.geolocation) {
    gpsError.value = 'Perangkat / browser kamu tidak mendukung fitur Geolocation GPS.';
    detectingLocation.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat.value = pos.coords.latitude;
      userLon.value = pos.coords.longitude;
      detectingLocation.value = false;

      if (currentMeetup.value) {
        distanceMeters.value = calcDistance(
          userLat.value,
          userLon.value,
          parseFloat(currentMeetup.value.latitude),
          parseFloat(currentMeetup.value.longitude)
        );
      }
    },
    (err) => {
      detectingLocation.value = false;
      switch (err.code) {
        case err.PERMISSION_DENIED:
          gpsError.value = 'Izin lokasi ditolak. Silakan izinkan akses lokasi (GPS) pada pengaturan browser/HP kamu.';
          break;
        case err.POSITION_UNAVAILABLE:
          gpsError.value = 'Sinyal lokasi tidak tersedia. Pastikan fitur GPS di HP aktif.';
          break;
        case err.TIMEOUT:
          gpsError.value = 'Waktu permintaan lokasi habis. Silakan coba lagi.';
          break;
        default:
          gpsError.value = 'Gagal mendeteksi lokasi: ' + err.message;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

const fetchMeetupData = async () => {
  loadingMeetup.value = true;
  try {
    const token = route.query.token;
    if (token) {
      const res = await fetch(`/api/v1/meetups/${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data.success && data.data) {
        currentMeetup.value = data.data;
      }
    } else {
      // Ambil meetup aktif pertama jika token tidak diberikan
      const res = await fetch('/api/v1/meetups?status=ACTIVE');
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        currentMeetup.value = data.data[0];
      }
    }
  } catch (err) {
    console.error('Gagal mengambil data meetup:', err);
  } finally {
    loadingMeetup.value = false;
    if (currentMeetup.value) {
      requestLocation();
    }
  }
};

const fetchMembers = async () => {
  try {
    const res = await fetch('/api/v1/members?limit=1000');
    const data = await res.json();
    if (data.success) {
      membersList.value = data.data || [];
    }
  } catch (err) {
    console.error('Gagal mengambil data members:', err);
  }
};

const handleCheckin = async () => {
  submitError.value = '';
  submitSuccess.value = '';

  if (!selectedMember.value) {
    submitError.value = 'Silakan pilih Nickname kamu terlebih dahulu.';
    return;
  }
  if (!userLat.value || !userLon.value) {
    submitError.value = 'Koordinat GPS belum terdeteksi. Silakan deteksi ulang lokasi.';
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await fetch(`/api/v1/meetups/${currentMeetup.value.id}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        member_code: selectedMember.value.member_code,
        nickname: selectedMember.value.nickname,
        latitude: userLat.value,
        longitude: userLon.value,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memproses absensi.');
    }

    submitSuccess.value = data.message;
  } catch (err) {
    submitError.value = err.message || 'Terjadi kesalahan saat presensi.';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchMeetupData();
  fetchMembers();
});
</script>
