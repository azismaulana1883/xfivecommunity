<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
    <div class="w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-cyan-500/40 p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(0,255,255,0.25)] relative max-h-[90vh] flex flex-col animate-scale-up">
      <!-- Modal Header -->
      <div class="text-center space-y-1 border-b border-white/10 pb-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <i class="fas fa-sparkles"></i>
          <span>HASIL GACHA REWARD</span>
        </div>
        <h3 class="text-xl sm:text-2xl font-black font-orbitron text-white uppercase tracking-wider">
          {{ hasWinners ? 'SELAMAT! ANDA MENDAPATKAN HADIAH' : 'BELUM BERUNTUNG KALI INI' }}
        </h3>
        <p class="text-xs font-mono text-gray-400">
          Total: {{ results.length }}x Penarikan &bull; Sisa Poin Anda: <strong class="text-cyan-400">{{ remainingPoints }} Poin</strong>
        </p>
      </div>

      <!-- Results Grid / List -->
      <div class="overflow-y-auto space-y-3.5 pr-1 custom-scrollbar flex-1">
        <div
          v-for="(item, idx) in results"
          :key="idx"
          class="p-4 rounded-2xl border transition-all"
          :class="[
            item.is_zonk ? 'bg-red-950/20 border-red-500/20' :
            item.reward_category === 'MI-CASH' ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]' :
            item.reward_category === 'VIP' ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' :
            'bg-purple-950/30 border-purple-500/50'
          ]"
        >
          <!-- Top Row: Result Header -->
          <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-3">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold text-xs">
                #{{ item.roll_index }}
              </span>
              <span
                class="font-orbitron font-bold text-xs uppercase"
                :class="item.is_zonk ? 'text-red-400' : 'text-emerald-400'"
              >
                {{ item.is_zonk ? 'ZONK' : item.reward_category }}
              </span>
            </div>

            <span
              v-if="!item.is_zonk"
              class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border"
              :class="item.reward_category === 'MI-CASH' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-amber-500/20 border-amber-500/40 text-amber-300'"
            >
              {{ item.reward_name }}
            </span>
          </div>

          <!-- Content: IF MI-CASH (Show Voucher Code & Password) -->
          <div v-if="item.reward_category === 'MI-CASH' && item.voucher_code" class="space-y-3">
            <div class="p-3.5 rounded-xl bg-black/60 border border-cyan-500/30 space-y-2">
              <!-- Voucher Code -->
              <div>
                <div class="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>KODE VOUCHER MI-CASH (12 DIGIT):</span>
                  <button
                    type="button"
                    @click="copyText(item.voucher_code, 'kode')"
                    class="text-cyan-400 hover:text-cyan-300 transition text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <i class="fas fa-copy"></i>
                    <span>{{ copiedKey === `kode_${item.voucher_code}` ? 'Tersalin!' : 'Salin Kode' }}</span>
                  </button>
                </div>
                <div class="text-base sm:text-lg font-mono font-black text-cyan-300 tracking-[0.2em] mt-0.5 select-all">
                  {{ item.voucher_code }}
                </div>
              </div>

              <!-- Password -->
              <div class="pt-2 border-t border-white/10">
                <div class="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>PASSWORD VOUCHER:</span>
                  <button
                    type="button"
                    @click="copyText(item.voucher_password, 'pass')"
                    class="text-cyan-400 hover:text-cyan-300 transition text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <i class="fas fa-copy"></i>
                    <span>{{ copiedKey === `pass_${item.voucher_password}` ? 'Tersalin!' : 'Salin Pass' }}</span>
                  </button>
                </div>
                <div class="text-sm font-mono font-bold text-white tracking-wider mt-0.5 select-all">
                  {{ item.voucher_password }}
                </div>
              </div>
            </div>

            <!-- Security Warning: Save Now Notice -->
            <div class="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-[11px] font-mono flex items-start gap-2">
              <i class="fas fa-shield-exclamation text-red-400 text-sm mt-0.5 flex-shrink-0"></i>
              <span>
                <strong>SIMPAN SEKARANG:</strong> Demi keamanan akun dari pihak lain yang mengetahui member code Anda, kode voucher ini <strong>hanya ditampilkan saat ini saja</strong> dan disensor di riwayat publik.
              </span>
            </div>
          </div>

          <!-- Content: IF VIP / OTHERS (Show Claim Ticket Code & Staff Button) -->
          <div v-else-if="!item.is_zonk" class="space-y-3">
            <div class="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
              <div class="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                KODE TIKET KLAIM RESMI:
              </div>
              <div class="text-sm sm:text-base font-mono font-black text-amber-300 tracking-wider select-all">
                {{ item.claim_ticket_code }}
              </div>
              <p class="text-[11px] font-mono text-gray-400 pt-1">
                Silakan hubungi Dewan Staff / Vice Leader dengan menunjukkan tiket klaim di atas untuk pengiriman hadiah Anda.
              </p>
            </div>

            <div>
              <a
                :href="generateWhatsAppClaimUrl(item)"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
              >
                <i class="fab fa-whatsapp text-sm"></i>
                <span>Hubungi Staff via WhatsApp</span>
              </a>
            </div>
          </div>

          <!-- Content: IF ZONK -->
          <div v-else class="text-center py-2 text-xs font-mono text-gray-400">
            <span class="text-red-400 font-bold">ZONK!</span> Belum beruntung pada putaran ini. Semangat kumpulkan poin lagi di meetup berikutnya!
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="pt-3 border-t border-white/10 flex justify-end">
        <button
          type="button"
          @click="emit('close')"
          class="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,255,0.4)] transition cursor-pointer"
        >
          Selesai
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();

const props = defineProps({
  results: {
    type: Array,
    default: () => [],
  },
  remainingPoints: {
    type: Number,
    default: 0,
  },
  memberInfo: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close']);

const copiedKey = ref('');

const hasWinners = computed(() => {
  return props.results.some((r) => !r.is_zonk);
});

const copyText = async (text, prefix) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedKey.value = `${prefix}_${text}`;
    toast.success('Kode berhasil disalin ke clipboard!', 'Tersalin');
    setTimeout(() => {
      copiedKey.value = '';
    }, 2000);
  } catch (err) {
    toast.info(`Kode: ${text}`, 'Salin Manual');
  }
};

const generateWhatsAppClaimUrl = (item) => {
  const phone = '628123456789'; // Bisa disesuaikan dengan nomor official staf
  const text = `Halo Dewan Staff XFIVE, saya ingin klaim hadiah Gacha Meetup:\n\n` +
    `• Member Code: ${props.memberInfo?.member_code || '-'}\n` +
    `• Nickname: ${props.memberInfo?.nickname || '-'}\n` +
    `• Hadiah: ${item.reward_name} (${item.reward_category})\n` +
    `• Tiket Klaim: ${item.claim_ticket_code}\n\n` +
    `Mohon petunjuk untuk pengiriman/penyerahan hadiah. Terima kasih!`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};
</script>

<style scoped>
@keyframes scaleUp {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-up {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
