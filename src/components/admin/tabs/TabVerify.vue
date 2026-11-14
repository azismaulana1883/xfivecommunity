<script setup lang="ts">
import { ref } from 'vue';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-vue-next';

interface VerifyResult {
  raw: string;
  normalized: string;
  status: 'VALID' | 'BLACKLIST' | 'NOT_FOUND';
  info: string;
}

const props = defineProps<{
  members: any[];
  blacklistList: any[];
}>();

const verifyRawInput = ref('');
const verifyParsedResults = ref<VerifyResult[]>([]);

const parseAndVerify = () => {
  const text = verifyRawInput.value;
  if (!text.trim()) {
    verifyParsedResults.value = [];
    return;
  }

  const tokens = text
    .split(/[\n,/|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

  const results: VerifyResult[] = tokens.map((token) => {
    const cleanNick = token.replace(/^[-\s]+|[-\s]+$/g, '');
    const low = token.toLowerCase();
    const isBl = props.blacklistList.some((b) => (b.nickname || '').toLowerCase().includes(low));
    if (isBl) {
      return { raw: token, normalized: cleanNick, status: 'BLACKLIST', info: 'Masuk daftar sanksi/blacklist' };
    }
    const isMem = props.members.some((m) => (m.nickname || '').toLowerCase() === low);
    if (isMem) {
      return { raw: token, normalized: cleanNick, status: 'VALID', info: 'Terdaftar resmi di database member' };
    }

    return { raw: token, normalized: cleanNick, status: 'NOT_FOUND', info: 'Belum terdaftar' };
  });

  verifyParsedResults.value = results;
};

const resetVerify = () => {
  verifyRawInput.value = '';
  verifyParsedResults.value = [];
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="rounded-2xl border border-cyan-500/20 bg-[#0c121e]/80 p-6">
      <h3 class="text-sm font-bold font-orbitron text-cyan-400 flex items-center gap-2 mb-2">
        <UserCheck class="w-4 h-4" /> VERIFIKASI BATCH NICKNAME DARI LAPANGAN
      </h3>
      <p class="text-xs text-gray-400 mb-4">
        Paste daftar nama mentah dari game/gath (bisa dipisah baris baru, tanda koma, garis miring, atau pipa).
      </p>

      <textarea
        v-model="verifyRawInput"
        rows="6"
        placeholder="Contoh:&#10;-RamsX5- / -FaskyX5-&#10;ImnotKingX5-666, flowX5-1Fc"
        class="w-full p-4 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none"
      ></textarea>

      <div class="flex gap-3 mt-4">
        <button
          @click="parseAndVerify"
          class="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          Parse &amp; Cocokkan Database
        </button>
        <button
          @click="resetVerify"
          class="px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div v-if="verifyParsedResults.length > 0" class="mt-6 border-t border-white/5 pt-6">
        <h4 class="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-wider mb-4">
          Hasil Pencocokan ({{ verifyParsedResults.length }} Nama)
        </h4>

        <div class="space-y-2">
          <div
            v-for="(res, idx) in verifyParsedResults"
            :key="idx"
            class="p-3 rounded-xl border text-xs font-mono flex items-center justify-between"
            :class="
              res.status === 'VALID' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
              res.status === 'BLACKLIST' ? 'bg-red-950/40 border-red-500/30 text-red-300' :
              'bg-gray-900 border-gray-800 text-gray-400'
            "
          >
            <div class="flex items-center gap-3">
              <CheckCircle v-if="res.status === 'VALID'" class="w-4 h-4 text-emerald-400" />
              <XCircle v-else-if="res.status === 'BLACKLIST'" class="w-4 h-4 text-red-400" />
              <AlertTriangle v-else class="w-4 h-4 text-gray-500" />

              <div>
                <span class="font-bold font-orbitron text-white mr-2">{{ res.raw }}</span>
                <span class="text-[10px] text-gray-400">({{ res.info }})</span>
              </div>
            </div>

            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold font-orbitron uppercase"
              :class="
                res.status === 'VALID' ? 'bg-emerald-500/20 text-emerald-400' :
                res.status === 'BLACKLIST' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-800 text-gray-500'
              "
            >
              {{ res.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
