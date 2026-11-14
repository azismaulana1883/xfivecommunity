<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  MapPin,
  Calendar
} from 'lucide-vue-next';
import { monthNames, formatBirthDate } from '@/utils/admin/adminFormatters';

const props = defineProps<{
  members: any[];
  blacklistList: any[];
}>();

const checkNickQuery = ref('');
const checkNickResult = ref<{ status: 'valid' | 'blacklisted' | 'not_found'; message: string } | null>(null);

const checkNickname = () => {
  const nick = checkNickQuery.value.trim().toLowerCase();
  if (!nick) {
    checkNickResult.value = null;
    return;
  }

  const bl = props.blacklistList.find((b) => (b.nickname || '').toLowerCase().includes(nick));
  if (bl) {
    checkNickResult.value = {
      status: 'blacklisted',
      message: `TERDETEKSI BLACKLIST: ${bl.nickname} (${bl.nama}) - Alasan: ${bl.pelanggaran}`,
    };
    return;
  }

  const mem = props.members.find((m) => (m.nickname || '').toLowerCase().includes(nick));
  if (mem) {
    checkNickResult.value = {
      status: 'valid',
      message: `TERDAFTAR RESMI: ${mem.nickname} (${mem.name}) - Domisili: ${mem.domisili}`,
    };
    return;
  }

  checkNickResult.value = {
    status: 'not_found',
    message: `TIDAK DITEMUKAN: Nickname "${checkNickQuery.value}" belum terdaftar atau bukan anggota resmi XFIVE.`,
  };
};

const totalCount = computed(() => props.members.length);
const femaleCount = computed(() => props.members.filter((m) => (m.gender || '').toLowerCase() === 'female').length);
const maleCount = computed(() => props.members.filter((m) => (m.gender || '').toLowerCase() === 'male').length);

const topRegion = computed(() => {
  const countMap: Record<string, number> = {};
  props.members.forEach((m) => {
    if (m.domisili && m.domisili !== '-') {
      countMap[m.domisili] = (countMap[m.domisili] || 0) + 1;
    }
  });
  let top = '-';
  let max = 0;
  Object.entries(countMap).forEach(([dom, cnt]) => {
    if (cnt > max) {
      max = cnt;
      top = dom;
    }
  });
  return top;
});

const selectedMonth = ref(new Date().getMonth());

const getMemberBirthMonth = (dob: string | undefined): number | null => {
  if (!dob || dob === '-') return null;
  const str = dob.toLowerCase().trim();

  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const m = parseInt(isoMatch[2], 10) - 1;
    if (m >= 0 && m <= 11) return m;
  }

  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const m = parseInt(dmyMatch[2], 10) - 1;
    if (m >= 0 && m <= 11) return m;
  }

  const monthMap: Record<string, number> = {
    januari: 0, january: 0, jan: 0,
    februari: 1, february: 1, feb: 1,
    maret: 2, march: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4, may: 4,
    juni: 5, june: 5, jun: 5,
    juli: 6, july: 6, jul: 6,
    agustus: 7, august: 7, agt: 7, ags: 7, aug: 7,
    september: 8, sep: 8,
    oktober: 9, october: 9, okt: 9, oct: 9,
    november: 10, nov: 10,
    desember: 11, december: 11, des: 11, dec: 11,
  };

  for (const [key, val] of Object.entries(monthMap)) {
    if (str.includes(key)) {
      return val;
    }
  }

  return null;
};

const birthdaysInSelectedMonth = computed(() => {
  return props.members.filter((m) => {
    const bMonth = getMemberBirthMonth(m.dob);
    return bMonth === selectedMonth.value;
  });
});
</script>

