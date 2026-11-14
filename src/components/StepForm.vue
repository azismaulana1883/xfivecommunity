<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import axios from 'axios';
import {
  User, Gamepad2, Calendar, Phone, MapPin, UserCheck,
  Users, AtSign, Mail, Quote as QuoteIcon, RefreshCw, ShieldCheck, MousePointerClick,
  Upload, Camera, Image as ImageIcon, Check, AlertCircle, X, Sparkles,
} from 'lucide-vue-next';
import CloudflareBadge from './CloudflareBadge.vue';
import SearchableSelect from './SearchableSelect.vue';

const props = defineProps(['biometricData']);
const emit = defineEmits(['submit']);

import { TESTER_ROSTER, normalizeTesterToCode } from '@/data/testers';

const DRAFT_KEY = 'x5-registration-draft';
const QUOTE_MAX = 120;
const TURNSTILE_TIMEOUT_MS = 60000;

/** Tester roster options for SearchableSelect */
const testerOptions = computed(() => {
  return TESTER_ROSTER.map((t) => ({
    id: t.code,
    name: `${t.name} (${t.nickname})`,
  }));
});

const form = reactive({
  nama: '',
  nickname: '',
  tanggalLahir: '',
  nomorWa: '',
  domisili: '',
  tester: '',
  divisi: '',
  usernameSosmed: '',
  email: '',
  quote: '',
});

const touched = reactive<Record<string, boolean>>({});
const isSubmitting = ref(false);
const statusMessage = ref('MENGIRIM DATA...');
const error = ref('');

// ---------------------------------------------------------------------------
// Foto Profil Member (Foto 2 - Wajib Max 2MB & Auto WebP)
// ---------------------------------------------------------------------------
const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarDataUri = ref<string | null>(null);
const avatarPreviewUrl = ref<string | null>(null);
const avatarUploadSize = ref<string>('');
const avatarError = ref<string>('');

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const onAvatarFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  avatarError.value = '';

  if (!file.type.startsWith('image/')) {
    avatarError.value = 'File yang dipilih harus berupa gambar (JPG, PNG, atau WEBP).';
    return;
  }

  // Max 2 MB limit (2 * 1024 * 1024 bytes)
  if (file.size > 2 * 1024 * 1024) {
    avatarError.value = `Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 2 MB. Mohon pilih foto lain.`;
    return;
  }

  // Auto-convert to WebP via HTML5 Canvas
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1024;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      const webpUri = canvas.toDataURL('image/webp', 0.85);
      avatarDataUri.value = webpUri;
      avatarPreviewUrl.value = webpUri;

      const approxBytes = Math.round((webpUri.length - 22) * 3 / 4);
      avatarUploadSize.value = `${Math.round(approxBytes / 1024)} KB`;
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeAvatar = () => {
  avatarDataUri.value = null;
  avatarPreviewUrl.value = null;
  avatarUploadSize.value = '';
  avatarError.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};

// ---------------------------------------------------------------------------
// Cek Duplikasi Nickname ke DB Members (Realtime Debounced)
// ---------------------------------------------------------------------------
const isCheckingNickname = ref(false);
const nicknameIsDuplicate = ref(false);
const nicknameCheckStatus = ref<'idle' | 'checking' | 'available' | 'duplicate'>('idle');
const nicknameCheckMessage = ref('');
let nicknameCheckTimer: ReturnType<typeof setTimeout> | null = null;

const checkNickname = async (nickname: string) => {
  const trimmed = nickname.trim();
  if (trimmed.length < 2) {
    nicknameIsDuplicate.value = false;
    nicknameCheckStatus.value = 'idle';
    nicknameCheckMessage.value = '';
    return;
  }

  isCheckingNickname.value = true;
  nicknameCheckStatus.value = 'checking';

  try {
    const res = await axios.get(`/api/v1/members/check-nickname?nickname=${encodeURIComponent(trimmed)}`);
    if (res.data?.exists) {
      nicknameIsDuplicate.value = true;
      nicknameCheckStatus.value = 'duplicate';
      nicknameCheckMessage.value = res.data?.message || 'Nickname ini sudah terdaftar. Silakan gunakan nickname lain.';
      markTouched('nickname');
    } else {
      nicknameIsDuplicate.value = false;
      nicknameCheckStatus.value = 'available';
      nicknameCheckMessage.value = 'Nickname tersedia';
    }
  } catch (err) {
    console.warn('Gagal cek ketersediaan nickname:', err);
    nicknameCheckStatus.value = 'idle';
  } finally {
    isCheckingNickname.value = false;
  }
};

watch(
  () => form.nickname,
  (newNick) => {
    if (nicknameCheckTimer) clearTimeout(nicknameCheckTimer);
    nicknameIsDuplicate.value = false;
    nicknameCheckMessage.value = '';
    nicknameCheckStatus.value = 'idle';

    if (newNick && newNick.trim().length >= 2) {
      nicknameCheckTimer = setTimeout(() => {
        checkNickname(newNick);
      }, 350);
    }
  }
);

// ---------------------------------------------------------------------------
// Draft persistence (sessionStorage only — cleared when the tab closes)
// ---------------------------------------------------------------------------
const restoreDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      if (typeof saved?.[key] === 'string') form[key] = saved[key];
    }
  } catch {
    /* corrupt draft — start fresh */
  }
};

let draftTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => ({ ...form }),
  (value) => {
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(value));
      } catch {
        /* private mode / quota — draft saving is a nicety, not a requirement */
      }
    }, 400);
  },
  { deep: true }
);

// ---------------------------------------------------------------------------
// Cascading Wilayah Indonesia (Provinsi -> Kota -> Kecamatan -> Kelurahan)
// ---------------------------------------------------------------------------
interface WilayahItem {
  id: string;
  name: string;
}

const provinsiList = ref<WilayahItem[]>([]);
const kabupatenList = ref<WilayahItem[]>([]);
const kecamatanList = ref<WilayahItem[]>([]);
const desaList = ref<WilayahItem[]>([]);

