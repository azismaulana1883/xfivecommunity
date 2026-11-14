<template>
  <div class="min-h-screen bg-[#07090e] text-gray-200">
    <div class="marquee-container">
      <p class="marquee-text">Welcome To XFIVE Community AyoDance | Community Stay at Love-01</p>
    </div>

    <div class="container mx-auto px-4 py-8 relative z-10 min-h-screen">
      <div class="text-center mb-10 pt-4">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(0,255,255,0.15)]">
          <i class="fas fa-users"></i> Official Directory
        </div>
        <h1 class="text-3xl md:text-5xl font-bold font-orbitron text-white uppercase tracking-widest mb-3">
          Daftar Anggota <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">XFIVE</span>
        </h1>
        <div class="w-24 h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto rounded-full mb-4 shadow-[0_0_10px_rgba(0,255,255,0.5)]"></div>
        <p class="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          Database resmi seluruh anggota komunitas XFIVE AyoDance. Cari nickname, domisili, atau periksa keaslian status member resmi.
        </p>

        <div class="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <RouterLink
            to="/"
            class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-orbitron font-bold transition flex items-center gap-2 border border-white/10"
          >
            <i class="fas fa-arrow-left text-[11px]"></i>
            <span>Kembali ke Home</span>
          </RouterLink>
          <RouterLink
            to="/register"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-orbitron font-bold transition shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center gap-2"
          >
            <i class="fas fa-user-plus text-[11px]"></i>
            <span>Daftar Member X5</span>
          </RouterLink>
        </div>
      </div>

      <MemberRecruitmentBanner :testers="testers" />

      <MemberFilterToolbar
        :filtered-count="filteredMembers.length"
        :total-count="members.length"
        v-model:model-value-search="searchTerm"
        v-model:model-value-role="selectedRole"
        v-model:model-value-gender="selectedGender"
        v-model:model-value-domisili="domisiliFilter"
      />

      <MemberGrid
        :members="paginatedMembers"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="totalPages"
        :visible-pages="visiblePages"
        @page-change="goToPage"
      />

      <MemberFaqAccordion />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAutoSync } from '../composables/useDataSync';
import MemberRecruitmentBanner from '../components/members/list/MemberRecruitmentBanner.vue';
import MemberFilterToolbar from '../components/members/list/MemberFilterToolbar.vue';
import MemberGrid from '../components/members/list/MemberGrid.vue';
import MemberFaqAccordion from '../components/members/list/MemberFaqAccordion.vue';

const route = useRoute();
const router = useRouter();

const members = ref([]);
const loading = ref(true);

const searchTerm = ref('');
const selectedRole = ref('all');
const selectedGender = ref('all');
const domisiliFilter = ref('');

const itemsPerPage = 12;

const testers = [
  { name: "Dena", link: "https://wa.me/6285463191404", status: "online" },
  { name: "Zarah", link: "https://wa.me/62842320907", status: "online" },
  { name: "Wale", link: "https://wa.me/62124112588", status: "offline" },
  { name: "Iqbal", link: "https://wa.me/628331260740", status: "offline" },
  { name: "Inxu", link: "https://wa.me/6281213563525", status: "offline" },
  { name: "Vinsen", link: "https://wa.me/628121521656", status: "offline" },
  { name: "Tyas", link: "https://wa.me/62895345520016", status: "offline" },
  { name: "Dewi", link: "https://wa.me/6281431138785", status: "offline" }
];

async function fetchMembers() {
  loading.value = true;
  try {
    const res = await fetch('/api/v1/members?limit=1000');
    if (!res.ok) throw new Error('Failed to load members');
    const result = await res.json();
    members.value = result.data || result || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const filteredMembers = computed(() => {
  const query = searchTerm.value.toLowerCase().trim();
  const role = selectedRole.value;
  const gender = selectedGender.value;
  const dom = domisiliFilter.value.toLowerCase().trim();

  return members.value.filter(m => {
    const matchesSearch = !query ||
      (m.name && m.name.toLowerCase().includes(query)) ||
      (m.nickname && m.nickname.toLowerCase().includes(query));

    let matchesRole = true;
    if (role !== 'all') {
      if (role === 'Staff Community' || role === 'Leader Community' || role === 'Owner Community') {
        matchesRole = m.title === role;
      } else if (role === 'Member Community') {
        matchesRole = m.category === 'member';
      }
    }

    let matchesGender = true;
    if (gender !== 'all') {
      matchesGender = m.gender === gender;
    }

    let matchesDom = true;
    if (dom) {
      matchesDom = m.domisili && m.domisili.toLowerCase().includes(dom);
    }

    return matchesSearch && matchesRole && matchesGender && matchesDom;
  });
});

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage) || 1);

const currentPage = computed(() => {
  const p = parseInt(route.query.page, 10);
  if (p && p > 0) {
    return Math.min(p, totalPages.value);
  }
  return 1;
});

watch(currentPage, (p) => {
  try {
    sessionStorage.setItem('xfive_last_page', String(p || 1));
  } catch (e) {}
}, { immediate: true });

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredMembers.value.slice(start, start + itemsPerPage);
});

const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  let start = Math.max(1, current - 2);
  let end = Math.min(total, start + 4);

  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  router.push({
    query: page > 1 ? { ...route.query, page } : { ...route.query, page: undefined }
  });
  const target = document.getElementById('search-filter-section') || document.getElementById('profile-grid');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

watch([searchTerm, selectedRole, selectedGender, domisiliFilter], () => {
  if (route.query.page) {
    router.replace({
      query: { ...route.query, page: undefined }
    });
  }
});

useAutoSync('members', fetchMembers);

onMounted(() => {
  fetchMembers();
});
</script>

<style scoped>
.marquee-container {
  overflow: hidden;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  padding: 6px 0;
}

.marquee-text {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 25s linear infinite;
  color: #00ffff;
  font-family: monospace;
  font-size: 11px;
  letter-spacing: 1px;
}

@keyframes marquee {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-100%, 0); }
}
</style>
