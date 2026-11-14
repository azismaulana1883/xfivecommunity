<script setup lang="ts">
import { computed } from 'vue';
import { Menu, RefreshCw, LogOut } from 'lucide-vue-next';
import { type AdminTab } from '@/composables/admin/useAdminAuth';

const props = withDefaults(
  defineProps<{
    activeTab: AdminTab;
    isMobileSidebarOpen?: boolean;
    isSidebarCollapsed?: boolean;
    isLoading?: boolean;
    username?: string;
  }>(),
  {
    isMobileSidebarOpen: false,
    isSidebarCollapsed: false,
    isLoading: false,
    username: 'Staff'
  }
);

const emit = defineEmits<{
  (e: 'toggleSidebar'): void;
  (e: 'syncData'): void;
  (e: 'logout'): void;
}>();

const activeTabLabel = computed(() => {
  switch (props.activeTab) {
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
    case 'gacha': return 'Gacha Reward & Point System';
    default: return 'Control Panel';
  }
});
</script>

<template>
  <header class="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between select-none shadow-md">
    <div class="flex items-center gap-3 min-w-0">
      <!-- Universal Hamburger Button (Desktop, Laptop, & Mobile) -->
      <button
        type="button"
        @click="emit('toggleSidebar')"
        class="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition cursor-pointer shadow-[0_0_10px_rgba(0,255,255,0.1)] flex items-center justify-center shrink-0"
        :title="isSidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'"
        aria-label="Toggle Sidebar Admin"
      >
        <Menu class="w-5 h-5" />
      </button>

      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.6)] shrink-0"></span>
          <h1 class="text-sm sm:text-base lg:text-lg font-black font-orbitron text-white tracking-wider uppercase truncate">
            {{ activeTabLabel }}
          </h1>
        </div>
        <p class="text-[10px] sm:text-xs text-gray-400 font-mono mt-0.5 hidden sm:block truncate">
          Panel Pengelolaan XFIVE Komunitas Resmi — Halo, @{{ username }}
        </p>
      </div>
    </div>

    <!-- Right Header Actions (Sync DB & Logout) -->
    <div class="flex items-center gap-2 shrink-0">
      <button
        type="button"
        @click="emit('syncData')"
        class="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-400 text-xs transition cursor-pointer disabled:opacity-50"
        title="Sinkronisasi Database"
        :disabled="isLoading"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin text-cyan-400': isLoading }" />
      </button>

      <button
        type="button"
        @click="emit('logout')"
        class="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs transition cursor-pointer"
        title="Logout Session Admin"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
