<template>
  <div class="min-h-screen bg-[#070a10] text-gray-200 font-sans pb-24 selection:bg-cyan-500 selection:text-black">
    <!-- HERO HEADER -->
    <section class="relative pt-12 pb-8 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.06)_0%,transparent_70%)] pointer-events-none"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
          <i class="fas fa-balance-scale"></i>
          <span>XFIVE COMMUNITY OFFICIAL REGULATION</span>
        </div>

        <h1 class="text-3xl md:text-5xl font-black font-orbitron uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-pink-500 mb-3">
          RULES &amp; REGULATION
        </h1>
        <p class="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Pedoman resmi, tata tertib komunitas, ketentuan ujian Official Tester (OT), serta kebijakan perlindungan privasi seluruh anggota XFIVE Community.
        </p>

        <!-- NAVIGATION TABS -->
        <div class="flex flex-wrap justify-center gap-2.5 mt-8">
          <button
            @click="activeTab = 'community'"
            class="px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            :class="activeTab === 'community' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-black/60 border border-white/10 text-gray-400 hover:text-white'"
          >
            <i class="fas fa-scroll text-sm"></i>
            <span>COMMUNITY RULES</span>
          </button>

          <button
            @click="activeTab = 'ot'"
            class="px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            :class="activeTab === 'ot' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-black/60 border border-white/10 text-gray-400 hover:text-white'"
          >
            <i class="fas fa-gamepad text-sm"></i>
            <span>RULES OT (OFFICIAL TESTER)</span>
          </button>

          <button
            @click="activeTab = 'privacy'"
            class="px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            :class="activeTab === 'privacy' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-black/60 border border-white/10 text-gray-400 hover:text-white'"
          >
            <i class="fas fa-shield-alt text-sm"></i>
            <span>PRIVACY POLICY</span>
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN CONTENT -->
    <main class="container mx-auto px-4 max-w-5xl mt-4">
      <!-- ================================================================ -->
      <!-- TAB 1: RULES COMMUNITY -->
      <!-- ================================================================ -->
      <div v-if="activeTab === 'community'" class="space-y-6">
        <div class="rounded-2xl border border-cyan-500/30 bg-[#0c121e]/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div class="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl">
              <i class="fas fa-book-bookmark"></i>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black font-orbitron text-white">
                TATA TERTIB &amp; ANGGARAN DASAR XFIVE
              </h2>
              <p class="text-xs text-cyan-400 font-mono uppercase tracking-wider">Berlaku untuk seluruh divisi club &amp; member komunitas</p>
            </div>
          </div>

          <div class="space-y-6 text-sm text-gray-300 leading-relaxed">
            <div
              v-for="(chapter, cIdx) in communityRules"
              :key="cIdx"
              class="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3"
            >
              <h3 class="text-base font-bold font-orbitron text-cyan-300 flex items-center gap-2 border-b border-white/10 pb-2">
                <span>{{ chapter.title }}</span>
              </h3>
              <div class="space-y-4 pt-1">
                <div v-for="(item, iIdx) in chapter.items" :key="iIdx" class="space-y-1">
                  <h4 class="text-xs font-orbitron font-bold text-fuchsia-400 uppercase tracking-wider">
                    {{ item.subtitle }}
                  </h4>
                  <p class="text-xs text-gray-300 whitespace-pre-line leading-relaxed font-sans pl-2 border-l-2 border-cyan-500/30">
                    {{ item.content }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Warning Box -->
            <div class="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-3">
              <i class="fas fa-exclamation-triangle text-xl text-red-400 shrink-0"></i>
              <div>
                <div class="font-bold uppercase font-orbitron">Peringatan Keras:</div>
                <div>Pelanggaran terhadap aturan, terutama penggunaan program ilegal (cheat) dan pelecehan antar member, dapat menyebabkan pemecatan langsung dan sanksi Blacklist Permanen.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- TAB 2: RULES OT (OFFICIAL TESTER) -->
      <!-- ================================================================ -->
      <div v-else-if="activeTab === 'ot'" class="space-y-6">
        <div class="rounded-2xl border border-fuchsia-500/30 bg-[#0c121e]/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div class="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 text-xl">
              <i class="fas fa-gamepad"></i>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black font-orbitron text-white">
                RULES &amp; STANDAR UJIAN OFFICIAL TESTER (OT)
              </h2>
              <p class="text-xs text-fuchsia-400 font-mono uppercase tracking-wider">Ketentuan Pengujian Calon Anggota Baru XFIVE AyoDance</p>
            </div>
          </div>

          <div class="space-y-6 text-sm text-gray-300 leading-relaxed">
            <!-- Overview OT -->
            <div class="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <h3 class="text-base font-bold font-orbitron text-fuchsia-300 flex items-center gap-2">
                <span>🎯 1. TUJUAN &amp; ALUR PENGUJIAN OT</span>
              </h3>
              <p class="text-xs text-gray-300 leading-relaxed">
                Official Tester (OT) adalah staf penguji resmi yang ditunjuk oleh Dewan Pengurus XFIVE untuk memverifikasi kemampuan bermain, konsistensi ritme, dan kejujuran calon anggota sebelum resmi diterima masuk ke dalam squad/club XFIVE.
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-2">
                <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div class="text-cyan-400 font-bold mb-1">Tahap 1: Registrasi</div>
                  <div class="text-gray-400 text-[11px]">Mengisi formulir &amp; memilih jadwal tes bersama salah satu OT aktif.</div>
                </div>
                <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div class="text-fuchsia-400 font-bold mb-1">Tahap 2: Room Match</div>
                  <div class="text-gray-400 text-[11px]">Bermain bersama OT di server resmi Audition AyoDance Indonesia.</div>
                </div>
                <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div class="text-emerald-400 font-bold mb-1">Tahap 3: Verifikasi</div>
                  <div class="text-gray-400 text-[11px]">OT memberikan penilaian lulus/gagal dan menerbitkan sertifikat member.</div>
                </div>
              </div>
            </div>

            <!-- Standar Mode & BPM -->
            <div class="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <h3 class="text-base font-bold font-orbitron text-cyan-300 flex items-center gap-2">
                <span>⚡ 2. STANDAR MODE &amp; LAGU PENGUJIAN</span>
              </h3>
              <div class="space-y-2 text-xs font-mono">
                <div class="p-3 rounded-xl bg-black/60 border border-cyan-500/20 text-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span class="text-cyan-400 font-bold">Mode Club Dance / Normal 4 Direksi:</span>
                    <span class="text-gray-400 ml-2">Lagu BPM 120 – 140 (Minimal 3 Match)</span>
                  </div>
                  <span class="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-bold shrink-0">Wajib Lulus</span>
                </div>
                <div class="p-3 rounded-xl bg-black/60 border border-fuchsia-500/20 text-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span class="text-fuchsia-400 font-bold">Penilaian Timing Perfect &amp; Great:</span>
                    <span class="text-gray-400 ml-2">Konsistensi ketukan, akurasi space bar, dan minim bad/miss</span>
                  </div>
                  <span class="px-2.5 py-1 rounded bg-fuchsia-500/20 text-fuchsia-300 text-[10px] uppercase font-bold shrink-0">Skor Minimal 70%</span>
                </div>
                <div class="p-3 rounded-xl bg-black/60 border border-amber-500/20 text-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span class="text-amber-400 font-bold">Verifikasi Anti-Taskey &amp; Cheat:</span>
                    <span class="text-gray-400 ml-2">OT berhak meminta share screen / video keyboard jika terdapat kejanggalan</span>
                  </div>
                  <span class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold shrink-0">Integritas 100%</span>
                </div>
              </div>
            </div>

            <!-- Roster OT Resmi -->
            <div class="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold font-orbitron text-emerald-300 flex items-center gap-2">
                  <span>👑 3. DAFTAR OFFICIAL TESTER (OT) RESMI XFIVE</span>
                </h3>
                <span class="text-xs font-mono text-gray-500">{{ TESTER_ROSTER.length }} OT Aktif</span>
              </div>
              <p class="text-xs text-gray-400">
                Hanya hasil ujian dari roster OT resmi di bawah ini yang diakui sah oleh manajemen XFIVE:
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="t in TESTER_ROSTER"
                  :key="t.code"
                  class="p-3 rounded-xl bg-[#0d1424] border border-cyan-500/20 hover:border-cyan-400/50 transition flex items-center justify-between gap-2"
                >
                  <div>
                    <div class="font-bold text-white font-orbitron text-xs">{{ t.name }}</div>
                    <div class="text-[11px] font-mono text-cyan-400">{{ t.nickname }}</div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 border border-gray-700 text-gray-400">
                    {{ t.code }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- TAB 3: PRIVACY POLICY -->
      <!-- ================================================================ -->
      <div v-else-if="activeTab === 'privacy'" class="space-y-6">
        <div class="rounded-2xl border border-emerald-500/30 bg-[#0c121e]/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div class="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl">
              <i class="fas fa-user-shield"></i>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black font-orbitron text-white">
                KEBIJAKAN PRIVASI &amp; PERLINDUNGAN DATA MEMBER
              </h2>
              <p class="text-xs text-emerald-400 font-mono uppercase tracking-wider">Komitmen Transparansi &amp; Keamanan Privasi XFIVE Community</p>
            </div>
          </div>

          <div class="space-y-5 text-sm text-gray-300 leading-relaxed">
            <div class="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <h3 class="text-base font-bold font-orbitron text-emerald-300 flex items-center gap-2">
                <span>🔒 1. KOMITMEN UTAMA PERLINDUNGAN PRIVASI</span>
              </h3>
              <p class="text-xs text-gray-300 leading-relaxed">
                Komunitas XFIVE menjamin bahwa privasi dan keamanan data anggota adalah prioritas tertinggi kami. Semua data yang diserahkan saat pendaftaran maupun aktivitas komunitas diperlakukan dengan standar keamanan ketat.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div class="font-bold text-white font-orbitron text-sm flex items-center gap-2 text-cyan-400">
                  <i class="fas fa-camera"></i>
                  <span>Verifikasi Biometrik &amp; Foto</span>
                </div>
                <p class="text-gray-400 leading-relaxed">
                  Foto selfie dan verifikasi wajah saat registrasi hanya digunakan untuk memverifikasi keaslian anggota, mencegah akun ganda (smurf), dan memastikan lingkungan komunitas bebas dari penipuan. Foto tidak pernah dibagikan atau dipublikasikan tanpa izin.
                </p>
              </div>

              <div class="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div class="font-bold text-white font-orbitron text-sm flex items-center gap-2 text-fuchsia-400">
                  <i class="fas fa-ban"></i>
                  <span>Tidak Ada Penjualan Data</span>
                </div>
                <p class="text-gray-400 leading-relaxed">
                  XFIVE sama sekali tidak pernah dan tidak akan pernah menjual, menyewakan, atau memberikan data pribadi anggota (nomor WhatsApp, email, media sosial, atau identitas) kepada pihak ketiga atau pengiklan mana pun.
                </p>
              </div>

              <div class="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div class="font-bold text-white font-orbitron text-sm flex items-center gap-2 text-emerald-400">
                  <i class="fas fa-location-dot"></i>
                  <span>Data Lokasi GPS Meetup</span>
                </div>
                <p class="text-gray-400 leading-relaxed">
                  Data koordinat GPS yang diakses pada saat presensi Meetup hanya digunakan seketika untuk menghitung jarak radius toleransi dengan lokasi venue cafe/gathering. Koordinat pelacakan langsung (live tracking) tidak disimpan secara permanen.
                </p>
              </div>

              <div class="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div class="font-bold text-white font-orbitron text-sm flex items-center gap-2 text-amber-400">
                  <i class="fas fa-shield-halved"></i>
                  <span>Proteksi Cloudflare &amp; Enkripsi</span>
                </div>
                <p class="text-gray-400 leading-relaxed">
                  Aplikasi dan database XFIVE dilindungi oleh lapisan firewall Cloudflare, token otentikasi JWT, dan enkripsi SSL untuk melindungi sistem dari serangan bot, kebocoran data, dan akses tanpa izin.
                </p>
              </div>
            </div>

            <!-- Contact Helpdesk -->
            <div class="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between flex-wrap gap-3">
              <div class="flex items-center gap-2.5">
                <i class="fas fa-headset text-cyan-400 text-lg"></i>
                <span>Ada pertanyaan seputar kebijakan privasi atau permohonan pembaruan data?</span>
              </div>
              <router-link
                to="/dewan-staff"
                class="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs transition cursor-pointer"
              >
                Hubungi Dewan Staff
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { TESTER_ROSTER } from '@/data/testers';

const route = useRoute();
const router = useRouter();

type TabType = 'community' | 'ot' | 'privacy';
const activeTab = ref<TabType>('community');

// Sync tab with query or route
const syncTabFromRoute = () => {
  const tabQuery = (route.query.tab as string)?.toLowerCase();
  if (tabQuery === 'ot') {
    activeTab.value = 'ot';
  } else if (tabQuery === 'privacy') {
    activeTab.value = 'privacy';
  } else {
    activeTab.value = 'community';
  }
};

watch(
  () => route.query.tab,
  () => {
    syncTabFromRoute();
  }
);

watch(activeTab, (newTab) => {
  if (route.query.tab !== newTab) {
    router.replace({ query: { ...route.query, tab: newTab } });
  }
});

onMounted(() => {
  syncTabFromRoute();
});

const communityRules = [
  {
    title: 'BAB I – KETENTUAN UMUM',
    items: [
      {
        subtitle: 'Pasal 1 – Tujuan Komunitas',
        content: '1. Komunitas XFIVE dibentuk sebagai wadah kebersamaan, bermain, dan bersosialisasi antar pemain AyoDance se-Indonesia.\n2. Tujuan utama adalah menciptakan lingkungan bermain yang nyaman, aman, suportif, dan solid.\n3. Komunitas XFIVE juga berperan sebagai wadah gathering (gath) berskala nasional dan regional.\n4. Semua anggota wajib membaca, memahami, dan mematuhi aturan sebelum beraktivitas di komunitas.'
      },
      {
        subtitle: 'Pasal 2 – Keanggotaan',
        content: '1. Anggota adalah setiap pemain AyoDance yang resmi terverifikasi bergabung dengan XFIVE.\n2. Anggota wajib menjaga nama baik komunitas serta berpartisipasi aktif dalam kegiatan.\n3. Khusus anggota divisi club, dilarang berpindah club tanpa izin tertulis dari pengurus.\n4. Batas maksimal nickname community adalah 3 (X5 | Luar | Luar).'
      }
    ]
  },
  {
    title: 'BAB II – IDENTITAS KOMUNITAS & NICKNAME',
    items: [
      {
        subtitle: 'Pasal 3 – Nama & Format Nick',
        content: '1. Nama resmi komunitas adalah XFIVE (X5).\n2. Anggota dianjurkan menggunakan title/nickname dengan identitas nickX5 sesuai ketentuan.\n3. Dilarang melepas identitas "X5" tanpa persetujuan Leader / Dewan Staff.'
      },
      {
        subtitle: 'Pasal 3A – Kewajiban Nickname di Semua Akun',
        content: '1. Setiap anggota WAJIB menggunakan nickname/identitas XFIVE pada:\n   • Akun utama (yang sering dipakai)\n   ATAU\n   • Akun second (yang sering dipakai)\n\n2. Apabila akun utama sedang GB/TOUR/EVENT, anggota WAJIB menginformasikan ke Staff terkait.\n\n3. SANKSI PELANGGARAN:\n   1) Peringatan Ringan 1x\n   2) Blacklist member selama 6 bulan (tidak dapat bergabung kembali selama masa sanksi berjalan).'
      }
    ]
  },
  {
    title: 'BAB III – TATA TERTIB & ETIKA',
    items: [
      {
        subtitle: 'Pasal 4 – Etika, Adab & Perilaku',
        content: '1. Anggota wajib menjunjung tinggi etika, adab, dan sopan santun dalam berkomunikasi.\n2. Dilarang keras melakukan diskriminasi atau berdiskusi mengenai SARA maupun politik.\n3. Dilarang menggunakan bahasa kasar, menghina, atau memprovokasi sesama anggota di grup komunitas.\n4. Dilarang membawa masalah personal ke ruang publik komunitas.\n5. Wajib menyapa sesama anggota dengan sapaan khas “X5!”.'
      },
      {
        subtitle: 'Pasal 5 – Konten & Media',
        content: '1. Dilarang mengirim konten pornografi, narkoba, judi online, atau kekerasan.\n2. Konten berupa edit, fanart, atau meme AyoDance diperbolehkan selama tidak melanggar etika.\n3. Dilarang menyebarkan nomor WhatsApp atau data pribadi anggota lain tanpa izin pemilik.'
      },
      {
        subtitle: 'Pasal 6 – Kewajiban Gathering & Meetup Regional',
        content: '1. Setiap anggota yang berdomisili di Jakarta, Tangerang, Bekasi, dan Bogor-Depok WAJIB menghadiri acara Meetup/Gathering di wilayah domisili masing-masing.\n2. Setiap kehadiran dihitung sebagai 1 poin kehadiran. Periode evaluasi dilakukan berkala 1 tahun.\n3. Ketidakhadiran tanpa konfirmasi di wilayah domisili sendiri akan mengurangi 1 poin (-1).\n4. Akumulasi -2 poin berakibat pada pemberian 1x Teguran Resmi oleh Vice Leader.'
      },
      {
        subtitle: 'Pasal 7 – Fair Play & Anti-Cheat',
        content: '1. DILARANG KERAS menggunakan program ilegal/cheat dalam bentuk apa pun (Taskey, ACV, Auto, dsb).\n2. Setiap anggota diwajibkan menjunjung tinggi kejujuran dan sportivitas.\n3. Pelanggaran terhadap aturan ini dikenakan sanksi mutlak berupa Blacklist Permanen.'
      }
    ]
  },
  {
    title: 'BAB IV – SANKSI & KETENTUAN PENUTUP',
    items: [
      {
        subtitle: 'Pasal 8 – Penanganan Pelanggaran',
        content: '1. Teguran lisan/tertulis untuk pelanggaran ringan.\n2. Surat Peringatan (SP) resmi maksimal 3 kali.\n3. Skorsing / Non-aktif sementara (1 minggu hingga 1 bulan).\n4. Blacklist Permanen untuk pelanggaran berat (cheat, penipuan, pencemaran nama baik komunitas).'
      }
    ]
  }
];
</script>
