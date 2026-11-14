<template>
  <div
    class="profile-card-container group reveal-card active"
    :class="{ 'is-flipped': isFlipped }"
  >
    <div class="profile-card-inner">
      <!-- FRONT FACE -->
      <div
        class="profile-card-face profile-card-front cyber-aug-configuration"
        data-augmented-ui="tl-clip tr-clip bl-clip br-clip both"
        style="--aug-border-bg: linear-gradient(45deg, var(--neon-cyan), var(--neon-pink)); --aug-border-all: 2px;"
      >
        <img
          class="main-photo"
          :src="avatarSrc"
          :alt="member.name"
          loading="lazy"
          @error="handleImageError"
        />
        <div class="overlay"></div>

        <!-- VERIFIED BADGE -->
        <span
          v-if="member.verified"
          class="absolute top-3 left-3 z-20 inline-flex items-center gap-1 bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,255,255,0.3)] backdrop-blur-sm"
        >
          <i class="fas fa-check-circle"></i> Verified
        </span>

        <!-- FLIP TOGGLE BUTTON (MOBILE / DESKTOP HELPER) -->
        <button
          type="button"
          @click.stop="isFlipped = !isFlipped"
          class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors flex items-center justify-center text-xs"
          title="Putar kartu"
        >
          <i class="fas fa-rotate"></i>
        </button>

        <div class="content-container">
          <div class="min-h-[54px] mb-1 w-full flex justify-start items-end">
            <h2 class="text-3xl font-bold leading-tight text-white drop-shadow-lg">
              {{ member.name }}
            </h2>
          </div>
          <p class="text-lg text-cyan-300 font-medium mb-4 drop-shadow-md uppercase tracking-widest font-orbitron">
            {{ member.title }}
          </p>
          <RouterLink
            :to="`/member/${slug}`"
            class="detail-link ghost-btn w-full py-3 px-6 rounded text-sm font-bold uppercase tracking-wider mx-auto self-center relative z-10 pointer-events-auto mt-2 min-h-[44px] flex items-center justify-center text-center"
          >
            Lihat Selengkapnya
            <span class="light-sweep"></span>
          </RouterLink>
        </div>
      </div>

      <!-- BACK FACE -->
      <div
        class="profile-card-face profile-card-back cyber-aug-configuration flex flex-col justify-between"
        data-augmented-ui="tl-clip tr-clip bl-clip br-clip both"
        style="--aug-border-bg: linear-gradient(45deg, var(--neon-cyan), var(--neon-pink)); --aug-border-all: 2px;"
      >
        <button
          type="button"
          @click.stop="isFlipped = !isFlipped"
          class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 border border-fuchsia-500/40 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-black transition-colors flex items-center justify-center text-xs"
          title="Kembali ke depan"
        >
          <i class="fas fa-rotate"></i>
        </button>

        <div class="text-center relative z-10">
          <img
            class="w-24 h-24 rounded-full object-cover border-4 border-fuchsia-500/50 mx-auto shadow-lg shadow-fuchsia-500/20"
            :src="avatarSrc"
            :alt="member.name"
            loading="lazy"
            @error="handleImageError"
          />
          <h2 class="text-2xl font-bold text-white mt-3">{{ member.name }}</h2>
          <div class="flex items-center justify-center gap-2 mt-1">
            <span class="text-fuchsia-400 font-medium text-sm tracking-wide font-orbitron">{{ member.title }}</span>
          </div>
        </div>

        <div class="text-left mt-4 border-t border-white/10 pt-4 space-y-2 text-sm self-stretch flex-grow relative z-10">
          <div class="flex items-center bg-white/5 p-2 rounded relative group/nick">
            <i class="fas fa-user-circle fa-fw w-6 text-cyan-400"></i>
            <span class="font-semibold mr-2 text-gray-300">Nick:</span>
            <span class="text-white truncate flex-1">{{ member.nickname || '-' }}</span>
            <button
              v-if="member.nickname"
              type="button"
              @click.stop="copyNick(member.nickname)"
              class="ml-2 text-gray-400 hover:text-cyan-400 transition-colors p-1"
              title="Copy Nickname"
            >
              <i class="fas fa-copy"></i>
            </button>
          </div>

          <div class="flex items-center bg-white/5 p-2 rounded">
            <i class="fas fa-map-marker-alt fa-fw w-6 text-fuchsia-400"></i>
            <span class="font-semibold mr-2 text-gray-300">Domisili:</span>
            <span class="text-white">{{ member.domisili || '-' }}</span>
          </div>

          <div class="flex items-center bg-white/5 p-2 rounded">
            <i class="fas fa-calendar-alt fa-fw w-6 text-cyan-400"></i>
            <span class="font-semibold mr-2 text-gray-300">Lahir:</span>
            <span class="text-white">{{ member.dob || '-' }}</span>
          </div>

          <div class="flex items-center bg-white/5 p-2 rounded">
            <i
              class="fa-fw w-6 text-center"
              :class="member.gender === 'male' ? 'fas fa-mars text-blue-400' : member.gender === 'female' ? 'fas fa-venus text-pink-400' : 'fas fa-genderless text-gray-400'"
            ></i>
            <span class="font-semibold mr-2 text-gray-300">Gender:</span>
            <span class="text-white">{{ member.gender === 'male' ? 'Male' : member.gender === 'female' ? 'Female' : '-' }}</span>
          </div>
        </div>

        <RouterLink
          :to="`/member/${slug}`"
          class="detail-link ghost-btn w-full py-3 px-6 rounded text-sm font-bold uppercase tracking-wider mx-auto self-center mt-4 relative z-10 pointer-events-auto min-h-[44px] flex items-center justify-center text-center"
        >
          Lihat Selengkapnya
          <span class="light-sweep"></span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
});

const isFlipped = ref(false);
const avatarFallback = ref(false);

const avatarSrc = computed(() => {
  if (avatarFallback.value || !props.member.avatar) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.member.name || 'User')}&background=0d1117&color=00ffff&size=512&font-size=0.33`;
  }
  return props.member.avatar;
});

function handleImageError() {
  avatarFallback.value = true;
}

const slug = computed(() => {
  const raw = (props.member.nickname || props.member.name || '').trim();
  return raw
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
});

function copyNick(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Nickname Copied!');
    });
  } else {
    toast.success('Nickname Copied!');
  }
}
</script>

