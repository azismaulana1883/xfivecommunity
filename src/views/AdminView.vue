<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAutoSync } from '@/composables/useDataSync';
import { useAdminAuth, type AdminTab } from '@/composables/admin/useAdminAuth';
import { useAdminMembers } from '@/composables/admin/useAdminMembers';
import { useAdminBlacklist } from '@/composables/admin/useAdminBlacklist';
import { useAdminFaq } from '@/composables/admin/useAdminFaq';
import { useAdminMeetups } from '@/composables/admin/useAdminMeetups';
import { useAdminGallery } from '@/composables/admin/useAdminGallery';
import { useAdminArticles } from '@/composables/admin/useAdminArticles';
import { useAdminStaff } from '@/composables/admin/useAdminStaff';
import { useAdminRegistrations } from '@/composables/admin/useAdminRegistrations';

import AdminLogin from '@/components/admin/layout/AdminLogin.vue';
import AdminHeader from '@/components/admin/layout/AdminHeader.vue';
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue';

import TabDashboard from '@/components/admin/tabs/TabDashboard.vue';
import TabMembers from '@/components/admin/tabs/TabMembers.vue';
import TabBlacklist from '@/components/admin/tabs/TabBlacklist.vue';
import TabFaq from '@/components/admin/tabs/TabFaq.vue';
import TabMeetup from '@/components/admin/tabs/TabMeetup.vue';
import TabGallery from '@/components/admin/tabs/TabGallery.vue';
import TabVerify from '@/components/admin/tabs/TabVerify.vue';
import TabArticles from '@/components/admin/tabs/TabArticles.vue';
import TabStaff from '@/components/admin/tabs/TabStaff.vue';
import TabRegistrations from '@/components/admin/tabs/TabRegistrations.vue';
import TabGacha from '@/components/admin/tabs/TabGacha.vue';
import ModalNicknameHistory from '@/components/admin/modals/ModalNicknameHistory.vue';

const route = useRoute();
const router = useRouter();

const {
  isLoggedIn,
  isCheckingAuth,
  currentUser,
  checkSession,
  logout,
  allowedTabs,
  canAccessRegistrations,
  canAccessStaff
} = useAdminAuth();

const { members, loadingMembers, fetchMembers } = useAdminMembers();
const { blacklistList, loadingBlacklist, fetchBlacklist, saveBlacklist, deleteBlacklist } = useAdminBlacklist();
const { faqsList, fetchFaqs } = useAdminFaq();
const { meetupsList, fetchMeetups } = useAdminMeetups();
const { galleryList, fetchGallery } = useAdminGallery();
const { articlesList, fetchArticlesAdmin } = useAdminArticles();
const { staffList, fetchStaff } = useAdminStaff();
const { registrationsList, fetchRegistrationsAdmin } = useAdminRegistrations();

const activeTab = ref<AdminTab>('dashboard');
const isMobileSidebarOpen = ref(false);
const syncDbLoading = ref(false);
const isHistoryModalOpen = ref(false);
const historyInitialMemberCode = ref('');

const getInitialSidebarCollapsed = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('xfive_admin_sidebar_collapsed');
    if (saved !== null) {
      return saved === 'true';
    }
    // Auto-compact on laptop resolution (< 1440px)
    return window.innerWidth < 1440;
  }
  return false;
};

const isSidebarCollapsed = ref(getInitialSidebarCollapsed());

const handleToggleSidebar = () => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
  } else {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    if (typeof window !== 'undefined') {
      localStorage.setItem('xfive_admin_sidebar_collapsed', String(isSidebarCollapsed.value));
    }
  }
};

watch(isSidebarCollapsed, (val) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('xfive_admin_sidebar_collapsed', String(val));
  }
});

const openHistoryModal = (memberCode = '') => {
  historyInitialMemberCode.value = memberCode;
  isHistoryModalOpen.value = true;
};

const counts = computed(() => ({
  members: members.value.length,
  blacklist: blacklistList.value.length,
  faqs: faqsList.value.length,
  meetups: meetupsList.value.length,
  gallery: galleryList.value.length,
  articles: articlesList.value.length,
  staff: staffList.value.length,
  registrations: registrationsList.value.length
}));

const activeTabLabel = computed(() => {
  switch (activeTab.value) {
    case 'dashboard': return 'Overview & Statistics';
    case 'members': return 'Database Records';
    case 'blacklist': return 'Blacklist & Outlist Management';
    case 'faq': return 'FAQ Database Management';
    case 'meetup': return 'Meet Up & Regional Attendance System';
    case 'gallery': return 'Gallery Meet Up & Dokumentasi';
    case 'verify': return 'Verifikasi Member Cepat';
    case 'articles': return 'XFIVE Articles & Media Management';
    case 'staff': return 'Dewan Staff & Hak Akses RBAC';
    case 'registrations': return 'Audit Pendaftaran & Biometrik';
    default: return 'Control Panel';
  }
});

const syncInitialData = async () => {
  await Promise.allSettled([
    fetchMembers(),
    fetchBlacklist(),
    fetchFaqs(),
    fetchMeetups(),
    fetchGallery(),
    fetchArticlesAdmin(),
  ]);

  if (canAccessStaff.value) {
    fetchStaff();
  }
  if (canAccessRegistrations.value) {
    fetchRegistrationsAdmin();
  }
};

const syncDb = async () => {
  syncDbLoading.value = true;
  await syncInitialData();
  syncDbLoading.value = false;
};

const handleLoginSuccess = async () => {
  await syncInitialData();
  applyRouteTab();
};

