<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { History, Search, RefreshCw, X } from 'lucide-vue-next';
import { useAdminMembers, type HistoricalRecord } from '@/composables/admin/useAdminMembers';

const props = withDefaults(
  defineProps<{
    initialMemberCode?: string;
  }>(),
  {
    initialMemberCode: ''
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { fetchHistory } = useAdminMembers();

const historySearch = ref(props.initialMemberCode || '');
const loadingHistory = ref(false);
const historyList = ref<HistoricalRecord[]>([]);

const loadHistory = async () => {
  loadingHistory.value = true;
  const q = historySearch.value.trim();
  historyList.value = await fetchHistory(q || undefined);
  loadingHistory.value = false;
};

const filteredHistory = computed(() => {
  if (!historySearch.value.trim()) return historyList.value;
  const q = historySearch.value.toLowerCase().trim();
  return historyList.value.filter(
    (h) =>
      (h.member_code && h.member_code.toLowerCase().includes(q)) ||
      (h.old_nickname && h.old_nickname.toLowerCase().includes(q)) ||
      (h.new_nickname && h.new_nickname.toLowerCase().includes(q))
  );
});

onMounted(() => {
  loadHistory();
});
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      @click.self="emit('close')"
    >
    <div class="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-[#0d131f] p-3.5 sm:p-6 shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col">
      <div class="flex items-start justify-between gap-2.5 pb-3 sm:pb-4 border-b border-white/10 mb-3 sm:mb-4 shrink-0">
        <div class="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)] shrink-0 mt-0.5">
            <History class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-xs sm:text-base font-black font-orbitron uppercase tracking-wider text-white leading-tight break-words">
              Log Riwayat Perubahan Nickname
            </h2>
            <p class="text-[10px] sm:text-[11px] text-gray-400 font-mono mt-0.5 break-words">
              Tercatat otomatis ke database <code class="text-cyan-400">historical_data</code> saat member mengganti nickname
            </p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer shrink-0 text-xs sm:text-sm"
        >
          <X class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="historySearch"
            @keyup.enter="loadHistory"
            type="text"
            placeholder="Cari member code, nickname lama, atau nickname baru..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none font-mono"
          />
        </div>
        <button
          @click="loadHistory"
          class="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw :class="loadingHistory ? 'animate-spin' : ''" class="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh</span>
        </button>
      </div>

      <div class="flex-1 overflow-x-auto overflow-y-auto border border-white/5 rounded-xl bg-black/40 relative">
        <table class="w-full text-left text-xs border-collapse min-w-[620px]">
          <thead class="bg-black/60 text-cyan-400 border-b border-white/5 font-orbitron uppercase tracking-wider text-[10px] sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th class="py-2.5 px-3 sm:px-4 whitespace-nowrap">ID</th>
              <th class="py-2.5 px-3 sm:px-4 whitespace-nowrap">Member Code</th>
              <th class="py-2.5 px-3 sm:px-4 whitespace-nowrap">Nickname Lama (Old)</th>
              <th class="py-2.5 px-3 sm:px-4 whitespace-nowrap">Nickname Baru (New)</th>
              <th class="py-2.5 px-3 sm:px-4 whitespace-nowrap">Waktu Perubahan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-sans">
            <tr v-if="loadingHistory">
              <td colspan="5" class="text-center py-10 text-gray-500 font-mono">
                <RefreshCw class="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                Memuat log riwayat perubahan...
              </td>
            </tr>
            <tr v-else-if="filteredHistory.length === 0">
              <td colspan="5" class="text-center py-10 text-gray-500 font-mono">
                Belum ada log riwayat perubahan nickname yang tercatat.
              </td>
            </tr>
            <tr
              v-for="h in filteredHistory"
              :key="h.id"
              class="hover:bg-cyan-500/[0.03] transition"
            >
              <td class="py-2.5 px-3 sm:px-4 font-mono text-gray-500 text-[11px] whitespace-nowrap">#{{ h.id }}</td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold">
                  {{ h.member_code }}
                </span>
              </td>
              <td class="py-2.5 px-3 sm:px-4 font-mono text-red-400/90 line-through whitespace-nowrap">
                {{ h.old_nickname }}
              </td>
              <td class="py-2.5 px-3 sm:px-4 font-mono text-emerald-400 font-bold whitespace-nowrap">
                {{ h.new_nickname }}
              </td>
              <td class="py-2.5 px-3 sm:px-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                {{ h.created_at ? new Date(h.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 font-mono shrink-0">
        <span>Total Tercatat: <strong class="text-cyan-400">{{ filteredHistory.length }}</strong> log</span>
        <button
          @click="emit('close')"
          class="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-orbitron text-xs transition cursor-pointer text-center"
        >
          TUTUP
        </button>
      </div>
    </div>
    </div>
  </Teleport>
</template>