const selectedProvinsi = ref('');
const selectedKabupaten = ref('');
const selectedKecamatan = ref('');
const selectedDesa = ref('');

const wilayahNama = reactive({
  provinsi: '',
  kabupaten: '',
  kecamatan: '',
  desa: '',
});

const loadingWilayah = reactive({
  provinsi: false,
  kabupaten: false,
  kecamatan: false,
  desa: false,
});

const loadProvinces = async () => {
  loadingWilayah.provinsi = true;
  try {
    const res = await axios.get('/api/v1/wilayah?type=provinces');
    if (res.data?.success && Array.isArray(res.data.data)) {
      provinsiList.value = res.data.data;
    }
  } catch (err) {
    console.warn('Gagal memuat daftar provinsi:', err);
  } finally {
    loadingWilayah.provinsi = false;
  }
};

const updateDomisiliValue = () => {
  const parts: string[] = [];
  if (wilayahNama.desa) parts.push(wilayahNama.desa);
  if (wilayahNama.kecamatan) parts.push(`Kec. ${wilayahNama.kecamatan}`);
  if (wilayahNama.kabupaten) parts.push(wilayahNama.kabupaten);
  if (wilayahNama.provinsi) parts.push(wilayahNama.provinsi);

  form.domisili = parts.join(', ');
};

const onProvinsiChange = async () => {
  const prov = provinsiList.value.find((p) => p.id === selectedProvinsi.value);
  wilayahNama.provinsi = prov ? prov.name : '';
  selectedKabupaten.value = '';
  wilayahNama.kabupaten = '';
  selectedKecamatan.value = '';
  wilayahNama.kecamatan = '';
  selectedDesa.value = '';
  wilayahNama.desa = '';
  kabupatenList.value = [];
  kecamatanList.value = [];
  desaList.value = [];

  updateDomisiliValue();
  markTouched('domisili');

  if (!selectedProvinsi.value) return;

  loadingWilayah.kabupaten = true;
  try {
    const res = await axios.get(`/api/v1/wilayah?type=regencies&parent_id=${selectedProvinsi.value}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      kabupatenList.value = res.data.data;
    }
  } catch (err) {
    console.warn('Gagal memuat kabupaten:', err);
  } finally {
    loadingWilayah.kabupaten = false;
  }
};

const onKabupatenChange = async () => {
  const kab = kabupatenList.value.find((k) => k.id === selectedKabupaten.value);
  wilayahNama.kabupaten = kab ? kab.name : '';
  selectedKecamatan.value = '';
  wilayahNama.kecamatan = '';
  selectedDesa.value = '';
  wilayahNama.desa = '';
  kecamatanList.value = [];
  desaList.value = [];

  updateDomisiliValue();
  markTouched('domisili');

  if (!selectedKabupaten.value) return;

  loadingWilayah.kecamatan = true;
  try {
    const res = await axios.get(`/api/v1/wilayah?type=districts&parent_id=${selectedKabupaten.value}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      kecamatanList.value = res.data.data;
    }
  } catch (err) {
    console.warn('Gagal memuat kecamatan:', err);
  } finally {
    loadingWilayah.kecamatan = false;
  }
};