const handleSwitchTab = (tab: AdminTab) => {
  if (!allowedTabs.value.includes(tab)) return;
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
};

const handleSaveBlacklist = async (payload: any) => {
  const res = await saveBlacklist(payload);
  if (res.success) {
    await fetchMembers();
  }
  return res.success;
};

const handleDeleteBlacklist = async (id: number) => {
  const res = await deleteBlacklist(id);
  if (res.success) {
    await fetchMembers();
  }
  return res.success;
};

const applyRouteTab = () => {
  const qTab = (route.query.tab as string) || '';
  const validTabs: AdminTab[] = [
    'dashboard', 'members', 'blacklist', 'faq', 'meetup',
    'gallery', 'verify', 'articles', 'staff', 'registrations'
  ];

  if (qTab && validTabs.includes(qTab as AdminTab)) {
    if (allowedTabs.value.includes(qTab as AdminTab)) {
      activeTab.value = qTab as AdminTab;
      return;
    }
  }

  if (allowedTabs.value.length > 0 && !allowedTabs.value.includes(activeTab.value)) {
    activeTab.value = allowedTabs.value[0];
  }
};

watch(
  () => route.query.tab,
  () => {
    applyRouteTab();
  }
);

watch(
  () => allowedTabs.value,
  () => {
    applyRouteTab();
  }
);

useAutoSync('members', () => {
  if (isLoggedIn.value) fetchMembers();
});
useAutoSync('blacklist', () => {
  if (isLoggedIn.value) fetchBlacklist();
});
useAutoSync('meetups', () => {
  if (isLoggedIn.value) fetchMeetups();
});
useAutoSync('gallery', () => {
  if (isLoggedIn.value) fetchGallery();
});
useAutoSync('articles', () => {
  if (isLoggedIn.value) fetchArticlesAdmin();
});
useAutoSync('faqs', () => {
  if (isLoggedIn.value) fetchFaqs();
});
useAutoSync('staff', () => {
  if (isLoggedIn.value && canAccessStaff.value) fetchStaff();
});
useAutoSync('registrations', () => {
  if (isLoggedIn.value && canAccessRegistrations.value) fetchRegistrationsAdmin();
});

onMounted(async () => {
  await checkSession();
  if (isLoggedIn.value) {
    await syncInitialData();
    applyRouteTab();
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#070b12] text-gray-100 flex flex-col font-sans relative selection:bg-cyan-500 selection:text-black">
    <div
      v-if="isCheckingAuth"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b12]"
    >
      <div class="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(0,255,255,0.4)]"></div>
      <p class="font-orbitron font-bold text-xs tracking-widest text-cyan-400 uppercase animate-pulse">
        MEMERIKSA HAK AKSES PANEL...
      </p>
    </div>

    <AdminLogin
      v-else-if="!isLoggedIn"
      @success="handleLoginSuccess"
    />

    <div v-else class="min-h-screen bg-[#070b12] text-gray-100 flex flex-col font-sans relative">
      <!-- Fixed Sidebar on Left with Expanded/Collapsed Mode -->
      <AdminSidebar
        :active-tab="activeTab"
        v-model:is-open="isMobileSidebarOpen"
        v-model:is-collapsed="isSidebarCollapsed"
        :counts="counts"
        @switch-tab="handleSwitchTab"
        @open-history="openHistoryModal()"
        @logout="logout"
      />

      <!-- Content Area with Dynamic Padding Offset (Adapts to Laptop & Desktop) -->
      <div
        class="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        :class="isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'"
      >
        <!-- Universal Top Header with Hamburger Button, Title, and Actions -->
        <AdminHeader
          :active-tab="activeTab"
          :is-mobile-sidebar-open="isMobileSidebarOpen"
          :is-sidebar-collapsed="isSidebarCollapsed"
          :is-loading="syncDbLoading"
          :username="currentUser.username || 'Staff'"
          @toggle-sidebar="handleToggleSidebar"
          @sync-data="syncDb"
          @logout="logout"
        />

        <!-- Main Tab Content Area -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <TabDashboard
            v-if="activeTab === 'dashboard'"
            :members="members"
            :blacklist-list="blacklistList"
          />

        <TabMembers
          v-else-if="activeTab === 'members'"
          :members="members"
          :loading-members="loadingMembers"
          @refresh="fetchMembers"
        />

        <TabBlacklist
          v-else-if="activeTab === 'blacklist'"
          :blacklist-list="blacklistList"
          :loading-blacklist="loadingBlacklist"
          :members="members"
          @save-blacklist="handleSaveBlacklist"
          @delete-blacklist="handleDeleteBlacklist"
        />

        <TabFaq
          v-else-if="activeTab === 'faq'"
        />

        <TabMeetup
          v-else-if="activeTab === 'meetup'"
        />

        <TabGallery
          v-else-if="activeTab === 'gallery'"
          :meetups-list="meetupsList"
        />

        <TabVerify
          v-else-if="activeTab === 'verify'"
          :members="members"
          :blacklist-list="blacklistList"
        />

        <TabArticles
          v-else-if="activeTab === 'articles'"
        />

        <TabStaff
          v-else-if="activeTab === 'staff' && canAccessStaff"
          :members="members"
          @staff-changed="fetchMembers"
        />

        <TabRegistrations
          v-else-if="activeTab === 'registrations' && canAccessRegistrations"
        />

        <TabGacha
          v-else-if="activeTab === 'gacha'"
        />
      </main>
      </div>

      <ModalNicknameHistory
        v-if="isHistoryModalOpen"
        :initial-member-code="historyInitialMemberCode"
        @close="isHistoryModalOpen = false"
      />
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
