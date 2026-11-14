<template>
  <main class="container mx-auto px-4 py-8 relative z-10 min-h-screen">
    <div class="mb-6">
      <button
        @click="goBack"
        class="back-nav-btn inline-flex items-center gap-2 text-cyan-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors font-orbitron cursor-pointer bg-transparent border-none p-0"
      >
        <i class="fas fa-arrow-left"></i> Kembali ke Member List
      </button>
    </div>

    <div v-if="loading" class="text-center py-20">
      <i class="fas fa-circle-notch fa-spin text-4xl text-cyan-500"></i>
      <p class="mt-4 text-gray-400 font-orbitron">Loading profile...</p>
    </div>

    <div
      v-else-if="!member"
      class="text-center py-20 bg-[#0d1117]/80 border border-red-500/30 rounded-xl max-w-xl mx-auto p-8 shadow-2xl"
    >
      <i class="fas fa-user-slash text-6xl text-red-500/60 mb-4"></i>
      <h2 class="text-2xl font-bold text-white mb-2 font-orbitron">Member Tidak Ditemukan</h2>
      <p class="text-gray-400 mb-6">Profil member yang Anda cari tidak tersedia atau belum terdaftar.</p>
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest rounded transition-all font-orbitron cursor-pointer border-none"
      >
        <i class="fas fa-arrow-left"></i> Kembali ke Member List
      </button>
    </div>

    <article v-else class="member-detail max-w-6xl mx-auto">
      <div class="profile-shell grid grid-cols-1 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] gap-6 md:gap-10 rounded-2xl p-5 md:p-8">
        <MemberDetailHero
          :member="member"
          :avatar-src="avatarSrc"
          :certificate-count="certificateCount"
          :role-display="roleDisplay"
          @image-error="handleImageError"
        />

        <MemberDetailIdentity
          :member="member"
          :dob-info="dobInfo"
          :has-info-chips="hasInfoChips"
          :is-copied-nick="isCopiedNick"
          :is-copied-link="isCopiedLink"
          @copy-nickname="copyNickname"
          @copy-profile-link="copyProfileLink"
          @open-edit="isEditModalOpen = true"
          @open-ektp="openEktp"
          @share-profile="shareProfile"
        />
      </div>

      <MemberCertificates
        :certificates="paginatedCertificates"
        :total-count="validCertificates.length"
        :current-page="certPage"
        :total-pages="totalCertPages"
        :start-index="certStartIndex"
        @page-change="certPage = $event"
      />
    </article>

    <MemberEditProfileModal
      :show="isEditModalOpen"
      :member="member"
      @close="isEditModalOpen = false"
      @updated="handleProfileUpdated"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAutoSync } from '../composables/useDataSync';
import { useToast } from '../composables/useToast';
import { formatDob } from '../utils/date';
import MemberDetailHero from '../components/members/detail/MemberDetailHero.vue';
import MemberDetailIdentity from '../components/members/detail/MemberDetailIdentity.vue';
import MemberCertificates from '../components/members/detail/MemberCertificates.vue';
import MemberEditProfileModal from '../components/members/detail/MemberEditProfileModal.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const member = ref(null);
const allMembers = ref([]);

const certPage = ref(1);
const CERTS_PER_PAGE = 4;
const isEditModalOpen = ref(false);

function slugify(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function safeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}

const dobInfo = computed(() => member.value ? formatDob(member.value.dob) : null);

const hasInfoChips = computed(() => {
  if (!member.value) return false;
  return !!(dobInfo.value || member.value.domisili || (member.value.gender && member.value.gender !== '-') || member.value.category);
});