const onKecamatanChange = async () => {
  const kec = kecamatanList.value.find((k) => k.id === selectedKecamatan.value);
  wilayahNama.kecamatan = kec ? kec.name : '';
  selectedDesa.value = '';
  wilayahNama.desa = '';
  desaList.value = [];

  updateDomisiliValue();
  markTouched('domisili');

  if (!selectedKecamatan.value) return;

  loadingWilayah.desa = true;
  try {
    const res = await axios.get(`/api/v1/wilayah?type=villages&parent_id=${selectedKecamatan.value}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      desaList.value = res.data.data;
    }
  } catch (err) {
    console.warn('Gagal memuat kelurahan/desa:', err);
  } finally {
    loadingWilayah.desa = false;
  }
};

const onDesaChange = () => {
  const des = desaList.value.find((d) => d.id === selectedDesa.value);
  wilayahNama.desa = des ? des.name : '';
  updateDomisiliValue();
  markTouched('domisili');
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
const normalizeWa = (input: string): string => {
  let digits = String(input || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) digits = '62' + digits.replace(/^0+/, '');
  else if (digits.startsWith('8')) digits = '62' + digits;
  return digits;
};

const onWaInput = (event: Event) => {
  const el = event.target as HTMLInputElement;
  form.nomorWa = el.value.replace(/\D/g, '').slice(0, 15);
};

const waNormalized = computed(() => normalizeWa(form.nomorWa));

const errors = computed<Record<string, string>>(() => {
  const e: Record<string, string> = {};

  if (form.nama.trim().length < 2 || form.nama.trim().length > 40) {
    e.nama = 'Nama harus 2-40 karakter.';
  }
  if (form.nickname.trim().length < 2 || form.nickname.trim().length > 30) {
    e.nickname = 'Nickname harus 2-30 karakter.';
  } else if (nicknameIsDuplicate.value) {
    e.nickname = nicknameCheckMessage.value || 'Nickname ini sudah terdaftar. Silakan gunakan nickname lain.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tanggalLahir)) {
    e.tanggalLahir = 'Pilih tanggal lahir kamu.';
  } else if (new Date(`${form.tanggalLahir}T00:00:00Z`).getTime() > Date.now()) {
    e.tanggalLahir = 'Tanggal lahir tidak boleh di masa depan.';
  }
  const wa = waNormalized.value;
  if (!wa || wa.length < 9 || wa.length > 15) {
    e.nomorWa = 'Nomor WhatsApp harus 9-15 digit. Contoh: 081234567890.';
  }
  if (!selectedProvinsi.value || !selectedKabupaten.value || !form.domisili.trim()) {
    e.domisili = 'Pilih minimal Provinsi dan Kabupaten/Kota tempat tinggal kamu.';
  }
  const selectedTesterCode = normalizeTesterToCode(form.tester);
  if (!selectedTesterCode || !TESTER_ROSTER.some((t) => t.code === selectedTesterCode)) {
    e.tester = 'Pilih tester kamu.';
  }
  if (!['CLUB', 'COM'].includes(form.divisi)) {
    e.divisi = 'Pilih divisi CLUB atau COM.';
  }
  const username = form.usernameSosmed.trim().replace(/^@+/, '');
  if (username.length < 2 || username.length > 40) {
    e.usernameSosmed = 'Isi username Facebook/Instagram kamu.';
  }
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(form.email.trim())) {
    e.email = 'Email tidak valid — E-Passport dikirim ke sini.';
  }
  if (!form.quote.trim()) {
    e.quote = 'Tulis quote singkat kamu.';
  } else if (form.quote.trim().length > QUOTE_MAX) {
    e.quote = `Quote maksimal ${QUOTE_MAX} karakter.`;
  }
  if (!avatarDataUri.value) {
    e.avatar = 'Foto profil wajib diunggah (maks. 2 MB).';
  }

  return e;
});

const showError = (field: string) => touched[field] && errors.value[field];
const isValid = (field: string) => !errors.value[field];
const markTouched = (field: string) => { touched[field] = true; };

const totalFields = 11;
const filledCount = computed(
  () => Object.keys(form).filter((key) => !errors.value[key]).length + (avatarDataUri.value ? 1 : 0)
);
const formComplete = computed(() => Object.keys(errors.value).length === 0);
const progressPercent = computed(() => Math.round((filledCount.value / totalFields) * 100));

// ---------------------------------------------------------------------------
// Cloudflare Turnstile
//
// The widget used to be rendered into a 1x1 transparent box pinned to the
// bottom-right corner. Whenever Cloudflare escalated to an interactive
// challenge the checkbox was invisible and unclickable, so submission silently
// hung until the timeout. It is now a normal, visible element inside the form.
// ---------------------------------------------------------------------------
type TurnstileState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'interactive'
  | 'verified'
  | 'expired'
  | 'error'
  | 'script-failed'
  | 'no-sitekey'
  | 'unsupported';

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAF27wdCgN61fGdoH';
const turnstileState = ref<TurnstileState>('idle');
const turnstileToken = ref('');
const turnstileErrorCode = ref('');
const turnstileWidgetId = ref<string | null>(null);

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

const clearWatchdog = () => {
  if (watchdogTimer) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
};

const resetWidget = () => {
  turnstileToken.value = '';
  const turnstile = (window as any).turnstile;
  if (turnstileWidgetId.value !== null && turnstile) {
    try { turnstile.reset(turnstileWidgetId.value); } catch { /* already gone */ }
  }
};

const startWatchdog = () => {
  clearWatchdog();
  watchdogTimer = setTimeout(() => {
    if (turnstileToken.value) return;
    turnstileState.value = 'error';
    turnstileErrorCode.value = 'timeout';
    resetWidget();
    startWatchdog();
  }, TURNSTILE_TIMEOUT_MS);
};

const scrollToWidget = () => {
  requestAnimationFrame(() => {
    document
      .getElementById('turnstile-container')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
};

const renderWidget = () => {
  const turnstile = (window as any).turnstile;
  if (!turnstile || turnstileWidgetId.value !== null) return;

  if (!siteKey) {
    turnstileState.value = 'no-sitekey';
    return;
  }

  try {
    turnstileState.value = 'loading';
    turnstileWidgetId.value = turnstile.render('#turnstile-container', {
      sitekey: siteKey,
      theme: 'dark',
      size: 'flexible',
      appearance: 'always',
      retry: 'auto',
      'retry-interval': 3000,
      'refresh-expired': 'auto',
      callback: (token: string) => {
        clearWatchdog();
        turnstileToken.value = token;
        turnstileErrorCode.value = '';
        turnstileState.value = 'verified';
      },
      'error-callback': (code?: string) => {
        turnstileToken.value = '';
        turnstileErrorCode.value = String(code || 'unknown');
        turnstileState.value = 'error';
        isSubmitting.value = false;
        return true; // keep the widget mounted so the user can retry in place
      },
      'expired-callback': () => {
        turnstileToken.value = '';
        turnstileState.value = 'expired';
        resetWidget();
        startWatchdog();
      },
      'timeout-callback': () => {
        turnstileToken.value = '';
        turnstileErrorCode.value = 'timeout';
        turnstileState.value = 'error';
        resetWidget();
        startWatchdog();
      },
      'before-interactive-callback': () => {
        turnstileState.value = 'interactive';
        scrollToWidget();
      },
      'after-interactive-callback': () => {
        if (!turnstileToken.value) turnstileState.value = 'loading';
      },
      'unsupported-callback': () => {
        turnstileState.value = 'unsupported';
      },
    });
    startWatchdog();
  } catch (e) {
    console.error('Turnstile render error:', e);
    turnstileState.value = 'error';
    turnstileErrorCode.value = 'render-failed';
  }
};

const ensureTurnstile = () => {
  if (!siteKey) {
    turnstileState.value = 'no-sitekey';
    return;
  }

  if ((window as any).turnstile) {
    renderWidget();
    return;
  }

  turnstileState.value = 'loading';

  if (document.getElementById('turnstile-script')) {
    let attempts = 0;
    pollingInterval = setInterval(() => {
      attempts++;
      if ((window as any).turnstile) {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = null;
        renderWidget();
      } else if (attempts > 100) {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = null;
        turnstileState.value = 'script-failed';
      }
    }, 100);
    return;
  }

  (window as any).onTurnstileLoad = () => renderWidget();

  const script = document.createElement('script');
  script.id = 'turnstile-script';
  script.src =
    'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    turnstileState.value = 'script-failed';
  };
  document.head.appendChild(script);
};

const reloadTurnstile = () => {
  clearWatchdog();
  turnstileToken.value = '';
  turnstileErrorCode.value = '';

  const turnstile = (window as any).turnstile;
  if (turnstileWidgetId.value !== null && turnstile) {
    try { turnstile.remove(turnstileWidgetId.value); } catch { /* already gone */ }
  }
  turnstileWidgetId.value = null;
  turnstileState.value = 'loading';
  ensureTurnstile();
};

onMounted(() => {
  restoreDraft();
  loadProvinces();
  ensureTurnstile();
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
  if (draftTimer) clearTimeout(draftTimer);
  clearWatchdog();
  if ((window as any).onTurnstileLoad) delete (window as any).onTurnstileLoad;
  const turnstile = (window as any).turnstile;
  if (turnstileWidgetId.value !== null && turnstile) {
    try { turnstile.remove(turnstileWidgetId.value); } catch { /* already gone */ }
  }
});

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------
const submitBlockedReason = computed(() => {
  if (isSubmitting.value) return statusMessage.value;
  if (isCheckingNickname.value) return 'MENGECEK KETERSEDIAAN NICKNAME...';
  if (nicknameIsDuplicate.value) return 'NICKNAME SUDAH TERDAFTAR — GANTI NICKNAME';
  if (!formComplete.value) {
    return `LENGKAPI FORMULIR (${filledCount.value}/${totalFields})`;
  }
  switch (turnstileState.value) {
    case 'verified': return '';
    case 'interactive': return 'CENTANG VERIFIKASI CLOUDFLARE DI ATAS';
    case 'error': return 'VERIFIKASI GAGAL — MUAT ULANG DULU';
    case 'expired': return 'VERIFIKASI KEDALUWARSA — TUNGGU SEBENTAR';
    case 'script-failed': return 'VERIFIKASI TIDAK DAPAT DIMUAT';
    case 'no-sitekey': return import.meta.env.DEV ? '' : 'VERIFIKASI BELUM DIKONFIGURASI';
    case 'unsupported': return 'BROWSER TIDAK DIDUKUNG';
    default: return 'MENUNGGU VERIFIKASI KEAMANAN...';
  }
});

const canSubmit = computed(
  () =>
    !isSubmitting.value &&
    !isCheckingNickname.value &&
    !nicknameIsDuplicate.value &&
    formComplete.value &&
    (Boolean(turnstileToken.value) || !siteKey || import.meta.env.DEV)
);

const submitForm = async () => {
  Object.keys(form).forEach(markTouched);

  if (!canSubmit.value) {
    if (turnstileState.value === 'interactive') scrollToWidget();
    return;
  }

  isSubmitting.value = true;
  statusMessage.value = 'MENGIRIM DATA...';
  error.value = '';

  try {
    const payload = {
      ...props.biometricData,
      nama: form.nama.trim(),
      nickname: form.nickname.trim(),
      tanggalLahir: form.tanggalLahir,
      nomorWa: waNormalized.value,
      domisili: form.domisili.trim(),
      provinsi: wilayahNama.provinsi,
      kabupatenKota: wilayahNama.kabupaten,
      kecamatan: wilayahNama.kecamatan,
      kelurahanDesa: wilayahNama.desa,
      tester: normalizeTesterToCode(form.tester) || form.tester,
      divisi: form.divisi,
      usernameSosmed: form.usernameSosmed.trim().replace(/^@+/, ''),
      email: form.email.trim().toLowerCase(),
      quote: form.quote.trim(),
      face_image_path: props.biometricData?.faceImageUrl,
      avatar_image_path: avatarDataUri.value,
      avatar: avatarDataUri.value,
      avatarUrl: avatarDataUri.value,
      turnstileToken: turnstileToken.value || 'dev-bypass-token',
    };

    const resp = await axios.post('/.netlify/functions/submit-registration', payload, {
      timeout: 60000,
    });

    if (resp.data?.success) {
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      emit('submit', {
        ...payload,
        memberCode: resp.data.memberCode,
        uniqueCodeEdit: resp.data.uniqueCodeEdit || resp.data.unique_code_edit,
        unique_code_edit: resp.data.unique_code_edit || resp.data.uniqueCodeEdit,
        faceImageUrl: resp.data.faceImageUrl || props.biometricData?.faceImageUrl,
        avatarUrl: resp.data.avatarUrl || avatarPreviewUrl.value,
        avatar: resp.data.avatarUrl || avatarPreviewUrl.value,
        issuedAt: resp.data.issuedAt,
        emailSent: resp.data.emailSent,
        emailStatus: resp.data.emailStatus,
      });
      return;
    }

    throw new Error(resp.data?.message || 'Gagal mengirim data');
  } catch (e: any) {
    if (e.code === 'ECONNABORTED') {
      error.value = 'Server tidak merespon. Silakan coba lagi.';
    } else if (e.response?.status === 409) {
      error.value = e.response.data?.message || 'Data ini sudah terdaftar.';
    } else {
      error.value =
        e.response?.data?.message ||
        `Data gagal dikirim. Mohon periksa koneksi kamu dan coba lagi. (${e.message})`;
    }
  } finally {
    isSubmitting.value = false;
    // A Turnstile token is single-use; get a fresh one for the next attempt.
    resetWidget();
    if (turnstileState.value === 'verified') turnstileState.value = 'loading';
    startWatchdog();
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="text-center space-y-2">
      <h2 class="text-2xl md:text-3xl font-bold glitch-text font-orbitron">DATA MEMBER</h2>
      <p class="text-sm text-gray-400">Isi selengkap mungkin — data ini yang tercetak di E-Passport kamu.</p>
    </div>

    <!-- Progress -->
    <div class="space-y-2">
      <div class="flex justify-between text-xs">
        <span class="text-gray-400">Kelengkapan formulir</span>
        <span class="font-orbitron text-neon-blue">{{ filledCount }} dari {{ totalFields }} terisi</span>
      </div>
      <div class="h-2 rounded-full bg-gray-800 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{
            width: progressPercent + '%',
            backgroundImage: 'linear-gradient(90deg, #8A2BE2 0%, #00FFFF 100%)',
          }"
        ></div>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-5" novalidate>

      <!-- ============ SEGMENT 1: IDENTITAS ============ -->
      <fieldset class="rounded-2xl border border-neon-purple/40 bg-black/40 p-4 sm:p-5 space-y-4">
        <legend class="px-2 text-xs font-orbitron tracking-[0.2em] text-neon-purple">IDENTITAS</legend>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nama -->
          <div>
            <div class="ff-wrap">
              <User class="ff-icon" />
              <input
                id="f-nama" v-model="form.nama" type="text" placeholder=" " maxlength="40"
                autocomplete="name" class="ff-input" @blur="markTouched('nama')"
                :class="showError('nama') ? 'ff-invalid' : (isValid('nama') && form.nama ? 'ff-valid' : '')"
              />
              <label for="f-nama" class="ff-label">Nama</label>
            </div>
            <p v-if="showError('nama')" class="ff-error">{{ errors.nama }}</p>
          </div>

          <!-- Nickname -->
          <div>
            <div class="ff-wrap relative">
              <Gamepad2 class="ff-icon" />
              <input
                id="f-nickname" v-model="form.nickname" type="text" placeholder=" " maxlength="30"
                class="ff-input pr-10" @blur="markTouched('nickname')"
                :class="(showError('nickname') || nicknameIsDuplicate) ? 'ff-invalid' : (isValid('nickname') && form.nickname && nicknameCheckStatus === 'available' ? 'ff-valid' : '')"
              />
              <label for="f-nickname" class="ff-label">Nickname Ayodance</label>

              <!-- Loading spinner -->
              <span v-if="isCheckingNickname" class="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none">
                <RefreshCw class="w-3.5 h-3.5 animate-spin" />
              </span>
              <!-- Available checkmark -->
              <span v-else-if="nicknameCheckStatus === 'available' && form.nickname.trim().length >= 2 && !errors.nickname" class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
                <Check class="w-4 h-4" />
              </span>
              <!-- Duplicate alert -->
              <span v-else-if="nicknameIsDuplicate" class="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none">
                <AlertCircle class="w-4 h-4" />
              </span>
            </div>

            <!-- Small text below input -->
            <p v-if="nicknameIsDuplicate" class="ff-error flex items-center gap-1.5 mt-1 text-[11px] text-red-400 font-mono">
              <AlertCircle class="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{{ nicknameCheckMessage || 'Nickname ini sudah terdaftar. Silakan gunakan nickname lain.' }}</span>
            </p>
            <p v-else-if="showError('nickname')" class="ff-error">{{ errors.nickname }}</p>
            <p v-else-if="nicknameCheckStatus === 'available' && form.nickname.trim().length >= 2" class="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 mt-1">
              <Check class="w-3.5 h-3.5 text-emerald-400" />
              <span>Nickname tersedia</span>
            </p>
          </div>
        </div>

        <!-- Tanggal lahir -->
        <div>
          <div class="ff-wrap">
            <Calendar class="ff-icon" />
            <input
              id="f-lahir" v-model="form.tanggalLahir" type="date" class="ff-input ff-input-filled"
              @blur="markTouched('tanggalLahir')"
              :class="showError('tanggalLahir') ? 'ff-invalid' : (isValid('tanggalLahir') ? 'ff-valid' : '')"
            />
            <label for="f-lahir" class="ff-label ff-label-fixed">Tanggal Lahir</label>
          </div>
          <p v-if="showError('tanggalLahir')" class="ff-error">{{ errors.tanggalLahir }}</p>
        </div>
      </fieldset>

      <!-- ============ SEGMENT 2: KONTAK & LOKASI ============ -->
      <fieldset class="rounded-2xl border border-neon-blue/40 bg-black/40 p-4 sm:p-5 space-y-4">
        <legend class="px-2 text-xs font-orbitron tracking-[0.2em] text-neon-blue">KONTAK &amp; LOKASI</legend>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nomor WA -->
          <div>
            <div class="ff-wrap">
              <Phone class="ff-icon" />
              <input
                id="f-wa" :value="form.nomorWa" @input="onWaInput" type="text" placeholder=" "
                inputmode="numeric" autocomplete="tel" maxlength="15" class="ff-input"
                @blur="markTouched('nomorWa')"
                :class="showError('nomorWa') ? 'ff-invalid' : (isValid('nomorWa') ? 'ff-valid' : '')"
              />
              <label for="f-wa" class="ff-label">Nomor WhatsApp</label>
            </div>
            <p v-if="showError('nomorWa')" class="ff-error">{{ errors.nomorWa }}</p>
            <p v-else-if="waNormalized" class="mt-1 text-[11px] text-gray-500">
              Tersimpan sebagai <span class="font-mono text-neon-blue">{{ waNormalized }}</span>
            </p>
          </div>

          <!-- Email -->
          <div>
            <div class="ff-wrap">
              <Mail class="ff-icon" />
              <input
                id="f-email" v-model="form.email" type="email" placeholder=" " maxlength="254"
                autocomplete="email" inputmode="email" class="ff-input" @blur="markTouched('email')"
                :class="showError('email') ? 'ff-invalid' : (isValid('email') && form.email ? 'ff-valid' : '')"
              />
              <label for="f-email" class="ff-label">Email</label>
            </div>
            <p v-if="showError('email')" class="ff-error">{{ errors.email }}</p>
            <p v-else class="mt-1 text-[11px] text-gray-500">E-Passport dikirim ke alamat ini.</p>
          </div>
        </div>

        <!-- Cascading Wilayah Domisili (4 Tingkat) -->
        <div class="space-y-3 pt-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-orbitron tracking-wider text-neon-blue flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5" /> DOMISILI (WILAYAH TEMPAT TINGGAL)
            </span>
            <span v-if="loadingWilayah.provinsi || loadingWilayah.kabupaten || loadingWilayah.kecamatan || loadingWilayah.desa" class="text-[10px] text-cyan-400 animate-pulse flex items-center gap-1 font-mono">
              <RefreshCw class="w-3 h-3 animate-spin" /> Memuat data wilayah...
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- 1. Provinsi -->
            <div>
              <SearchableSelect
                v-model="selectedProvinsi"
                :options="provinsiList"
                label="Provinsi"
                placeholder="-- Cari & Pilih Provinsi --"
                :icon="MapPin"
                :loading="loadingWilayah.provinsi"
                :invalid="Boolean(showError('domisili') && !selectedProvinsi)"
                :valid="Boolean(selectedProvinsi)"
                @change="onProvinsiChange"
              />
            </div>

            <!-- 2. Kabupaten / Kota -->
            <div>
              <SearchableSelect
                v-model="selectedKabupaten"
                :options="kabupatenList"
                label="Kabupaten / Kota"
                placeholder="-- Cari & Pilih Kab / Kota --"
                :icon="MapPin"
                :disabled="!selectedProvinsi"
                :loading="loadingWilayah.kabupaten"
                :invalid="Boolean(showError('domisili') && !selectedKabupaten)"
                :valid="Boolean(selectedKabupaten)"
                @change="onKabupatenChange"
              />
            </div>

            <!-- 3. Kecamatan -->
            <div>
              <SearchableSelect
                v-model="selectedKecamatan"
                :options="kecamatanList"
                label="Kecamatan"
                placeholder="-- Cari & Pilih Kecamatan --"
                :icon="MapPin"
                :disabled="!selectedKabupaten"
                :loading="loadingWilayah.kecamatan"
                :valid="Boolean(selectedKecamatan)"
                @change="onKecamatanChange"
              />
            </div>

            <!-- 4. Kelurahan / Desa -->
            <div>
              <SearchableSelect
                v-model="selectedDesa"
                :options="desaList"
                label="Kelurahan / Desa"
                placeholder="-- Cari & Pilih Kelurahan/Desa --"
                :icon="MapPin"
                :disabled="!selectedKecamatan"
                :loading="loadingWilayah.desa"
                :valid="Boolean(selectedDesa)"
                @change="onDesaChange"
              />
            </div>
          </div>

          <!-- Preview Domisili Terformat -->
          <div v-if="form.domisili" class="p-2.5 rounded-xl border border-neon-blue/30 bg-black/60 flex items-start gap-2 shadow-[0_0_15px_rgba(0,255,255,0.08)]">
            <span class="text-neon-blue text-xs mt-0.5">📍</span>
            <div class="min-w-0 flex-1">
              <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Domisili Terformat</div>
              <div class="text-xs text-cyan-200 font-mono break-words font-semibold">{{ form.domisili }}</div>
            </div>
          </div>

          <p v-if="showError('domisili')" class="ff-error">{{ errors.domisili }}</p>
        </div>
      </fieldset>

      <!-- ============ SEGMENT 3: KOMUNITAS ============ -->
      <fieldset class="rounded-2xl border border-neon-pink/40 bg-black/40 p-4 sm:p-5 space-y-4">
        <legend class="px-2 text-xs font-orbitron tracking-[0.2em] text-neon-pink">KOMUNITAS</legend>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Divisi -->
          <div>
            <SearchableSelect
              v-model="form.divisi"
              :options="[{ id: 'CLUB', name: 'CLUB' }, { id: 'COM', name: 'COM' }]"
              label="Divisi"
              placeholder="-- Pilih Divisi --"
              :icon="Users"
              :invalid="Boolean(showError('divisi'))"
              :valid="Boolean(isValid('divisi') && form.divisi)"
              @change="markTouched('divisi')"
            />
            <p v-if="showError('divisi')" class="ff-error">{{ errors.divisi }}</p>
          </div>

          <!-- Tester -->
          <div>
            <SearchableSelect
              v-model="form.tester"
              :options="testerOptions"
              label="Tester"
              placeholder="-- Cari & Pilih Tester --"
              :icon="UserCheck"
              :invalid="Boolean(showError('tester'))"
              :valid="Boolean(isValid('tester') && form.tester)"
              @change="markTouched('tester')"
            />
            <p v-if="showError('tester')" class="ff-error">{{ errors.tester }}</p>
          </div>
        </div>

        <!-- Username sosmed -->
        <div>
          <div class="ff-wrap">
            <AtSign class="ff-icon" />
            <input
              id="f-username" v-model="form.usernameSosmed" type="text" placeholder=" " maxlength="40"
              class="ff-input" @blur="markTouched('usernameSosmed')"
              :class="showError('usernameSosmed') ? 'ff-invalid' : (isValid('usernameSosmed') && form.usernameSosmed ? 'ff-valid' : '')"
            />
            <label for="f-username" class="ff-label">Username Facebook / Instagram</label>
          </div>
          <p v-if="showError('usernameSosmed')" class="ff-error">{{ errors.usernameSosmed }}</p>
        </div>

        <!-- Quote -->
        <div>
          <div class="ff-wrap">
            <QuoteIcon class="ff-icon ff-icon-top" />
            <textarea
              id="f-quote" v-model="form.quote" placeholder=" " rows="3" :maxlength="QUOTE_MAX"
              class="ff-input resize-none pt-6" @blur="markTouched('quote')"
              :class="showError('quote') ? 'ff-invalid' : (isValid('quote') && form.quote ? 'ff-valid' : '')"
            ></textarea>
            <label for="f-quote" class="ff-label">Quote Kamu</label>
          </div>
          <div class="mt-1 flex justify-between text-[11px]">
            <span :class="showError('quote') ? 'text-red-400' : 'text-gray-500'">
              {{ showError('quote') ? errors.quote : 'Tampil di E-Passport kamu.' }}
            </span>
            <span :class="form.quote.length >= QUOTE_MAX ? 'text-neon-pink' : 'text-gray-500'">
              {{ form.quote.length }}/{{ QUOTE_MAX }}
            </span>
          </div>
        </div>
      </fieldset>

      <!-- ============ FOTO PROFIL MEMBER (FOTO 2) ============ -->
      <fieldset class="space-y-4 rounded-2xl border border-neon-blue/30 bg-black/40 p-4 md:p-6 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
        <legend class="px-2 font-orbitron text-xs font-bold tracking-widest text-neon-blue uppercase flex items-center gap-2">
          <Camera class="w-4 h-4 text-neon-blue" />
          FOTO PROFIL MEMBER (WAJIB)
        </legend>

        <p class="text-xs text-gray-400 leading-relaxed">
          Unggah foto profil kamu untuk ditampilkan di halaman member resmi &amp; E-Passport. 
          <span class="text-cyan-300 font-semibold">Foto 1 (scan biometrik sistem sebelumnya) otomatis tersimpan aman untuk verifikasi keaslian akun internal.</span>
        </p>

        <!-- Hidden input file -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onAvatarFileChange"
        />

        <!-- Uploaded Preview -->
        <div v-if="avatarPreviewUrl" class="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20">
          <div class="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-neon-blue shadow-[0_0_12px_rgba(0,255,255,0.3)] shrink-0">
            <img :src="avatarPreviewUrl" alt="Preview Foto Profil" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 text-center sm:text-left space-y-1.5">
            <div class="flex items-center justify-center sm:justify-start gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-orbitron font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Check class="w-3 h-3 text-emerald-400" /> WEBP SIAP UNGGAH
              </span>
              <span v-if="avatarUploadSize" class="text-[11px] font-mono text-gray-400">
                {{ avatarUploadSize }}
              </span>
            </div>
            <p class="text-xs text-gray-300">
              Foto profil berhasil dikonversi ke format WebP terkompresi optimal.
            </p>
            <div class="pt-1 flex justify-center sm:justify-start gap-2">
              <button
                type="button"
                @click="triggerFileInput"
                class="px-3 py-1.5 rounded-lg border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-orbitron transition cursor-pointer flex items-center gap-1.5"
              >
                <Camera class="w-3.5 h-3.5" /> Ganti Foto
              </button>
              <button
                type="button"
                @click="removeAvatar"
                class="px-3 py-1.5 rounded-lg border border-red-500/40 hover:border-red-400 text-red-400 hover:text-white text-xs font-orbitron transition cursor-pointer flex items-center gap-1.5"
              >
                <X class="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State / Click to Upload Box -->
        <div
          v-else
          @click="triggerFileInput"
          class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group hover:border-neon-blue hover:bg-neon-blue/5"
          :class="errors.avatar && touched['avatar'] ? 'border-red-500/60 bg-red-950/10' : 'border-gray-700 bg-black/50'"
        >
          <div class="w-12 h-12 rounded-full border border-gray-700 group-hover:border-neon-blue flex items-center justify-center mx-auto mb-3 transition-colors bg-gray-900/60">
            <Upload class="w-6 h-6 text-gray-400 group-hover:text-neon-blue transition-colors" />
          </div>
          <div class="font-orbitron font-bold text-sm text-gray-200 group-hover:text-neon-blue transition-colors mb-1">
            KLIK UNTUK MEMILIH FOTO PROFIL
          </div>
          <p class="text-xs text-gray-400">
            Maksimal 2 MB • Mendukung JPG, PNG, WEBP (Otomatis dikonversi ke WebP)
          </p>
        </div>

        <!-- Error Message -->
        <p v-if="avatarError" class="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-mono">
          <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ avatarError }}
        </p>
        <p v-else-if="errors.avatar && touched['avatar']" class="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-mono">
          <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ errors.avatar }}
        </p>
      </fieldset>

      <!-- ============ CLOUDFLARE TURNSTILE ============ -->
      <div class="rounded-2xl border border-gray-800 bg-black/40 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CloudflareBadge :size="18" />
            <span class="text-xs font-orbitron tracking-widest text-gray-300">VERIFIKASI KEAMANAN</span>
          </div>
          <span
            v-if="turnstileState === 'verified'"
            class="flex items-center gap-1 text-[11px] font-semibold text-green-400"
          >
            <ShieldCheck class="w-3.5 h-3.5" /> TERVERIFIKASI
          </span>
        </div>

        <!-- The widget itself: visible, inline, and clickable. -->
        <div id="turnstile-container" class="flex justify-center items-center min-h-[70px] my-4"></div>

        <!-- Loading -->
        <div
          v-if="turnstileState === 'loading' || turnstileState === 'idle'"
          class="flex items-center justify-center gap-2 text-xs text-gray-400"
        >
          <span class="w-3 h-3 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></span>
          Memuat verifikasi keamanan...
        </div>

        <!-- Needs a manual click -->
        <div
          v-else-if="turnstileState === 'interactive'"
          class="flex items-start gap-3 rounded-lg border border-orange-500/60 bg-orange-500/10 p-3"
        >
          <CloudflareBadge :size="20" />
          <div class="text-xs text-orange-100 leading-relaxed">
            <div class="flex items-center gap-1.5 font-semibold text-orange-300 mb-1">
              <MousePointerClick class="w-3.5 h-3.5" /> Butuh klik manual
            </div>
            Cloudflare meminta verifikasi tambahan. Silakan centang kotak
            <strong>&ldquo;Verify you are human&rdquo;</strong> pada widget di atas untuk melanjutkan.
          </div>
        </div>

        <!-- Expired -->
        <div
          v-else-if="turnstileState === 'expired'"
          class="flex items-center gap-2 text-xs text-amber-300"
        >
          <CloudflareBadge :size="16" />
          Verifikasi kedaluwarsa. Widget sedang dimuat ulang otomatis...
        </div>

        <!-- Error -->
        <div
          v-else-if="turnstileState === 'error'"
          class="rounded-lg border border-red-500/60 bg-red-900/30 p-3 space-y-2"
        >
          <div class="flex items-start gap-3">
            <CloudflareBadge :size="20" />
            <div class="text-xs text-red-100 leading-relaxed">
              <div class="font-semibold text-red-300 mb-1">Verifikasi keamanan gagal</div>
              Cloudflare tidak dapat menyelesaikan verifikasi.
              <span v-if="turnstileErrorCode">
                Kode error: <span class="font-mono text-red-200">{{ turnstileErrorCode }}</span>.
              </span>
            </div>
          </div>
          <button
            type="button" @click="reloadTurnstile"
            class="flex items-center gap-2 text-xs font-semibold text-red-200 hover:text-white border border-red-500/60 rounded px-3 py-1.5 transition-colors"
          >
            <RefreshCw class="w-3.5 h-3.5" /> Muat Ulang Verifikasi
          </button>
        </div>

        <!-- Script blocked / failed to load -->
        <div
          v-else-if="turnstileState === 'script-failed'"
          class="rounded-lg border border-red-500/60 bg-red-900/30 p-3 space-y-2"
        >
          <div class="flex items-start gap-3">
            <CloudflareBadge :size="20" />
            <div class="text-xs text-red-100 leading-relaxed">
              <div class="font-semibold text-red-300 mb-1">Skrip verifikasi gagal dimuat</div>
              Skrip Cloudflare tidak dapat diunduh. Matikan sementara adblock/VPN,
              lalu muat ulang verifikasi.
            </div>
          </div>
          <button
            type="button" @click="reloadTurnstile"
            class="flex items-center gap-2 text-xs font-semibold text-red-200 hover:text-white border border-red-500/60 rounded px-3 py-1.5 transition-colors"
          >
            <RefreshCw class="w-3.5 h-3.5" /> Muat Ulang Verifikasi
          </button>
        </div>

        <!-- Site key not configured (Development bypass) -->
        <div
          v-else-if="turnstileState === 'no-sitekey'"
          class="flex items-center justify-between gap-3 rounded-lg border border-cyan-500/40 bg-cyan-950/30 p-3"
        >
          <div class="flex items-center gap-2 text-xs text-cyan-200">
            <CloudflareBadge :size="20" />
            <span>Mode Dev: Proteksi Cloudflare Turnstile otomatis dilewati (Development Mode).</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold text-[10px]">BYPASS DEV</span>
        </div>

        <!-- Unsupported browser -->
        <div
          v-else-if="turnstileState === 'unsupported'"
          class="flex items-start gap-3 rounded-lg border border-amber-500/60 bg-amber-500/10 p-3"
        >
          <CloudflareBadge :size="20" />
          <div class="text-xs text-amber-100 leading-relaxed">
            <div class="font-semibold text-amber-300 mb-1">Browser tidak didukung</div>
            Browser kamu tidak didukung Cloudflare Turnstile. Coba pakai Chrome, Edge,
            Firefox, atau Safari versi terbaru.
          </div>
        </div>
      </div>

      <p v-if="error" class="p-3 bg-red-900/40 border border-red-500/60 rounded-lg text-sm text-red-200">
        {{ error }}
      </p>

      <button type="submit" class="btn w-full" :disabled="!canSubmit">
        {{ canSubmit ? 'KIRIM DATA' : submitBlockedReason }}
      </button>
    </form>
  </div>
</template>

<style scoped>
/* Floating-label field. 16px on the control keeps iOS Safari from zooming in. */
.ff-wrap {
  position: relative;
  min-width: 0;
}

.ff-input {
  width: 100%;
  background-color: #000;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding-left: 2.75rem;
  padding-right: 1rem;
  padding-top: 1.25rem;
  padding-bottom: 0.5rem;
  color: #fff;
  transition: border-color 0.2s ease;
  outline: none;
  font-size: 16px;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.ff-input:focus {
  border-color: #00FFFF;
}

/* Some mobile browsers (notably Chrome/WebView on Android) lay out the native
   date-field internals wider than the input box itself, pushing the control
   past the container edge. Force those internals to respect the box. */
input[type="date"].ff-input::-webkit-datetime-edit,
input[type="date"].ff-input::-webkit-datetime-edit-fields-wrapper {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

input[type="date"].ff-input::-webkit-clear-button,
input[type="date"].ff-input::-webkit-inner-spin-button {
  display: none;
  margin: 0;
}

input[type="date"].ff-input::-webkit-calendar-picker-indicator {
  margin-left: 2px;
}

.ff-label {
  position: absolute;
  left: 2.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 16px;
}

.ff-input:focus ~ .ff-label,
.ff-input:not(:placeholder-shown) ~ .ff-label,
.ff-label-fixed {
  top: 0.5rem;
  transform: translateY(0);
  color: #00FFFF;
  font-size: 11px;
}

/* Date and select controls always render a value, so their label stays raised. */
.ff-input-filled {
  color-scheme: dark;
}

.ff-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
  pointer-events: none;
  z-index: 10;
}

.ff-icon-top {
  top: 1.25rem;
  transform: translateY(0);
}

/* The icon precedes the input, so this has to key off the wrapper. */
.ff-wrap:focus-within .ff-icon {
  color: #00FFFF;
}

.ff-valid {
  border-color: rgba(22, 163, 74, 0.7);
}

.ff-invalid {
  border-color: rgba(239, 68, 68, 0.8);
}

.ff-error {
  margin-top: 0.25rem;
  font-size: 11px;
  color: #f87171;
}

textarea.ff-input ~ .ff-label {
  top: 0.75rem;
  transform: translateY(0);
}

textarea.ff-input:focus ~ .ff-label,
textarea.ff-input:not(:placeholder-shown) ~ .ff-label {
  top: 0.5rem;
  font-size: 11px;
}
</style>
