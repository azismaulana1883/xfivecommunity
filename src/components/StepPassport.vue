<script setup lang="ts">
import { computed, ref } from 'vue';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { Download, Copy, Check, MessageCircle, Mail, Key, User } from 'lucide-vue-next';
import { getTesterShortName } from '@/data/testers';

const props = defineProps(['data']);

const isContactingTester = ref(false);
const isDownloading = ref(false);
const copied = ref(false);
const copiedCodeEdit = ref(false);
const downloadError = ref('');

const memberCode = computed(() => props.data?.memberCode || 'X5-PENDING');
const uniqueCodeEdit = computed(() => props.data?.unique_code_edit || props.data?.uniqueCodeEdit || '');
const slug = computed(() => props.data?.slug || (props.data?.nickname ? String(props.data.nickname).toLowerCase().replace(/[^a-z0-9]/g, '-') : ''));

const nama = computed(() => props.data?.nama || props.data?.namaPanggilan || '-');
const nickname = computed(() => props.data?.nickname || props.data?.nicknameAyodance || '-');
const divisi = computed(() => props.data?.divisi || props.data?.divisiCommunity || '-');
const domisili = computed(() => props.data?.domisili || '-');
const tester = computed(() => getTesterShortName(props.data?.tester));
const email = computed(() => props.data?.email || '');
const quote = computed(() => props.data?.quote || '');

const initials = computed(() => {
  const source = String(nama.value || '').trim();
  return source && source !== '-' ? source.substring(0, 2).toUpperCase() : 'X5';
});

const issuedDate = computed(() => {
  const raw = props.data?.issuedAt;
  const parsed = raw ? new Date(raw) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
});

/** Membership card is valid for two years from issuance. */
const expiryDate = computed(() => {
  const d = new Date(issuedDate.value.getTime());
  d.setFullYear(d.getFullYear() + 2);
  return d;
});

const formatId = (value: Date | string | undefined): string => {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const tanggalLahirText = computed(() => formatId(props.data?.tanggalLahir));
const issuedText = computed(() => formatId(issuedDate.value));
const expiryText = computed(() => formatId(expiryDate.value));

// ---------------------------------------------------------------------------
// Machine-readable zone
// ---------------------------------------------------------------------------
const mrzChars = (value: string, length: number): string =>
  String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '<')
    .slice(0, length)
    .padEnd(length, '<');

