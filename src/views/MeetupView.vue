<template>
  <div class="min-h-screen bg-[#070a10] text-gray-200 font-sans pb-20 selection:bg-cyan-500 selection:text-black">
    <MeetupHeader
      v-model:active-tab="activeTab"
      :active-meetup-count="activeMeetups.length"
      :warning-count="warningCount"
    />

    <main class="container mx-auto px-4 max-w-6xl mt-4">
      <div v-if="activeTab === 'events'" class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-white/5">
          <div>
            <h2 class="text-xl font-bold font-orbitron text-white">AGENDA MEETUP XFIVE</h2>
            <p class="text-xs text-gray-400">Jadwal dan status meetup per wilayah domisili</p>
          </div>

          <button
            @click="fetchMeetups"
            class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 text-xs font-mono flex items-center gap-2 transition cursor-pointer"
          >
            <i class="fas fa-sync-alt" :class="loadingMeetups ? 'fa-spin' : ''"></i>
            <span>Refresh Jadwal</span>
          </button>
        </div>

        <div v-if="loadingMeetups" class="text-center py-16 text-gray-500 font-mono">
          <i class="fas fa-spinner fa-spin text-cyan-400 text-2xl mb-3"></i>
          <p>Memuat agenda meetup...</p>
        </div>

        <div v-else-if="meetups.length === 0" class="text-center py-16 border border-dashed border-gray-800 rounded-2xl bg-black/40">
          <i class="fas fa-calendar-times text-gray-600 text-4xl mb-3"></i>
          <h3 class="text-base font-bold text-gray-300 font-orbitron">Belum Ada Agenda Meetup Aktif</h3>
          <p class="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Agenda meetup baru akan dijadwalkan oleh Dewan Staff / Admin. Pantau terus kanal pengumuman!
          </p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <MeetupUpcomingCard
            :upcoming-meetups="upcomingMeetups"
            :current-index="upcomingIndex"
            :is-paused="isUpcomingPaused"
            @prev="prevUpcoming"
            @next="nextUpcoming"
            @go-to="upcomingIndex = $event"
            @pause="isUpcomingPaused = true"
            @resume="isUpcomingPaused = false"
          />

          <MeetupPastCardStack
            :past-meetups="pastMeetups"
            :page-index="pastPageIndex"
            :is-paused="isPastPaused"
            @prev-page="prevPastPage"
            @next-page="nextPastPage"
            @go-to-page="pastPageIndex = $event"
            @pause="isPastPaused = true"
            @resume="isPastPaused = false"
          />
        </div>
      </div>

      <MeetupLeaderboardTab
        v-else-if="activeTab === 'points'"
        :points-list="pointsList"
        :loading="loadingPoints"
        :warning-count="warningCount"
      />

      <MeetupRulesTab v-else-if="activeTab === 'rules'" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAutoSync } from '../composables/useDataSync';
import MeetupHeader from '../components/meetup/MeetupHeader.vue';
import MeetupUpcomingCard from '../components/meetup/MeetupUpcomingCard.vue';
import MeetupPastCardStack from '../components/meetup/MeetupPastCardStack.vue';
import MeetupLeaderboardTab from '../components/meetup/MeetupLeaderboardTab.vue';
import MeetupRulesTab from '../components/meetup/MeetupRulesTab.vue';

const activeTab = ref('events');

const meetups = ref([]);
const loadingMeetups = ref(false);

const upcomingMeetups = computed(() => {
  return meetups.value.filter(m => m.status === 'ACTIVE' || m.status === 'UPCOMING');
});

const pastMeetups = computed(() => {
  return meetups.value.filter(m => m.status === 'COMPLETED' || m.status === 'CANCELLED');
});

const activeMeetups = computed(() => {
  return meetups.value.filter(m => m.status === 'ACTIVE');
});

const upcomingIndex = ref(0);
const isUpcomingPaused = ref(false);

const nextUpcoming = () => {
  if (upcomingMeetups.value.length <= 1) return;
  upcomingIndex.value = (upcomingIndex.value + 1) % upcomingMeetups.value.length;
};

const prevUpcoming = () => {
  if (upcomingMeetups.value.length <= 1) return;
  upcomingIndex.value = (upcomingIndex.value - 1 + upcomingMeetups.value.length) % upcomingMeetups.value.length;
};

const pastPageIndex = ref(0);
const isPastPaused = ref(false);
const pastPageSize = 2;

const totalPastPages = computed(() => {
  return Math.ceil(pastMeetups.value.length / pastPageSize) || 1;
});

const nextPastPage = () => {
  if (totalPastPages.value <= 1) return;
  pastPageIndex.value = (pastPageIndex.value + 1) % totalPastPages.value;
};

const prevPastPage = () => {
  if (totalPastPages.value <= 1) return;
  pastPageIndex.value = (pastPageIndex.value - 1 + totalPastPages.value) % totalPastPages.value;
};

let upcomingTimer = null;
let pastTimer = null;

const startAutoSliders = () => {
  stopAutoSliders();

  upcomingTimer = setInterval(() => {
    if (!isUpcomingPaused.value && upcomingMeetups.value.length > 1) {
      nextUpcoming();
    }
  }, 6000);

  pastTimer = setInterval(() => {
    if (!isPastPaused.value && totalPastPages.value > 1) {
      nextPastPage();
    }
  }, 7500);
};

const stopAutoSliders = () => {
  if (upcomingTimer) clearInterval(upcomingTimer);
  if (pastTimer) clearInterval(pastTimer);
  upcomingTimer = null;
  pastTimer = null;
};

const fetchMeetups = async () => {
  loadingMeetups.value = true;
  try {
    const res = await fetch('/api/v1/meetups');
    const data = await res.json();
    if (data.success) {
      meetups.value = data.data || [];
      if (upcomingIndex.value >= upcomingMeetups.value.length) {
        upcomingIndex.value = 0;
      }
      if (pastPageIndex.value >= totalPastPages.value) {
        pastPageIndex.value = 0;
      }
    }
  } catch (err) {
    console.error('Gagal mengambil jadwal meetup:', err);
  } finally {
    loadingMeetups.value = false;
  }
};

const pointsList = ref([]);
const loadingPoints = ref(false);

const warningCount = computed(() => {
  return pointsList.value.filter(p => p.warning_status === 'TEGURAN_1').length;
});

const fetchPoints = async () => {
  loadingPoints.value = true;
  try {
    const res = await fetch('/api/v1/meetups/points-summary');
    const data = await res.json();
    if (data.success) {
      pointsList.value = data.data || [];
    }
  } catch (err) {
    console.error('Gagal mengambil rekap poin:', err);
  } finally {
    loadingPoints.value = false;
  }
};

useAutoSync('meetups', () => {
  fetchMeetups();
  fetchPoints();
});

onMounted(() => {
  fetchMeetups();
  fetchPoints();
  startAutoSliders();
});

onUnmounted(() => {
  stopAutoSliders();
});
</script>
