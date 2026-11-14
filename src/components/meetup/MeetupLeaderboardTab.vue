<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-between">
        <div>
          <div class="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Total Member</div>
          <div class="text-2xl font-black font-orbitron text-white mt-1">{{ pointsList.length }}</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <i class="fas fa-users text-lg"></i>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-between">
        <div>
          <div class="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Status Aman (>=0)</div>
          <div class="text-2xl font-black font-orbitron text-emerald-400 mt-1">
            {{ pointsList.filter(p => p.net_points >= 0).length }}
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <i class="fas fa-shield-alt text-lg"></i>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-between">
        <div>
          <div class="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Waspada (-1 Poin)</div>
          <div class="text-2xl font-black font-orbitron text-amber-400 mt-1">
            {{ pointsList.filter(p => p.net_points === -1).length }}
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <i class="fas fa-exclamation-circle text-lg"></i>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-black/60 border border-red-500/20 flex items-center justify-between">
        <div>
          <div class="text-[10px] text-red-400 font-mono uppercase tracking-widest">⚠️ Teguran 1 (-2 Poin)</div>
          <div class="text-2xl font-black font-orbitron text-red-400 mt-1">
            {{ warningCount }}
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 animate-pulse">
          <i class="fas fa-exclamation-triangle text-lg"></i>
        </div>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-[#0c121e] border border-white/5 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
      <div class="w-full md:flex-1 md:max-w-xl">
        <MultiSearchSelect
          v-model="selectedRegionsFilter"
          label="Filter Wilayah Domisili (Tingkat II Pemprov)"
          placeholder="Semua Wilayah (Klik untuk pilih/cari kota...)"
          :options="regionOptions"
          :presets="regionPresets"
        />
      </div>

      <div class="w-full md:w-72">
        <label class="block font-orbitron text-gray-300 uppercase tracking-wider text-xs font-bold mb-1.5 flex items-center gap-1.5">
          <Search class="w-3.5 h-3.5 text-cyan-400" />
          <span>Cari Member</span>
        </label>
        <div class="relative">
          <input
            v-model="pointsSearch"
            type="text"
            placeholder="Cari nickname / member code..."
            class="w-full px-3.5 py-2.5 pl-9 pr-7 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-xs text-white outline-none font-mono"
          />
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <button
            v-if="pointsSearch"
            @click="pointsSearch = ''"
            class="text-gray-500 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-white/5 bg-[#0c121e] overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-black/60 text-cyan-400 border-b border-white/5 font-orbitron uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3 px-4">Member</th>
              <th class="py-3 px-4">Member Code</th>
              <th class="py-3 px-4">Wilayah Domisili</th>
              <th class="py-3 px-4 text-center">Hadir</th>
              <th class="py-3 px-4 text-center">Mangkir</th>
              <th class="py-3 px-4 text-center">Izin</th>
              <th class="py-3 px-4 text-center">Total Poin</th>
              <th class="py-3 px-4 text-right">Status Peringatan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-sans">
            <tr v-if="loading">
              <td colspan="8" class="text-center py-12 text-gray-500 font-mono">
                <i class="fas fa-spinner fa-spin text-cyan-400 text-xl mb-2"></i>
                <p>Memuat rekap poin anggota...</p>
              </td>
            </tr>
            <tr v-else-if="filteredPointsList.length === 0">
              <td colspan="8" class="text-center py-12 text-gray-500 font-mono">
                Tidak ada member yang cocok dengan filter.
              </td>
            </tr>
            <tr
              v-for="p in filteredPointsList"
              :key="p.id"
              class="hover:bg-cyan-500/[0.02] transition"
              :class="p.warning_status === 'TEGURAN_1' ? 'bg-red-950/[0.15]' : ''"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="p.avatar || '/img/default-avatar.png'"
                    class="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <div class="font-bold text-white font-orbitron">{{ p.nickname }}</div>
                    <div class="text-[10px] text-gray-400">{{ p.name }}</div>
                  </div>
                </div>
              </td>

              <td class="py-3 px-4 font-mono text-cyan-300 font-bold text-[11px]">
                {{ p.member_code }}
              </td>

              <td class="py-3 px-4">
                <span
                  class="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-orbitron uppercase border mr-1.5"
                  :class="getRegionBadgeClass(p.region)"
                >
                  {{ p.region }}
                </span>
                <span class="text-gray-400 font-mono text-[11px] truncate max-w-[150px] inline-block align-middle">
                  {{ p.domisili }}
                </span>
              </td>

              <td class="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                {{ p.total_hadir }}
              </td>
              <td class="py-3 px-4 text-center font-mono text-red-400 font-bold">
                {{ p.total_tidak_hadir }}
              </td>
              <td class="py-3 px-4 text-center font-mono text-amber-400 font-bold">
                {{ p.total_izin }}
              </td>

              <td class="py-3 px-4 text-center">
                <span
                  class="inline-block px-2.5 py-1 rounded-lg font-mono text-xs font-black"
                  :class="p.net_points > 0 ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' : (p.net_points < 0 ? 'bg-red-950 border border-red-500/40 text-red-300' : 'bg-gray-800 text-gray-300')"
                >
                  {{ p.net_points > 0 ? '+' : '' }}{{ p.net_points }} Poin
                </span>
              </td>

              <td class="py-3 px-4 text-right">
                <span
                  v-if="p.warning_status === 'TEGURAN_1'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/20 border border-red-500/60 text-red-300 font-orbitron font-bold text-[10px] uppercase shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse"
                >
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>TEGURAN KE-1</span>
                </span>
                <span
                  v-else-if="p.warning_status === 'PERINGATAN'"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px]"
                >
                  <span>-1 Poin (Waspada)</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono"
                >
                  <i class="fas fa-check-circle text-xs"></i>
                  <span>Aman</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import MultiSearchSelect from '@/components/MultiSearchSelect.vue';