<template>
  <div class="space-y-8 animate-fade-in select-none">
    <!-- Nickname Checker -->
    <div class="rounded-2xl border border-cyan-500/30 bg-[#0c121e]/80 p-6 backdrop-blur">
      <h3 class="text-sm font-bold font-orbitron text-cyan-400 flex items-center gap-2 mb-3">
        <Search class="w-4 h-4" /> VALIDASI &amp; CEK NICKNAME MEMBER
      </h3>
      <p class="text-xs text-gray-400 mb-4">Cek instan apakah nickname terdaftar aktif atau berada dalam daftar blacklist komunitas.</p>
      <div class="flex gap-3">
        <input
          v-model="checkNickQuery"
          @keyup.enter="checkNickname"
          type="text"
          placeholder="Ketik nickname Ayodance..."
          class="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-gray-700 focus:border-cyan-400 text-white text-sm outline-none font-mono"
        />
        <button
          @click="checkNickname"
          class="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          Cek Validitas
        </button>
      </div>

      <!-- Result Box -->
      <div
        v-if="checkNickResult"
        class="mt-4 p-3.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-3 transition"
        :class="
          checkNickResult.status === 'valid' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' :
          checkNickResult.status === 'blacklisted' ? 'bg-red-950/60 border-red-500/50 text-red-300' :
          'bg-gray-900 border-gray-700 text-gray-400'
        "
      >
        <CheckCircle v-if="checkNickResult.status === 'valid'" class="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <XCircle v-else-if="checkNickResult.status === 'blacklisted'" class="w-4 h-4 text-red-400 flex-shrink-0" />
        <AlertTriangle v-else class="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <span>{{ checkNickResult.message }}</span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="rounded-2xl border border-cyan-500/20 bg-[#0c121e]/80 p-5 relative overflow-hidden">
        <span class="text-xs font-orbitron uppercase tracking-wider text-cyan-400">Total Members</span>
        <div class="text-3xl font-extrabold font-orbitron text-white mt-2">{{ totalCount }}</div>
        <Users class="absolute right-3 bottom-3 w-16 h-16 text-cyan-500/5" />
      </div>

      <div class="rounded-2xl border border-pink-500/20 bg-[#0c121e]/80 p-5 relative overflow-hidden">
        <span class="text-xs font-orbitron uppercase tracking-wider text-pink-400">Female Members</span>
        <div class="text-3xl font-extrabold font-orbitron text-white mt-2">{{ femaleCount }}</div>
        <Users class="absolute right-3 bottom-3 w-16 h-16 text-pink-500/5" />
      </div>

      <div class="rounded-2xl border border-blue-500/20 bg-[#0c121e]/80 p-5 relative overflow-hidden">
        <span class="text-xs font-orbitron uppercase tracking-wider text-blue-400">Male Members</span>
        <div class="text-3xl font-extrabold font-orbitron text-white mt-2">{{ maleCount }}</div>
        <Users class="absolute right-3 bottom-3 w-16 h-16 text-blue-500/5" />
      </div>

      <div class="rounded-2xl border border-yellow-500/20 bg-[#0c121e]/80 p-5 relative overflow-hidden">
        <span class="text-xs font-orbitron uppercase tracking-wider text-yellow-400">Top Region</span>
        <div class="text-lg font-bold font-orbitron text-white mt-3 truncate">{{ topRegion }}</div>
        <MapPin class="absolute right-3 bottom-3 w-16 h-16 text-yellow-500/5" />
      </div>
    </div>

    <!-- Birthday Section -->
    <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <h3 class="text-sm font-bold font-orbitron text-pink-400 flex items-center gap-2">
          <Calendar class="w-4 h-4" /> ULANG TAHUN BULAN: {{ monthNames[selectedMonth].toUpperCase() }}
        </h3>

        <!-- Month Tabs -->
        <div class="flex flex-wrap gap-1">
          <button
            v-for="(mName, idx) in monthNames"
            :key="idx"
            @click="selectedMonth = idx"
            class="px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer"
            :class="selectedMonth === idx ? 'bg-pink-600 text-white font-bold' : 'bg-black/40 text-gray-400 hover:bg-white/10'"
          >
            {{ mName.slice(0, 3) }}
          </button>
        </div>
      </div>

      <!-- Birthday List -->
      <div v-if="birthdaysInSelectedMonth.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="m in birthdaysInSelectedMonth"
          :key="m.id"
          class="p-3 rounded-xl bg-black/40 border border-pink-500/20 flex items-center gap-3"
        >
          <img :src="m.avatar || '/img/default-avatar.png'" class="w-9 h-9 rounded-full object-cover border border-pink-500/30" />
          <div class="min-w-0">
            <div class="font-bold text-xs text-white truncate font-orbitron">{{ m.nickname }}</div>
            <div class="text-[11px] text-pink-300 font-mono mt-0.5">🎂 {{ formatBirthDate(m.dob) }}</div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500 text-xs font-mono border border-dashed border-gray-800 rounded-xl">
        Tidak ada data ulang tahun di bulan {{ monthNames[selectedMonth] }}.
      </div>
    </div>
  </div>
</template>
