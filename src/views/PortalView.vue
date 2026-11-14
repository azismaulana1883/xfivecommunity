<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  UserPlus,
  Camera,
  Bot,
  Gamepad2,
  Users,
  Trophy
} from 'lucide-vue-next';
import BroadcastBar from '../components/BroadcastBar.vue';
import NeonButton from '../components/NeonButton.vue';
import AnimatedIcon from '../components/AnimatedIcon.vue';
import AiChatModal from '../components/AiChatModal.vue';

const router = useRouter();
const route = useRoute();
const isImageLoaded = ref(true);
const isAiModalOpen = ref(Boolean(route.query.ai === 'true' || route.query.ai === '1'));

const navigateToRegister = () => {
  router.push('/register');
};

const navigateToHome = () => {
  router.push('/');
};

const handleImageLoad = () => {
  isImageLoaded.value = true;
};
</script>

<template>
  <!-- Cyberpunk Portal -->
  <div class="relative min-h-screen flex flex-col items-center bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-cyan-500 selection:text-black w-full">
    <!-- Background Particles / Glow from xfivecommunity App.vue -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-90"></div>
    </div>

    <!-- Broadcast Bar (Fixed Top or Inline) -->
    <div class="w-full max-w-5xl mb-12 mt-4 px-4 z-20">
      <BroadcastBar @click="navigateToRegister" />
    </div>

    <!-- Hero Section -->
    <div class="text-center space-y-8 animate-fade-in max-w-4xl w-full px-4 z-10 flex-1 flex flex-col justify-center mt-8">

      <!-- Hero Image / Characters -->
      <div class="relative w-full flex justify-center -mb-16 md:-mb-28 z-20 pointer-events-none">
        <!-- Floating container with max-width and responsive sizing -->
        <div class="relative w-full max-w-[320px] sm:max-w-sm md:max-w-md lg:max-w-xl mx-auto animate-float">
          <!-- Glow effect behind the image (from xfivecommunity) -->
          <div
            class="absolute inset-0 bg-neon-blue/20 blur-3xl rounded-full scale-75 animate-pulse transition-opacity duration-1000 ease-in-out"
            :class="isImageLoaded ? 'opacity-70' : 'opacity-0'"
          ></div>

          <!-- The actual image -->
          <img
            src="/img/xfive-team11.webp"
            alt="XFIVE Team"
            class="relative z-10 w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,255,255,0.3)] filter brightness-110 contrast-105 transition-opacity duration-1000 ease-in-out"
            :class="isImageLoaded ? 'opacity-100' : 'opacity-0'"
            loading="eager"
            fetchpriority="high"
            @load="handleImageLoad"
          />
        </div>
      </div>

      <!-- Main Logo / Title -->
      <div class="mb-8 relative group cursor-default z-10">
        <h1 class="text-6xl md:text-8xl font-extrabold tracking-wider mb-2 glitch-text font-orbitron select-none">
          XFIVE<span class="text-neon-blue">ID</span>
        </h1>
        <p class="text-gray-400 text-sm md:text-base tracking-[0.8em] font-orbitron mt-4 group-hover:text-neon-purple transition-colors duration-500">
          SINCE 2017
        </p>

        <!-- Decorative Lines -->
        <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-neon-blue/50 blur-sm rounded-full"></div>
      </div>

      <!-- Feature Grid (Icons) -->
      <div class="grid grid-cols-3 gap-8 max-w-lg mx-auto mb-12">
        <div class="flex flex-col items-center gap-2 group cursor-pointer" @click="navigateToHome">
          <AnimatedIcon :name="Users" animation="float" color="text-neon-blue" size="w-10 h-10" />
          <span class="text-xs text-gray-500 font-orbitron tracking-widest group-hover:text-neon-blue transition-colors">COMMUNITY</span>
        </div>
        <div class="flex flex-col items-center gap-2 group">
          <AnimatedIcon :name="Trophy" animation="breathe" color="text-neon-purple" size="w-10 h-10" />
          <span class="text-xs text-gray-500 font-orbitron tracking-widest group-hover:text-neon-purple transition-colors">TOURNAMENT</span>
        </div>
        <div class="flex flex-col items-center gap-2 group">
          <AnimatedIcon :name="Gamepad2" animation="float" color="text-neon-green" size="w-10 h-10" />
          <span class="text-xs text-gray-500 font-orbitron tracking-widest group-hover:text-neon-green transition-colors">GAMING</span>
        </div>
      </div>

      <!-- Action Buttons Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
        <NeonButton @click="navigateToHome" variant="secondary" show-default-icon>
          Home
        </NeonButton>

        <NeonButton @click="isAiModalOpen = true" variant="success">
          <template #icon><Bot /></template>
          XFIVE AI
        </NeonButton>
      </div>
    </div>

    <!-- XFIVE AI CHAT MODAL WITH CLOUDFLARE TURNSTILE GATE -->
    <AiChatModal :isOpen="isAiModalOpen" @close="isAiModalOpen = false" />

    <!-- Footer -->
    <footer class="mt-20 mb-8 text-gray-600 text-xs md:text-sm font-orbitron tracking-wider text-center z-10">
      <p class="opacity-70 hover:opacity-100 transition-opacity">
        &copy; 2017-2025 XFIVE COMMUNITY. ALL RIGHTS RESERVED.
      </p>
    </footer>
  </div>
</template>

<style scoped>
:root {
  --neon-blue: #00FFFF;
  --neon-purple: #8A2BE2;
  --neon-pink: #FF69B4;
  --neon-green: #39FF14;
}

.glitch-text {
  text-shadow: 2px 2px #8A2BE2, -2px -2px #00FFFF;
  animation: glitch 1s infinite linear alternate-reverse;
}

@keyframes glitch {
  0% { text-shadow: 2px 2px #8A2BE2, -2px -2px #00FFFF; }
  25% { text-shadow: -2px 2px #00FFFF, 2px -2px #8A2BE2; }
  50% { text-shadow: 2px -2px #8A2BE2, -2px 2px #00FFFF; }
  75% { text-shadow: -2px -2px #00FFFF, 2px 2px #8A2BE2; }
  100% { text-shadow: 2px 2px #8A2BE2, -2px -2px #00FFFF; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
</style>
