<template>
  <HomePasswordGate v-if="!isUnlocked" @unlock="onUnlock" />

  <div v-else class="min-h-screen bg-[#07090e] text-gray-200">
    <div class="marquee-container">
      <p class="marquee-text">Welcome To XFIVE Community AyoDance | Community Stay at Love-01</p>
    </div>

    <div class="container mx-auto px-4 py-8 relative z-10 space-y-16">
      <HomeHeroSection
        :total-members-count="totalMembersCount"
        @open-tester="openTesterModal = true"
      />

      <HomeStaffCarousel
        :staff-list="staffList"
        :loading="loadingStaff"
      />

      <HomeSearchCta />

      <HomeMeetupSlider
        :photos="latestMeetupPhotos"
        :loading="loadingMeetups"
        @open-lightbox="openLightbox"
      />
    </div>

    <HomeContactModal
      :show="openTesterModal"
      :testers="testers"
      @close="openTesterModal = false"
    />

    <HomeLightboxModal
      :photo="lightboxPhoto"
      @close="lightboxPhoto = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAutoSync } from '../composables/useDataSync';
import { useSeo } from '../composables/useSeo';
import HomePasswordGate from '../components/home/HomePasswordGate.vue';
import HomeHeroSection from '../components/home/HomeHeroSection.vue';
import HomeStaffCarousel from '../components/home/HomeStaffCarousel.vue';
import HomeSearchCta from '../components/home/HomeSearchCta.vue';
import HomeMeetupSlider from '../components/home/HomeMeetupSlider.vue';
import HomeContactModal from '../components/home/HomeContactModal.vue';
import HomeLightboxModal from '../components/home/HomeLightboxModal.vue';

const router = useRouter();
const route = useRoute();
const { updateSeo } = useSeo();

const isUnlocked = ref(
  Boolean(
    typeof window !== 'undefined' && (
      sessionStorage.getItem('xfive_site_unlocked') === 'true' ||
      localStorage.getItem('xfive_site_unlocked') === 'true'
    )
  )
);

const onUnlock = () => {
  isUnlocked.value = true;
  fetchDewanStaff();
  fetchGalleryMeetup();

  const targetRedirect = route.query.redirect;
  if (targetRedirect && typeof targetRedirect === 'string' && targetRedirect !== '/' && targetRedirect !== '/home') {
    router.push(targetRedirect);
  }
};

const totalMembersCount = ref(500);

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
const openTesterModal = ref(false);

const staffList = ref([]);
const loadingStaff = ref(true);

async function fetchDewanStaff() {
  loadingStaff.value = true;
  try {
    const res = await fetch('/api/v1/members?limit=1000');
    if (!res.ok) throw new Error('Failed to load members');
    const result = await res.json();
    const allMembers = result.data || result || [];
    totalMembersCount.value = allMembers.length;

    const staffTitles = ['owner community', 'leader community', 'staff community', 'vice leader community'];
    const filtered = allMembers.filter(m => {
      const t = (m.title || '').toLowerCase().trim();
      return staffTitles.some(st => t.includes(st) || st.includes(t));
    });

    filtered.sort((a, b) => {
      const score = (t) => {
        const s = (t || '').toLowerCase();
        if (s.includes('owner')) return 1;
        if (s.includes('vice')) return 3;
        if (s.includes('leader')) return 2;
        return 4;
      };
      return score(a.title) - score(b.title);
    });

    staffList.value = filtered;
  } catch (err) {
    console.error('Error fetching staff list:', err);
  } finally {
    loadingStaff.value = false;
  }
}

const galleryPhotos = ref([]);
const loadingMeetups = ref(true);
const lightboxPhoto = ref(null);

const latestMeetupPhotos = computed(() => {
  return galleryPhotos.value.slice(0, 5);
});

const openLightbox = (photo) => {
  lightboxPhoto.value = photo;
};

async function fetchGalleryMeetup() {
  loadingMeetups.value = true;
  try {
    const res = await fetch('/api/v1/gallery');
    if (!res.ok) throw new Error('Failed to load gallery');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      galleryPhotos.value = result.data;
    }
  } catch (err) {
    console.error('Error fetching gallery meetups:', err);
  } finally {
    loadingMeetups.value = false;
  }
}

useAutoSync('members', () => {
  if (isUnlocked.value) fetchDewanStaff();
});
useAutoSync('staff', () => {
  if (isUnlocked.value) fetchDewanStaff();
});
useAutoSync('gallery', () => {
  if (isUnlocked.value) fetchGalleryMeetup();
});

onMounted(() => {
  updateSeo({
    title: 'XFIVE AyoDance Community – Official Website & Member Database',
    description: 'Komunitas Resmi Audition AyoDance XFIVE Server Love-01. Portal resmi anggota, jadwal gathering & meetup nasional, dokumentasi kegiatan, dan pendaftaran anggota baru.',
    image: 'https://www.xfivephoto.com/img/xfive-squad-banner.webp',
    url: 'https://www.xfivephoto.com/',
    type: 'website'
  });

  if (isUnlocked.value) {
    fetchDewanStaff();
    fetchGalleryMeetup();
  }
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
