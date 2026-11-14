<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="rounded-2xl border border-cyan-500/40 bg-[#0d121c] p-5 sm:p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,255,255,0.2)]">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div class="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-sm sm:text-base">
          <i class="fab fa-whatsapp text-lg"></i>
          <span>HUBUNGI TESTER XFIVE</span>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white cursor-pointer text-sm">✕</button>
      </div>

      <div class="space-y-4 text-xs font-mono">
        <div>
          <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Pilih Tester Online</label>
          <select
            v-model="activeTesterIdx"
            class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white outline-none cursor-pointer"
          >
            <option v-for="(t, idx) in testers" :key="t.name" :value="idx">
              {{ t.name }} ({{ t.status === 'online' ? '🟢 Online' : '⚪ Offline' }})
            </option>
          </select>
        </div>

        <div class="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-gray-300 leading-relaxed text-[11px]">
          Tester XFIVE bertugas mendampingi kamu untuk verifikasi nickname &amp; pengisian biodata resmi komunitas.
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            @click="$emit('close')"
            class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer"
          >
            Tutup
          </button>
          <a
            :href="testers[activeTesterIdx]?.link"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.4)]"
          >
            <i class="fab fa-whatsapp"></i>
            <span>Hubungi {{ testers[activeTesterIdx]?.name }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  testers: {
    type: Array,
    default: () => []
  }
});

defineEmits(['close']);

const activeTesterIdx = ref(0);
</script>
