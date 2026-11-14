<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import axios from 'axios';
import { useConfirm } from '@/composables/useConfirm';
import {
  Bot,
  Send,
  X,
  RefreshCw,
  Shield,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  CornerDownLeft,
  Trash2
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAF27wdCgN61fGdoH';
const isVerified = ref(Boolean(sessionStorage.getItem('xfive_ai_session')));
const turnstileToken = ref('');
const turnstileWidgetId = ref<string | null>(null);
const isVerifying = ref(false);
const turnstileError = ref('');

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

const DEFAULT_GREETING: Message = {
  role: 'assistant',
  content:
    'Halo sobat AyoDance! 👋\n\n' +
    'Saya adalah **Xfive Ai Created By Azis Maulana (Staff Programmer Xfive Community)**. 🤖✨\n\n' +
    'Saya siap membantumu menjawab semua pertanyaan seputar **Komunitas XFIVE** (jadwal meetup, pendaftaran member, rules, FAQ) dan **Game Audition AyoDance** (tips timing Perfect, rekomendasi lagu/BPM, mode permainan, dll).\n\n' +
    'Ada yang ingin kamu tanyakan hari ini?',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const messages = ref<Message[]>([DEFAULT_GREETING]);
const inputMessage = ref('');
const isLoading = ref(false);
const chatContainerRef = ref<HTMLElement | null>(null);

const quickSuggestions = [
  'Apa itu Komunitas XFIVE?',
  'Bagaimana alur pendaftaran member XFIVE?',
  'Tips timing Perfect di AyoDance',
  'Siapa saja dewan staff XFIVE?'
];

// Helper formatting markdown sederhana (bold, list, newline, quote)
const formatMarkdown = (text: string) => {
  if (!text) return '';
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300 font-bold">$1</strong>');
  // Italic *text*
  escaped = escaped.replace(/\*(.*?)\*/g, '<em class="text-emerald-300 italic">$1</em>');
  // Newlines to <br/>
  escaped = escaped.replace(/\n/g, '<br/>');

  return escaped;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
};

const renderTurnstile = () => {
  if (isVerified.value) return;
  const turnstile = (window as any).turnstile;
  const container = document.getElementById('ai-turnstile-container');
  if (!turnstile || !container) return;

  if (turnstileWidgetId.value !== null) {
    try {
      turnstile.remove(turnstileWidgetId.value);
    } catch {}
    turnstileWidgetId.value = null;
  }

  isVerifying.value = true;
  turnstileError.value = '';

  try {
    turnstileWidgetId.value = turnstile.render('#ai-turnstile-container', {
      sitekey: turnstileSiteKey,
      theme: 'dark',
      size: 'flexible',
      appearance: 'always',
      retry: 'auto',
      callback: async (token: string) => {
        turnstileToken.value = token;
        isVerifying.value = true;
        try {
          const verifyRes = await axios.post('/api/v1/ai/verify', { turnstileToken: token });
          if (verifyRes.data?.success && verifyRes.data?.aiSessionToken) {
            sessionStorage.setItem('xfive_ai_session', verifyRes.data.aiSessionToken);
          }
        } catch (e) {
          console.warn('Initial Turnstile verify response:', e);
        }
        isVerified.value = true;
        isVerifying.value = false;
        scrollToBottom();
      },
      'error-callback': (code?: string) => {
        isVerifying.value = false;
        turnstileError.value = code ? `Kode error: ${code}` : 'Verifikasi Cloudflare gagal';
      },
      'expired-callback': () => {
        isVerified.value = false;
        turnstileToken.value = '';
        sessionStorage.removeItem('xfive_ai_session');
      },
    });
  } catch (err: any) {
    isVerifying.value = false;
    turnstileError.value = err.message || 'Gagal memuat Cloudflare Turnstile';
  }
};

const ensureTurnstile = () => {
  if (isVerified.value) return;
  let attempts = 0;
  const poll = () => {
    const turnstile = (window as any).turnstile;
    const container = document.getElementById('ai-turnstile-container');
    if (turnstile && container) {
      renderTurnstile();
      return;
    }
    attempts++;
    if (attempts < 30) {
      setTimeout(poll, 150);
    }
  };
  poll();
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (!isVerified.value) {
        nextTick(() => {
          ensureTurnstile();
        });
      } else {
        scrollToBottom();
      }
    }
  }
);