import { ALL_INDONESIA_REGENCIES } from '@/data/indonesiaRegencies';
import { getRegionBadgeClass } from '../../utils/meetup';

const props = defineProps({
  pointsList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  warningCount: {
    type: Number,
    default: 0
  }
});

// Opsi Lengkap Kota / Kabupaten Seluruh Indonesia (Daerah Tingkat II Kemendagri / Pemprov)
const regionOptions = ALL_INDONESIA_REGENCIES;

const regionPresets = [
  { label: '+ Jabodetabek', values: ['JAKARTA', 'KOTA BOGOR', 'KABUPATEN BOGOR', 'KOTA DEPOK', 'TANGERANG', 'BEKASI'] },
  { label: '+ Jakarta - Tangerang', values: ['JAKARTA', 'TANGERANG'] },
  { label: '+ Bekasi - Depok', values: ['BEKASI', 'KOTA DEPOK'] },
  { label: '+ Bogor - Depok', values: ['BOGOR', 'KOTA DEPOK'] },
  { label: '+ Medan & Sumut', values: ['KOTA MEDAN', 'KOTA BINJAI', 'KABUPATEN DELI SERDANG'] },
  { label: '+ Palembang & Sumsel', values: ['KOTA PALEMBANG'] },
  { label: '+ Bandung Raya', values: ['BANDUNG', 'KOTA CIMAHI'] },
  { label: '+ Surabaya & Sidoarjo', values: ['SURABAYA'] },
];

const selectedRegionsFilter = ref([]);
const pointsSearch = ref('');

const filteredPointsList = computed(() => {
  let list = props.pointsList;

  if (selectedRegionsFilter.value.length > 0) {
    list = list.filter((p) => {
      const r = (p.region || '').toUpperCase().trim();
      if (selectedRegionsFilter.value.includes(r)) return true;
      // Kompatibilitas dengan BOGOR-DEPOK jika ada
      if (r === 'BOGOR-DEPOK' && (selectedRegionsFilter.value.includes('BOGOR') || selectedRegionsFilter.value.includes('DEPOK'))) {
        return true;
      }
      return false;
    });
  }

  if (pointsSearch.value.trim()) {
    const q = pointsSearch.value.toLowerCase().trim();
    list = list.filter((p) =>
      (p.nickname || '').toLowerCase().includes(q) ||
      (p.member_code || '').toLowerCase().includes(q) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.domisili && p.domisili.toLowerCase().includes(q))
    );
  }

  return list;
});
</script>
