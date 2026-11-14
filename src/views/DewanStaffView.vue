<template>
  <main class="container mx-auto px-4 md:px-6 pt-12 pb-24 relative z-10 min-h-screen">
    <div class="text-center mb-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase">
        <i class="fas fa-user-shield"></i> Struktur Komunitas
      </div>
      <h1 class="text-3xl md:text-4xl font-bold font-orbitron text-white uppercase tracking-widest mb-3">Dewan Staff</h1>
      <div class="w-24 h-1 bg-cyan-500 mx-auto rounded-full mb-4"></div>
      <p class="text-gray-400 max-w-2xl mx-auto">
        Daftar pengurus XFIVE Community berdasarkan jabatan. Hubungi staff yang kamu butuhkan melalui sosial media yang tertera.
      </p>
    </div>

    <div class="max-w-6xl mx-auto mb-10">
      <img
        src="/img/xfive-squad-banner.webp"
        alt="XFIVE Squad Banner"
        width="2000"
        height="637"
        class="block w-full h-auto"
        style="-webkit-mask-image:linear-gradient(to bottom,#000 70%,transparent 100%);mask-image:linear-gradient(to bottom,#000 70%,transparent 100%);"
        decoding="async"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-10 text-center text-cyan-400 font-bold tracking-widest animate-pulse">
      Memuat data staff...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-10 text-center text-red-500 font-bold border border-red-500/30 rounded-lg bg-red-500/10">
      Gagal memuat data staff.
    </div>

    <!-- Content Sections -->
    <div v-else-if="groupedStaff.length > 0" class="space-y-14">
      <section v-for="group in groupedStaff" :key="group.key">
        <div class="flex items-center gap-4 mb-6">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center border text-xl"
            :class="[group.color.bg, group.color.border, group.color.text]"
            :style="{ boxShadow: `0 0 20px ${group.color.glow}` }"
          >
            <i class="fas" :class="group.icon"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold font-orbitron uppercase tracking-widest" :class="group.color.text">
              {{ group.label }}
            </h2>
            <p class="text-gray-500 text-sm">{{ group.desc }}</p>
          </div>
          <span
            class="ml-auto text-xs font-bold px-3 py-1 rounded-full border"
            :class="[group.color.text, group.color.bg, group.color.border]"
          >
            {{ group.members.length }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="m in group.members"
            :key="m.slug || m.id || m.nickname"
            class="bg-[#0d1117]/80 backdrop-blur-md border rounded-xl p-5 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            :class="group.color.border"
          >
            <!-- Avatar -->
            <img
              v-if="m.avatar && m.avatar.trim()"
              :src="m.avatar"
              :alt="m.name || 'Staff'"
              class="w-20 h-20 rounded-full object-cover ring-2"
              :class="group.color.ring"
              loading="lazy"
              @error="e => e.target.style.display = 'none'"
            />
            <div
              v-else
              class="w-20 h-20 rounded-full flex items-center justify-center ring-2"
              :class="[group.color.bg, group.color.ring]"
            >
              <i class="fas fa-user text-2xl" :class="group.color.text"></i>
            </div>

            <!-- Name -->
            <h3 class="mt-4 text-lg font-bold text-white flex items-center">
              {{ m.name || '-' }}
              <i v-if="m.verified" class="fas fa-circle-check ml-1 text-sm" :class="group.color.text" title="Verified"></i>
            </h3>

            <!-- Nickname -->
            <p class="font-mono text-sm" :class="group.color.text">{{ m.nickname || '' }}</p>

            <!-- Domisili -->
            <p v-if="m.domisili" class="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <i class="fas fa-map-marker-alt"></i> {{ m.domisili }}
            </p>

            <!-- Social Links -->
            <div class="mt-4 pt-4 border-t border-white/5 w-full flex justify-center">
              <div v-if="m.instagram || m.facebook || m.twitter" class="flex items-center gap-2">
                <a
                  v-if="m.instagram"
                  :href="m.instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 hover:border-cyan-400 transition-colors"
                  title="Instagram"
                >
                  <i class="fab fa-instagram"></i>
                </a>
                <a
                  v-if="m.facebook"
                  :href="m.facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 hover:border-cyan-400 transition-colors"
                  title="Facebook"
                >
                  <i class="fab fa-facebook"></i>
                </a>
                <a
                  v-if="m.twitter"
                  :href="m.twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 hover:border-cyan-400 transition-colors"
                  title="Twitter / X"
                >
                  <i class="fab fa-x-twitter"></i>
                </a>
              </div>
              <span v-else class="text-xs text-gray-600 italic">Kontak belum tersedia</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Empty State -->
    <div v-else class="p-10 text-center text-gray-400 bg-[#0d1117]/60 rounded-xl border border-white/5">
      Belum ada data staff yang tersedia.
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAutoSync } from '../composables/useDataSync';

const loading = ref(true);
const error = ref(false);
const allMembers = ref([]);

const GROUPS = [
  { key: 'Owner Community', label: 'Owner', icon: 'fa-crown', colorKey: 'yellow', desc: 'Pemilik dan penanggung jawab tertinggi komunitas.' },
  { key: 'Leader Community', label: 'Leader', icon: 'fa-chess-king', colorKey: 'fuchsia', desc: 'Pemimpin yang mengarahkan jalannya komunitas.' },
  { key: 'Staff Community', label: 'Staff Community', icon: 'fa-user-shield', colorKey: 'cyan', desc: 'Tim pengurus yang siap membantu kebutuhan member.' }
];

const colorMap = {
  yellow: { text: 'text-yellow-400', border: 'border-yellow-500/40', ring: 'ring-yellow-500/40', bg: 'bg-yellow-500/10', glow: 'rgba(234,179,8,0.5)' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-500/40', ring: 'ring-fuchsia-500/40', bg: 'bg-fuchsia-500/10', glow: 'rgba(217,70,239,0.5)' },
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/40', ring: 'ring-cyan-500/40', bg: 'bg-cyan-500/10', glow: 'rgba(0,255,255,0.5)' }
};

const groupedStaff = computed(() => {
  return GROUPS.map(g => {
    const members = allMembers.value.filter(m => (m.title || '').toLowerCase() === g.key.toLowerCase());
    return {
      ...g,
      color: colorMap[g.colorKey],
      members
    };
  }).filter(g => g.members.length > 0);
});

async function fetchStaff() {
  loading.value = true;
  error.value = false;
  try {
    const res = await fetch('/.netlify/functions/get-members?limit=500');
    if (!res.ok) throw new Error('Failed to load');
    const result = await res.json();
    allMembers.value = result.data || result || [];
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

useAutoSync('members', fetchStaff);
useAutoSync('staff', fetchStaff);

onMounted(() => {
  fetchStaff();
});
</script>