const handleSend = async (customText?: string) => {
  const query = (customText || inputMessage.value).trim();
  if (!query || isLoading.value) return;

  inputMessage.value = '';
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messages.value.push({
    role: 'user',
    content: query,
    time: now,
  });

  isLoading.value = true;
  scrollToBottom();

  try {
    const savedSession = sessionStorage.getItem('xfive_ai_session') || '';
    const res = await axios.post('/api/v1/ai/chat', {
      messages: messages.value.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      aiSessionToken: savedSession,
      turnstileToken: turnstileToken.value,
    });

    if (res.data?.aiSessionToken) {
      sessionStorage.setItem('xfive_ai_session', res.data.aiSessionToken);
    }

    if (res.data?.success && res.data?.reply) {
      messages.value.push({
        role: 'assistant',
        content: res.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      messages.value.push({
        role: 'assistant',
        content: res.data?.message || 'Maaf, terjadi kesalahan saat menghubungi XFIVE AI.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  } catch (err: any) {
    if (err.response?.data?.requireTurnstile) {
      sessionStorage.removeItem('xfive_ai_session');
      isVerified.value = false;
      turnstileToken.value = '';
      ensureTurnstile();
    }

    const errMsg =
      err.response?.data?.message ||
      err.message ||
      'Gagal terhubung ke server XFIVE AI. Pastikan koneksi internet stabil.';
    messages.value.push({
      role: 'assistant',
      content: `⚠️ ${errMsg}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

const { confirm: confirmModal } = useConfirm();

const handleResetChat = async () => {
  const ok = await confirmModal({
    title: 'RESET SESI CHAT AI',
    message: 'Bersihkan seluruh riwayat percakapan dan mulai sesi baru?',
    confirmText: 'Ya, Bersihkan',
    cancelText: 'Batal',
    variant: 'warning',
  });
  if (ok) {
    messages.value = [DEFAULT_GREETING];
    scrollToBottom();
  }
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
  >
    <!-- Modal Container -->
    <div
      class="relative w-full max-w-2xl h-[92vh] sm:h-[84vh] max-h-[780px] bg-[#0c1017] border border-cyan-500/40 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(0,255,255,0.25)] overflow-hidden"
    >
      <!-- Cyber Glow Top Line -->
      <div class="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

      <!-- HEADER -->
      <header class="px-4 py-3.5 border-b border-white/10 bg-[#07090e]/90 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <Bot class="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-orbitron font-black text-sm sm:text-base text-white tracking-wide flex items-center gap-1.5">
                XFIVE <span class="text-cyan-400">AI</span>
              </h3>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ONLINE
              </span>
            </div>
            <p class="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5">
              Created By <span class="text-cyan-300 font-semibold">Azis Maulana</span> (Staff Programmer Xfive)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            v-if="isVerified"
            @click="handleResetChat"
            class="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 transition cursor-pointer"
            title="Bersihkan Percakapan"
          >
            <Trash2 class="w-4 h-4" />
          </button>
          <button
            @click="emit('close')"
            class="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Tutup XFIVE AI"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </header>

      <!-- SECURITY GATE (CLOUDFLARE TURNSTILE VERIFICATION) -->
      <div
        v-if="!isVerified"
        class="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5 bg-[#080b12]"
      >
        <div class="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
          <Shield class="w-8 h-8" />
        </div>

        <div class="max-w-md space-y-2">
          <h4 class="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider">
            SECURITY CHECK: CLOUDFLARE ANTI-BOT
          </h4>
          <p class="text-xs text-gray-400 leading-relaxed font-sans">
            Untuk menjaga stabilitas server dan mencegah spam bot, mohon selesaikan verifikasi Cloudflare di bawah ini sebelum mengakses asisten <strong class="text-cyan-400">XFIVE AI</strong>.
          </p>
        </div>

        <!-- Container Widget Cloudflare -->
        <div class="w-full max-w-sm rounded-xl border border-cyan-500/30 bg-black/50 p-4 space-y-3">
          <div class="flex items-center justify-between text-xs font-orbitron">
            <span class="text-cyan-300 text-[11px] font-bold flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-cyan-400" />
              <span>Verifikasi Pengunjung Manusia</span>
            </span>
          </div>

          <div id="ai-turnstile-container" class="flex justify-center items-center min-h-[65px] my-2"></div>

          <div v-if="turnstileError" class="space-y-1 text-center">
            <p class="text-[10px] text-rose-400 font-mono">{{ turnstileError }}</p>
            <button
              type="button"
              @click="renderTurnstile"
              class="text-[10px] text-cyan-400 hover:underline font-mono inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw class="w-3 h-3" /> Coba Verifikasi Ulang
            </button>
          </div>
          <p v-else class="text-[10px] text-gray-400 font-mono">
            🛡️ Memeriksa keamanan browser Anda...
          </p>
        </div>

        <p class="text-[10px] text-gray-500 font-mono">
          XFIVE AI • Didukung Groq LLaMA 3.3 Versatile
        </p>
      </div>

      <!-- CHAT INTERFACE (TERBUKA SETELAH VERIFIKASI BERHASIL) -->
      <template v-else>
        <!-- Scope Notification Bar -->
        <div class="bg-cyan-950/40 border-b border-cyan-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-cyan-300 font-mono">
          <span class="flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Fokus AI: <strong>Komunitas XFIVE &amp; Audition AyoDance</strong></span>
          </span>
          <span class="text-gray-400 text-[10px] hidden sm:inline">Pertanyaan di luar topik akan ditolak</span>
        </div>

        <!-- MESSAGE LIST -->
        <div
          ref="chatContainerRef"
          class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-sans text-sm"
        >
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <!-- SENDER BADGE -->
            <div class="flex items-center gap-1.5 mb-1 px-1">
              <span
                class="text-[10px] font-mono tracking-wider font-bold"
                :class="msg.role === 'user' ? 'text-pink-400' : 'text-cyan-400'"
              >
                {{ msg.role === 'user' ? 'KAMU' : 'XFIVE AI' }}
              </span>
              <span v-if="msg.time" class="text-[9px] text-gray-500 font-mono">{{ msg.time }}</span>
            </div>

            <!-- BUBBLE -->
            <div
              class="max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed shadow-lg break-words"
              :class="
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pink-600/90 to-purple-600/90 text-white rounded-tr-sm border border-pink-400/30'
                  : 'bg-[#121722] text-gray-200 rounded-tl-sm border border-cyan-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              "
            >
              <div
                v-if="msg.role === 'assistant'"
                v-html="formatMarkdown(msg.content)"
                class="space-y-1.5 text-xs sm:text-sm"
              ></div>
              <div v-else class="text-xs sm:text-sm whitespace-pre-wrap">
                {{ msg.content }}
              </div>
            </div>
          </div>

          <!-- TYPING INDICATOR -->
          <div v-if="isLoading" class="flex flex-col items-start space-y-1">
            <span class="text-[10px] text-cyan-400 font-mono tracking-wider font-bold px-1">XFIVE AI</span>
            <div class="rounded-2xl rounded-tl-sm bg-[#121722] border border-cyan-500/30 px-4 py-3 flex items-center gap-2 text-cyan-400 text-xs font-mono">
              <RefreshCw class="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>XFIVE AI sedang berpikir...</span>
            </div>
          </div>
        </div>

        <!-- QUICK SUGGESTIONS -->
        <div v-if="messages.length <= 2 && !isLoading" class="px-4 py-2 bg-[#090d14] border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span class="text-[10px] font-mono text-gray-400 shrink-0">Saran:</span>
          <button
            v-for="(sug, sIdx) in quickSuggestions"
            :key="sIdx"
            @click="handleSend(sug)"
            class="text-[11px] text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-2.5 py-1 whitespace-nowrap transition cursor-pointer"
          >
            {{ sug }}
          </button>
        </div>

        <!-- INPUT BOX -->
        <footer class="p-3 sm:p-4 border-t border-white/10 bg-[#07090e]">
          <form @submit.prevent="handleSend()" class="flex items-center gap-2">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="Tanya seputar komunitas XFIVE atau Audition AyoDance..."
              :disabled="isLoading"
              maxlength="400"
              class="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-gray-500 text-xs sm:text-sm outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              :disabled="!inputMessage.trim() || isLoading"
              class="px-4 py-3 rounded-xl font-orbitron font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send class="w-4 h-4" />
              <span class="hidden sm:inline">Kirim</span>
            </button>
          </form>
          <div class="mt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono px-1">
            <span>XFIVE Community • AyoDance Megaxus</span>
            <span>Created By Azis Maulana</span>
          </div>
        </footer>
      </template>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