const avatarSrc = computed(() => {
  if (member.value && member.value.avatar && member.value.avatar.trim()) {
    return member.value.avatar.trim();
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(member.value?.name || '?')}&background=0d1117&color=00ffff&size=512&font-size=0.33`;
});

function handleImageError(e) {
  e.target.onerror = null;
  const label = member.value?.name || '?';
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=0d1117&color=00ffff&size=512&font-size=0.33`;
}

const certificateCount = computed(() => {
  if (!member.value || !Array.isArray(member.value.certificates)) return 0;
  return member.value.certificates.filter(c => safeUrl(c)).length;
});

const validCertificates = computed(() => {
  if (!member.value || !Array.isArray(member.value.certificates)) return [];
  return member.value.certificates.map(c => safeUrl(c)).filter(Boolean);
});

const totalCertPages = computed(() => Math.ceil(validCertificates.value.length / CERTS_PER_PAGE) || 1);
const certStartIndex = computed(() => (certPage.value - 1) * CERTS_PER_PAGE);

const paginatedCertificates = computed(() => {
  return validCertificates.value.slice(certStartIndex.value, certStartIndex.value + CERTS_PER_PAGE);
});

const roleDisplay = computed(() => {
  if (!member.value || !member.value.category) return '—';
  return member.value.category.split(' ')[0];
});

const isCopiedLink = ref(false);
const isCopiedNick = ref(false);

function copyText(text, label = 'Copied') {
  if (!text) return;

  const onSuccess = () => {
    toast.success(`${label} copied!`);
    if (label.toLowerCase().includes('link')) {
      isCopiedLink.value = true;
      setTimeout(() => { isCopiedLink.value = false; }, 2000);
    } else {
      isCopiedNick.value = true;
      setTimeout(() => { isCopiedNick.value = false; }, 2000);
    }
  };

  const fallbackCopy = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const success = document.execCommand('copy');
      document.body.removeChild(ta);
      if (success) {
        onSuccess();
        return true;
      }
    } catch (e) {
      console.warn('Fallback copy error:', e);
    }
    return false;
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(onSuccess)
      .catch(() => {
        if (!fallbackCopy()) {
          toast.error('Gagal menyalin teks');
        }
      });
  } else {
    if (!fallbackCopy()) {
      toast.error('Gagal menyalin teks');
    }
  }
}

function copyNickname() {
  if (member.value?.nickname) {
    copyText(member.value.nickname, 'Nickname');
  }
}

function copyProfileLink() {
  copyText(window.location.href, 'Profile link');
}

async function shareProfile() {
  if (!member.value) return;
  const shareData = {
    title: `${member.value.name} – XFIVE Community`,
    text: `Cek profil ${member.value.name} (${member.value.nickname}) di XFIVE Community`,
    url: window.location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      copyProfileLink();
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    copyProfileLink();
  }
}

function openEktp() {
  if (typeof window.openEktpCard === 'function' && member.value) {
    const payload = {
      ...member.value,
      avatar: avatarSrc.value || member.value.avatar
    };
    window.openEktpCard(payload);
  } else {
    toast.info('Modul E-KTP sedang dimuat...');
  }
}

function goBack() {
  const lastPage = sessionStorage.getItem('xfive_last_page');
  const pageNum = parseInt(lastPage || '1', 10);
  if (pageNum > 1) {
    router.push({ path: '/member-list', query: { page: pageNum } });
  } else {
    router.push('/member-list');
  }
}

function handleProfileUpdated(updatedData) {
  member.value = { ...member.value, ...updatedData };
  if (updatedData.slug && updatedData.slug !== route.params.slug) {
    router.replace(`/member/${updatedData.slug}`);
  }
}

async function fetchMemberData() {
  loading.value = true;
  certPage.value = 1;
  try {
    const res = await fetch('/.netlify/functions/get-members?limit=500');
    if (!res.ok) throw new Error('Failed to load member');
    const result = await res.json();
    const data = result.data || result || [];
    allMembers.value = data;

    const slug = (route.params.slug || '').toLowerCase();
    const found = data.find(m => {
      const s1 = slugify(m.nickname || '');
      const s2 = slugify(m.name || '');
      return s1 === slug || s2 === slug || (m.slug && m.slug.toLowerCase() === slug);
    });

    member.value = found || null;
    if (member.value) {
      document.title = `${member.value.name} – XFIVE Community`;
    }
  } catch (err) {
    console.error(err);
    member.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => route.params.slug, () => {
  fetchMemberData();
});

useAutoSync('members', fetchMemberData);

onMounted(() => {
  fetchMemberData();
});
</script>
