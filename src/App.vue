<template>
  <div class="min-h-screen flex flex-col bg-[#0d1117] text-gray-200 selection:bg-cyan-500 selection:text-black">
    <Navbar v-if="!isPortalPage && !isAdminPage && !isAiPage" />
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
    <Footer v-if="!isPortalPage && !isAdminPage && !isAiPage" />
    <CyberToast />
    <CyberConfirmModal />
    <BackToTop v-if="!isPortalPage && !isAdminPage && !isAiPage" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import CyberToast from './components/CyberToast.vue';
import CyberConfirmModal from './components/CyberConfirmModal.vue';
import BackToTop from './components/BackToTop.vue';

const route = useRoute();
const isPortalPage = computed(() => route.path === '/portal');
const isAdminPage = computed(() => route.path.startsWith('/admin') || route.path.startsWith('/panel'));
const isAiPage = computed(() => route.path === '/ai');
</script>

