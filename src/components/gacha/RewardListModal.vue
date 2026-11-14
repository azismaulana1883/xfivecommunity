<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
    <div class="w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(0,255,255,0.15)] relative max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">
            <i class="fas fa-gift"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black font-orbitron text-white uppercase tracking-wider">
              DAFTAR HADIAH &amp; DROP RATE
            </h3>
            <p class="text-xs font-mono text-cyan-400">Peluang &amp; Katalog Hadiah Resmi Gacha Meetup</p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <i class="fas fa-times text-sm"></i>
        </button>
      </div>

      <!-- Probability Summary Banner -->
      <div class="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
        <div class="flex items-center gap-2 text-emerald-400">
          <i class="fas fa-check-circle"></i>
          <span>Total Hadiah: <strong>{{ totalRewardRate.toFixed(2) }}%</strong></span>
        </div>
        <div class="flex items-center gap-2 text-red-400">
          <i class="fas fa-bomb"></i>
          <span>Peluang ZONK: <strong>{{ zonkRate.toFixed(2) }}%</strong></span>
        </div>
      </div>

      <!-- Rewards Table Scrollable -->
      <div class="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1">
        <div
          v-for="rew in rewards"
          :key="rew.id"
          class="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-orbitron border"
              :class="[
                rew.category === 'VIP' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                rew.category === 'MI-CASH' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' :
                'bg-purple-500/20 border-purple-500/40 text-purple-300'
              ]"
            >
              <i :class="rew.category === 'VIP' ? 'fas fa-crown' : rew.category === 'MI-CASH' ? 'fas fa-ticket' : 'fas fa-star'"></i>
            </div>
            <div>
              <div class="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{{ rew.name }}</span>
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase border"
                  :class="[
                    rew.category === 'VIP' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                    rew.category === 'MI-CASH' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' :
                    'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  ]"
                >
                  {{ rew.category }}
                </span>
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase border bg-black/60"
                  :style="{ color: getTierColor(rew.tier_level), borderColor: `${getTierColor(rew.tier_level)}60` }"
                >
                  {{ getTierBadge(rew.tier_level) }}
                </span>
              </div>
              <div class="text-[11px] text-gray-400 font-mono mt-0.5">
                {{ rew.description || (rew.category === 'MI-CASH' ? 'Voucher langsung didapat saat roll' : 'Hadiah klaim via Staff') }}
              </div>
            </div>
          </div>

          <div class="text-right flex-shrink-0">
            <span class="inline-block px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold font-mono text-xs">
              {{ rew.drop_rate.toFixed(2) }}%
            </span>
            <div class="text-[10px] text-gray-500 font-mono mt-0.5">Drop Rate</div>
          </div>
        </div>

        <!-- ZONK Row -->
        <div class="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-sm">
              <i class="fas fa-times-circle"></i>
            </div>
            <div>
              <div class="text-xs sm:text-sm font-bold text-red-300">ZONK (Belum Beruntung)</div>
              <div class="text-[11px] text-gray-400 font-mono mt-0.5">Kesempatan mencoba lagi di meetup berikutnya</div>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <span class="inline-block px-3 py-1 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-bold font-mono text-xs">
              {{ zonkRate.toFixed(2) }}%
            </span>
            <div class="text-[10px] text-gray-500 font-mono mt-0.5">Drop Rate</div>
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="pt-3 border-t border-white/10 flex justify-end">
        <button
          type="button"
          @click="emit('close')"
          class="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getTierByLevel } from '@/utils/tiers';

const props = defineProps({
  rewards: {
    type: Array,
    default: () => [],
  },
  totalRewardRate: {
    type: Number,
    default: 0,
  },
  zonkRate: {
    type: Number,
    default: 100,
  },
});

const emit = defineEmits(['close']);

const getTierColor = (level) => {
  const t = getTierByLevel(level || 1);
  return t ? t.color : '#cd7f32';
};

const getTierBadge = (level) => {
  const t = getTierByLevel(level || 1);
  return t ? t.badge : '🥉 Bronze';
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
