<script setup lang="ts">
import {
  X,
  User,
  Activity,
  Users,
  UserX,
  HelpCircle,
  MapPin,
  Camera,
  UserCheck,
  BookOpen,
  Crown,
  ShieldCheck,
  Gift,
  History,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';
import { useAdminAuth, type AdminTab } from '@/composables/admin/useAdminAuth';
import { getTesterDisplayName } from '@/data/testers';

interface CountsProp {
  members?: number;
  blacklist?: number;
  faqs?: number;
  meetups?: number;
  gallery?: number;
  articles?: number;
  staff?: number;
  registrations?: number;
}

const props = withDefaults(
  defineProps<{
    activeTab: AdminTab;
    isOpen: boolean;
    isCollapsed?: boolean;
    counts?: CountsProp;
  }>(),
  {
    isCollapsed: false,
    counts: () => ({})
  }
);

const emit = defineEmits<{
  (e: 'update:isOpen', val: boolean): void;
  (e: 'update:isCollapsed', val: boolean): void;
  (e: 'switchTab', tab: AdminTab): void;
  (e: 'openHistory'): void;
  (e: 'logout'): void;
}>();

const { currentUser, allowedTabs } = useAdminAuth();

const handleTabClick = (tab: AdminTab) => {
  emit('switchTab', tab);
  emit('update:isOpen', false);
};

const handleOpenHistory = () => {
  emit('openHistory');
  emit('update:isOpen', false);
};
</script>

<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      @click="emit('update:isOpen', false)"
      class="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
    ></div>

    <!-- Sidebar Element -->
    <aside
      class="bg-[#0a0e17] border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out select-none shadow-2xl"
      :class="[
        isOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,255,255,0.2)]' : '-translate-x-full lg:translate-x-0',
        isCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- Header / Logo -->
      <div
        class="border-b border-white/5 flex items-center transition-all duration-300"
        :class="isCollapsed ? 'p-3 flex-col gap-2 justify-center' : 'p-5 justify-between'"
      >
        <div v-if="!isCollapsed" class="min-w-0">
          <h2 class="text-xl font-black font-orbitron tracking-wider text-cyan-400 truncate">
            ADMIN<span class="text-pink-500">X5</span>
          </h2>
          <p class="text-[10px] text-gray-500 font-mono tracking-widest mt-0.5">Control Panel</p>
        </div>
        <div v-else class="text-center">
          <span class="text-base font-black font-orbitron tracking-wider text-cyan-400">
            A<span class="text-pink-500">X5</span>
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <span
            v-if="!isCollapsed"
            class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
            title="Server Online"
          ></span>

          <!-- Desktop Collapse / Expand Toggle Button -->
          <button
            type="button"
            @click="emit('update:isCollapsed', !isCollapsed)"
            class="hidden lg:flex p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 transition cursor-pointer"
            :title="isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'"
          >
            <ChevronRight v-if="isCollapsed" class="w-4 h-4" />
            <ChevronLeft v-else class="w-4 h-4" />
          </button>

          <!-- Mobile Close Button -->
          <button
            type="button"
            @click="emit('update:isOpen', false)"
            class="lg:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white cursor-pointer ml-1"
            title="Tutup Menu"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Current User Profile Card -->
      <div
        class="border-b border-white/5 bg-black/30 transition-all duration-300"
        :class="isCollapsed ? 'p-2.5 flex justify-center' : 'px-5 py-3'"
      >
        <div class="flex items-center gap-2" :class="isCollapsed ? 'justify-center' : ''">
          <div
            class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 relative cursor-default"
            :title="`@${currentUser.username || 'Admin'} (${currentUser.role || 'Staff'})`"
          >
            <User class="w-4 h-4" />
            <!-- Tiny indicator in collapsed mode -->
            <span
              v-if="isCollapsed"
              class="w-2 h-2 rounded-full absolute -top-0.5 -right-0.5"
              :class="{
                'bg-pink-500 shadow-[0_0_6px_#ec4899]': currentUser.role === 'superadmin' || currentUser.role === 'owner' || currentUser.role === 'admin',
                'bg-amber-400 shadow-[0_0_6px_#f59e0b]': currentUser.role === 'leader' || currentUser.role === 'vice_leader',
                'bg-cyan-400 shadow-[0_0_6px_#06b6d4]': currentUser.role === 'staff_tester',
                'bg-purple-400 shadow-[0_0_6px_#a855f7]': currentUser.role === 'staff_meet',
              }"
            ></span>
          </div>

          <div v-if="!isCollapsed" class="min-w-0 flex-1">
            <div class="text-xs font-bold font-orbitron text-white truncate">
              {{ currentUser.username || 'Admin' }}
            </div>
            <div class="flex items-center gap-1 mt-0.5">
              <span
                class="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold"
                :class="{
                  'bg-pink-500/20 text-pink-300 border border-pink-500/40': currentUser.role === 'superadmin' || currentUser.role === 'owner' || currentUser.role === 'admin',
                  'bg-amber-500/20 text-amber-300 border border-amber-500/40': currentUser.role === 'leader' || currentUser.role === 'vice_leader',
                  'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40': currentUser.role === 'staff_tester',
                  'bg-purple-500/20 text-purple-300 border border-purple-500/40': currentUser.role === 'staff_meet',
                }"
              >
                {{ (currentUser.role || 'Staff').replace('_', ' ') }}
              </span>
              <span v-if="currentUser.tester_name" class="text-[9px] text-purple-300 font-mono truncate" :title="'Tester: ' + getTesterDisplayName(currentUser.tester_name)">
                {{ getTesterDisplayName(currentUser.tester_name) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 p-2 sm:p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        <!-- Overview & Stats -->
        <button
          v-if="allowedTabs.includes('dashboard')"
          @click="handleTabClick('dashboard')"
          :class="[
            activeTab === 'dashboard' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? 'Overview & Statistics' : undefined"
        >
          <Activity class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Overview &amp; Stats</span>
        </button>

        <!-- Database Records -->
        <button
          v-if="allowedTabs.includes('members')"
          @click="handleTabClick('members')"
          :class="[
            activeTab === 'members' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? `Database Records (${counts.members ?? 0})` : undefined"
        >
          <Users class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Database Records</span>
          <span
            v-if="!isCollapsed && counts.members !== undefined"
            class="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-gray-400"
          >
            {{ counts.members }}
          </span>
          <span
            v-else-if="isCollapsed && counts.members !== undefined && counts.members > 0"
            class="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"
          ></span>
        </button>

        <!-- Blacklist / Outlist -->
        <button
          v-if="allowedTabs.includes('blacklist')"
          @click="handleTabClick('blacklist')"
          :class="[
            activeTab === 'blacklist' ? 'bg-red-500/15 text-red-400 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? `Blacklist / Outlist (${counts.blacklist ?? 0})` : undefined"
        >
          <UserX class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Blacklist / Outlist</span>
          <span
            v-if="!isCollapsed && counts.blacklist !== undefined"
            class="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-400"
          >
            {{ counts.blacklist }}
          </span>
        </button>

        <!-- FAQ Management -->
        <button
          v-if="allowedTabs.includes('faq')"
          @click="handleTabClick('faq')"
          :class="[
            activeTab === 'faq' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? `FAQ Management (${counts.faqs ?? 0})` : undefined"
        >
          <HelpCircle class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">FAQ Management</span>
          <span
            v-if="!isCollapsed && counts.faqs !== undefined"
            class="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400"
          >
            {{ counts.faqs }}
          </span>
        </button>

        <!-- Meet Up Management -->
        <button
          v-if="allowedTabs.includes('meetup')"
          @click="handleTabClick('meetup')"
          :class="[
            activeTab === 'meetup' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? `Meet Up Management (${counts.meetups ?? 0})` : undefined"
        >
          <MapPin class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Meet Up Management</span>
          <span
            v-if="!isCollapsed && counts.meetups !== undefined"
            class="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400"
          >
            {{ counts.meetups }}
          </span>
        </button>

        <!-- Gallery Meet Up -->
        <button
          v-if="allowedTabs.includes('gallery')"
          @click="handleTabClick('gallery')"
          :class="[
            activeTab === 'gallery' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? `Gallery Meet Up (${counts.gallery ?? 0})` : undefined"
        >
          <Camera class="w-4 h-4 text-cyan-400 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Gallery Meet Up</span>
          <span
            v-if="!isCollapsed && counts.gallery !== undefined"
            class="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400"
          >
            {{ counts.gallery }}
          </span>
        </button>

        <!-- Verifikasi Member -->
        <button
          v-if="allowedTabs.includes('verify')"
          @click="handleTabClick('verify')"
          :class="[
            activeTab === 'verify' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? 'Verifikasi Member Cepat' : undefined"
        >
          <UserCheck class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Verifikasi Member</span>
        </button>

        <!-- XFIVE Articles -->
        <button
          v-if="allowedTabs.includes('articles')"
          @click="handleTabClick('articles')"
          :class="[
            activeTab === 'articles' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? `XFIVE Articles (${counts.articles ?? 0})` : undefined"
        >
          <BookOpen class="w-4 h-4 text-cyan-400 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">XFIVE Articles</span>
          <span
            v-if="!isCollapsed && counts.articles !== undefined"
            class="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400"
          >
            {{ counts.articles }}
          </span>
        </button>

        <!-- Dewan Staff & RBAC -->
        <button
          v-if="allowedTabs.includes('staff')"
          @click="handleTabClick('staff')"
          :class="[
            activeTab === 'staff' ? 'bg-pink-500/15 text-pink-400 border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? `Dewan Staff & RBAC (${counts.staff ?? 0})` : undefined"
        >
          <Crown class="w-4 h-4 text-pink-400 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Dewan Staff &amp; RBAC</span>
          <span
            v-if="!isCollapsed && counts.staff !== undefined"
            class="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-950/60 border border-pink-500/30 text-pink-400"
          >
            {{ counts.staff }}
          </span>
        </button>

        <!-- Audit Registrasi -->
        <button
          v-if="allowedTabs.includes('registrations')"
          @click="handleTabClick('registrations')"
          :class="[
            activeTab === 'registrations' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? `Audit Registrasi (${counts.registrations ?? 0})` : undefined"
        >
          <ShieldCheck class="w-4 h-4 text-cyan-400 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Audit Registrasi</span>
          <span
            v-if="!isCollapsed && counts.registrations !== undefined"
            class="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400"
          >
            {{ counts.registrations }}
          </span>
        </button>

        <!-- Hadiah Gacha Meetup -->
        <button
          v-if="allowedTabs.includes('gacha')"
          @click="handleTabClick('gacha')"
          :class="[
            activeTab === 'gacha' ? 'bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? 'Gacha Reward & Point System' : undefined"
        >
          <Gift class="w-4 h-4 text-amber-400 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Gacha Meetup</span>
          <span
            v-if="!isCollapsed"
            class="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400"
          >
            POINT
          </span>
        </button>

        <!-- Riwayat Nickname Action Modal Button -->
        <button
          v-if="currentUser.role === 'superadmin' || currentUser.role === 'leader' || currentUser.role === 'vice_leader'"
          @click="handleOpenHistory"
          :class="[
            'text-gray-400 hover:text-cyan-400 hover:bg-white/5 border-transparent',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
          ]"
          class="w-full flex items-center rounded-xl text-xs font-bold font-orbitron tracking-wide border-l-2 transition cursor-pointer relative group"
          :title="isCollapsed ? 'Riwayat Nickname Member' : undefined"
        >
          <History class="w-4 h-4 text-cyan-400 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Riwayat Nickname</span>
        </button>

        <!-- Bottom Divider Actions -->
        <div class="pt-3 border-t border-white/5 space-y-1">
          <router-link
            to="/"
            :class="[
              'text-gray-400 hover:text-cyan-300 hover:bg-white/5',
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
            ]"
            class="w-full flex items-center rounded-xl text-xs font-mono transition cursor-pointer"
            :title="isCollapsed ? 'Lihat Website' : undefined"
          >
            <ExternalLink class="w-4 h-4 shrink-0" />
            <span v-if="!isCollapsed" class="truncate">Lihat Website</span>
          </router-link>

          <button
            type="button"
            @click="emit('logout')"
            :class="[
              'text-red-400 hover:text-red-300 hover:bg-red-500/10',
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
            ]"
            class="w-full flex items-center rounded-xl text-xs font-mono transition cursor-pointer"
            :title="isCollapsed ? 'Logout Session' : undefined"
          >
            <LogOut class="w-4 h-4 shrink-0" />
            <span v-if="!isCollapsed" class="truncate">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.3);
}
</style>