const yymmdd = (value: Date | string | undefined): string => {
  if (!value) return '<<<<<<';
  const d = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '<<<<<<';
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

const mrzLine1 = computed(() =>
  `X5<IDN${mrzChars(nama.value, 18)}<<${mrzChars(nickname.value, 16)}`.padEnd(44, '<').slice(0, 44)
);

const mrzLine2 = computed(() =>
  `${mrzChars(memberCode.value, 11)}IDN${yymmdd(props.data?.tanggalLahir)}<${mrzChars(divisi.value, 4)}${yymmdd(expiryDate.value)}`
    .padEnd(44, '<')
    .slice(0, 44)
);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
const downloadPassport = async () => {
  const element = document.getElementById('passportCard');
  if (!element || isDownloading.value) return;

  isDownloading.value = true;
  downloadError.value = '';

  try {
    // html2canvas measures text with whatever font is resolved at capture time.
    // Without this the card renders in the fallback font.
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = await html2canvas(element, {
      backgroundColor: '#0B0F16',
      useCORS: true,
      allowTaint: false,
      logging: false,
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `XFIVE-EPassport-${memberCode.value}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Passport download failed:', err);
    downloadError.value =
      'Gagal mengunduh passport. Silakan screenshot halaman ini, atau buka E-Passport dari email kamu.';
  } finally {
    isDownloading.value = false;
  }
};

const copyMemberCode = async () => {
  try {
    await navigator.clipboard.writeText(memberCode.value);
  } catch {
    // Older/insecure contexts have no clipboard API.
    const helper = document.createElement('textarea');
    helper.value = memberCode.value;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    try { document.execCommand('copy'); } catch { /* nothing else to try */ }
    document.body.removeChild(helper);
  }
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
};

const copyUniqueCodeEdit = async () => {
  if (!uniqueCodeEdit.value) return;
  try {
    await navigator.clipboard.writeText(uniqueCodeEdit.value);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = uniqueCodeEdit.value;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
    document.body.removeChild(helper);
  }
  copiedCodeEdit.value = true;
  setTimeout(() => { copiedCodeEdit.value = false; }, 2000);
};

const testerMessage = computed(
  () =>
    `Halo ${tester.value}, saya member baru XFIVE dengan nickname ${nickname.value} (kode member ${memberCode.value}). Saya sudah menyelesaikan registrasi.`
);

const contactTester = async () => {
  if (!props.data?.tester || isContactingTester.value) return;
  isContactingTester.value = true;

  try {
    const resp = await axios.post('/.netlify/functions/contact-tester', {
      tester: props.data.tester,
      message: testerMessage.value,
    });

    if (resp.data?.success && resp.data?.url) {
      window.open(resp.data.url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(testerMessage.value)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  } catch {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(testerMessage.value)}`,
      '_blank',
      'noopener,noreferrer'
    );
  } finally {
    isContactingTester.value = false;
  }
};

const WEBMAIL: Record<string, string> = {
  'gmail.com': 'https://mail.google.com/mail/u/0/#search/XFIVE',
  'googlemail.com': 'https://mail.google.com/mail/u/0/#search/XFIVE',
  'yahoo.com': 'https://mail.yahoo.com/',
  'yahoo.co.id': 'https://mail.yahoo.com/',
  'outlook.com': 'https://outlook.live.com/mail/0/',
  'hotmail.com': 'https://outlook.live.com/mail/0/',
  'live.com': 'https://outlook.live.com/mail/0/',
  'icloud.com': 'https://www.icloud.com/mail',
  'proton.me': 'https://mail.proton.me/',
  'protonmail.com': 'https://mail.proton.me/',
};

const openEmail = () => {
  const domain = email.value.split('@')[1]?.toLowerCase() || '';
  const url = WEBMAIL[domain];
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
  else window.location.href = `mailto:${email.value}`;
};
</script>

<template>
  <div class="space-y-8 animate-fade-in flex flex-col items-center">
    <div class="space-y-2 text-center">
      <h2 class="text-3xl font-bold glitch-text font-orbitron text-green-400">PENDAFTARAN SELESAI</h2>
      <p class="text-gray-400">Selamat datang di Komunitas XFIVE, {{ nama }}.</p>
    </div>

    <!-- ==================== E-PASSPORT ==================== -->
    <!--
      Everything inside #passportCard is captured by html2canvas, which does not
      understand oklch(), backdrop-filter, conic-gradient or mask. Colours here
      are hex/rgb and gradients are linear/radial only.
    -->
    <div
      id="passportCard"
      class="relative w-full max-w-md rounded-2xl p-[2px] shadow-2xl"
      style="background-image: linear-gradient(135deg, #E9C46A 0%, #8A6B22 28%, #0E7490 62%, #22D3EE 100%);"
    >
      <div class="relative rounded-[14px] overflow-hidden" style="background-color: #0B0F16;">

        <!-- Guilloche security pattern -->
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none"
          style="opacity: 0.16;"
          viewBox="0 0 400 560"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="x5-guilloche" width="56" height="56" patternUnits="userSpaceOnUse">
              <circle cx="28" cy="28" r="26" fill="none" stroke="#22D3EE" stroke-width="0.4" />
              <circle cx="28" cy="28" r="19" fill="none" stroke="#E9C46A" stroke-width="0.4" />
              <circle cx="28" cy="28" r="12" fill="none" stroke="#22D3EE" stroke-width="0.4" />
              <circle cx="0" cy="0" r="26" fill="none" stroke="#E9C46A" stroke-width="0.35" />
              <circle cx="56" cy="56" r="26" fill="none" stroke="#E9C46A" stroke-width="0.35" />
            </pattern>
          </defs>
          <rect width="400" height="560" fill="url(#x5-guilloche)" />
        </svg>

        <!-- Header -->
        <div
          class="relative px-5 py-4 flex items-center justify-between"
          style="background-image: linear-gradient(90deg, #101827 0%, #16283F 55%, #0F3A45 100%); border-bottom: 1px solid #22304A;"
        >
          <div>
            <div class="font-orbitron font-bold text-xl tracking-[0.35em]" style="color: #E9C46A;">XFIVE</div>
            <div class="text-[9px] tracking-[0.28em] mt-0.5" style="color: #93A4BF;">COMMUNITY E-PASSPORT</div>
          </div>
          <div class="text-right">
            <div class="text-[9px] tracking-[0.2em]" style="color: #93A4BF;">REPUBLIK AYODANCE</div>
            <div class="font-mono text-sm font-bold tracking-widest" style="color: #22D3EE;">{{ memberCode }}</div>
          </div>
        </div>

        <!-- Body -->
        <div class="relative px-5 py-5 flex gap-4">
          <!-- Photo zone + chip + hologram -->
          <div class="shrink-0 w-[104px] space-y-2">
            <div
              class="relative w-[104px] h-[130px] rounded-md overflow-hidden flex items-center justify-center"
              style="background-color: #131C2B; border: 1px solid #E9C46A;"
            >
              <img
                v-if="data.avatarUrl || data.avatar || data.faceImageUrl"
                :src="data.avatarUrl || data.avatar || data.faceImageUrl"
                alt="Foto member"
                crossorigin="anonymous"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-3xl font-bold font-orbitron" style="color: #E6EDF7;">{{ initials }}</span>
              <div
                class="absolute inset-0 pointer-events-none"
                style="background-image: linear-gradient(180deg, rgba(34,211,238,0) 55%, rgba(11,15,22,0.85) 100%);"
              ></div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Chip -->
              <div
                class="w-8 h-6 rounded-[3px] relative"
                style="background-image: linear-gradient(135deg, #F4D98B 0%, #C9A227 50%, #8A6B22 100%);"
              >
                <div class="absolute inset-x-1 top-2 h-px" style="background-color: #6B5316;"></div>
                <div class="absolute inset-x-1 top-3.5 h-px" style="background-color: #6B5316;"></div>
                <div class="absolute inset-y-1 left-1/2 w-px" style="background-color: #6B5316;"></div>
              </div>
              <!-- Hologram -->
              <div
                class="w-8 h-8 rounded-full relative overflow-hidden"
                style="background-image: radial-gradient(circle at 32% 30%, #22D3EE 0%, #8A2BE2 42%, #E9C46A 74%, #0B0F16 100%);"
              >
                <div
                  class="absolute inset-0"
                  style="background-image: linear-gradient(120deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%);"
                ></div>
              </div>
            </div>
          </div>

          <!-- Data zone -->
          <div class="flex-1 min-w-0 grid grid-cols-2 gap-x-3 gap-y-2.5 text-left">
            <div class="col-span-2">
              <div class="text-[8px] tracking-[0.18em] uppercase" style="color: #93A4BF;">Nama</div>
              <div class="font-bold text-[15px] leading-tight truncate" style="color: #E6EDF7;">{{ nama }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-[8px] tracking-[0.18em] uppercase" style="color: #93A4BF;">Nickname</div>
              <div class="font-bold text-[15px] leading-tight truncate" style="color: #22D3EE;">{{ nickname }}</div>
            </div>
            <div>
              <div class="text-[8px] tracking-[0.18em] uppercase" style="color: #93A4BF;">Divisi</div>
              <div class="font-semibold text-[13px] leading-tight" style="color: #E9C46A;">{{ divisi }}</div>
            </div>
            <div>
              <div class="text-[8px] tracking-[0.18em] uppercase" style="color: #93A4BF;">Domisili</div>
              <div class="font-semibold text-[13px] leading-tight truncate" style="color: #E6EDF7;">{{ domisili }}</div>
            </div>
            <div>
              <div class="text-[8px] tracking-[0.18em] uppercase" style="color: #93A4BF;">Tanggal Lahir</div>
              <div class="font-semibold text-[13px] leading-tight" style="color: #E6EDF7;">{{ tanggalLahirText }}</div>
            </div>
            <div>
              <div class="text-[8px] tracking-[0.18em] uppercase" style="color: #93A4BF;">Tester</div>
              <div class="font-semibold text-[13px] leading-tight truncate" style="color: #E6EDF7;">{{ tester }}</div>
            </div>
            <div>
              <div class="text-[8px] tracking-[0.18em] uppercase" style="color: #93A4BF;">Tanggal Terbit</div>
              <div class="font-semibold text-[13px] leading-tight" style="color: #E6EDF7;">{{ issuedText }}</div>
            </div>
            <div>
              <div class="text-[8px] tracking-[0.18em] uppercase" style="color: #93A4BF;">Berlaku Hingga</div>
              <div class="font-semibold text-[13px] leading-tight" style="color: #E6EDF7;">{{ expiryText }}</div>
            </div>
          </div>
        </div>

        <!-- Quote panel -->
        <div class="relative px-5 pb-4">
          <div
            class="rounded-md px-4 py-3 text-left"
            style="background-color: #111726; border-left: 3px solid #E9C46A;"
          >
            <div class="text-[8px] tracking-[0.18em] uppercase mb-1" style="color: #93A4BF;">Quote</div>
            <p class="text-[12px] italic leading-relaxed break-words" style="color: #E6EDF7;">
              &ldquo;{{ quote || 'Dance like nobody is watching.' }}&rdquo;
            </p>
          </div>
        </div>

        <!-- MRZ strip -->
        <div
          class="relative px-4 py-3 text-left"
          style="background-color: #05080D; border-top: 1px solid #22304A;"
        >
          <div class="font-mono text-[9px] sm:text-[10px] leading-[1.5] tracking-[0.08em] break-all" style="color: #8FA3C0;">
            {{ mrzLine1 }}
          </div>
          <div class="font-mono text-[9px] sm:text-[10px] leading-[1.5] tracking-[0.08em] break-all" style="color: #8FA3C0;">
            {{ mrzLine2 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Email delivery notice -->
    <div
      v-if="email"
      class="w-full max-w-md rounded-lg px-4 py-3 text-sm text-center"
      :class="data.emailSent
        ? 'border border-green-500/50 bg-green-500/10 text-green-200'
        : 'border border-amber-500/50 bg-amber-500/10 text-amber-100'"
    >
      <template v-if="data.emailSent">
        E-Passport sudah dikirim ke <strong class="break-all">{{ email }}</strong>.
        Cek folder <em>Spam/Promosi</em> kalau belum terlihat.
      </template>
      <template v-else>
        Pendaftaran kamu <strong>berhasil tersimpan</strong>, tapi email ke
        <strong class="break-all">{{ email }}</strong> belum terkirim.
        Simpan kode member kamu dan unduh E-Passport di bawah ini.
      </template>
    </div>

    <!-- Secret Edit Key Notice & Copy Box -->
    <div
      v-if="uniqueCodeEdit"
      class="w-full max-w-md rounded-xl p-4 bg-gradient-to-r from-purple-950/40 via-black to-blue-950/40 border border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)] text-left space-y-2.5"
    >
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-orbitron font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-1.5">
          <Key class="w-3.5 h-3.5 text-fuchsia-400" /> KUNCI EDIT PROFIL (SECRET KEY)
        </span>
        <button
          @click="copyUniqueCodeEdit"
          class="text-xs px-2.5 py-1 rounded bg-fuchsia-500/20 hover:bg-fuchsia-500 text-fuchsia-300 hover:text-black font-semibold transition-all flex items-center gap-1 cursor-pointer border border-fuchsia-500/40"
        >
          <component :is="copiedCodeEdit ? Check : Copy" class="w-3.5 h-3.5" />
          {{ copiedCodeEdit ? 'TERSALIN!' : 'SALIN KUNCI' }}
        </button>
      </div>

      <div class="font-mono text-base font-bold text-cyan-300 bg-black/70 px-3 py-2 rounded border border-fuchsia-500/30 tracking-wider flex items-center justify-between select-all">
        <span>{{ uniqueCodeEdit }}</span>
      </div>

      <p class="text-[11px] text-gray-400 leading-relaxed">
        <span class="text-fuchsia-400 font-semibold">PENTING:</span> Simpan kunci ini baik-baik! Kunci rahasia ini digunakan saat kamu ingin mengedit profil kamu sendiri di halaman direktori anggota (<code class="text-cyan-400 font-mono">/members</code>).
      </p>
    </div>

    <p v-if="downloadError" class="w-full max-w-md p-3 bg-red-900/40 border border-red-500/60 rounded-lg text-sm text-red-200 text-center">
      {{ downloadError }}
    </p>

    <!-- Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
      <button
        @click="downloadPassport" :disabled="isDownloading"
        class="btn w-full flex items-center justify-center gap-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black disabled:opacity-50"
      >
        <Download class="w-4 h-4" />
        {{ isDownloading ? 'MENYIAPKAN...' : 'UNDUH PASSPORT' }}
      </button>

      <button
        @click="copyMemberCode"
        class="btn w-full flex items-center justify-center gap-2 border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-black"
      >
        <component :is="copied ? Check : Copy" class="w-4 h-4" />
        {{ copied ? 'TERSALIN!' : 'SALIN KODE MEMBER' }}
      </button>

      <button
        @click="contactTester" :disabled="isContactingTester"
        class="btn w-full flex items-center justify-center gap-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-black disabled:opacity-50"
      >
        <MessageCircle class="w-4 h-4" />
        {{ isContactingTester ? 'MENGHUBUNGI...' : 'HUBUNGI TESTER' }}
      </button>

      <button
        v-if="email" @click="openEmail"
        class="btn w-full flex items-center justify-center gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white"
      >
        <Mail class="w-4 h-4" />
        BUKA EMAIL
      </button>

      <router-link
        v-if="slug"
        :to="`/member/${slug}`"
        class="btn w-full col-span-1 sm:col-span-2 flex items-center justify-center gap-2 border-cyan-400 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-400 hover:text-black font-orbitron font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)]"
      >
        <User class="w-4 h-4" />
        LIHAT &amp; EDIT PROFIL SAYA
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* Explicit family so html2canvas resolves the same font it sees on screen. */
.font-orbitron {
  font-family: 'Orbitron', sans-serif;
}
</style>
