<template>
  <section
    class="relative overflow-hidden rounded-3xl bg-[#0c121e]/80 border border-white/10 p-6 md:p-8 shadow-xl"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-white/5">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-[11px] font-bold tracking-widest uppercase font-orbitron mb-2">
          <i class="fas fa-crown text-[10px]"></i> Pengurus Komunitas
        </div>
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold font-orbitron text-white uppercase tracking-wider">
          Dewan Staff XFIVE
        </h2>
        <p class="text-xs text-gray-400 font-mono mt-1">
          Jajaran pengurus resmi: Owner, Leader, dan Staff Community.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <RouterLink
          to="/dewan-staff"
          class="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5"
        >
          <span>Lihat Lengkap</span>
          <i class="fas fa-arrow-right text-[10px]"></i>
        </RouterLink>

        <div v-if="staffList.length > visibleCards" class="flex items-center gap-1.5 ml-2">
          <button
            type="button"
            @click="prevStaff"
            title="Staff Sebelumnya"
            class="w-8 h-8 rounded-lg bg-black/60 hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-cyan-400 text-gray-300 text-xs flex items-center justify-center transition cursor-pointer"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            type="button"
            @click="nextStaff"
            title="Staff Selanjutnya"
            class="w-8 h-8 rounded-lg bg-black/60 hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-cyan-400 text-gray-300 text-xs flex items-center justify-center transition cursor-pointer"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="py-16 text-center text-cyan-400 font-mono text-xs animate-pulse">
      <i class="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
      <p>Memuat jajaran dewan staff...</p>
    </div>

    <div v-else class="relative overflow-hidden">
      <div
        ref="staffViewportRef"
        class="overflow-hidden w-full py-1 cursor-grab active:cursor-grabbing select-none"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          class="flex gap-4 will-change-transform"
          :style="trackStyle"
        >
          <div
            v-for="staff in staffList"
            :key="staff.id || staff.nickname"
            class="shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] flex flex-col rounded-2xl border bg-black/40 p-4 transition-colors duration-200 hover:shadow-[0_0_25px_rgba(0,255,255,0.15)] group"
            :style="cardStyle"
            :class="getStaffBorderClass(staff.title)"
          >
            <div class="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/60 mb-3 border border-white/5">
              <img
                :src="getStaffAvatar(staff)"
                :alt="staff.nickname || staff.name || 'Staff'"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                decoding="async"
                @error="(e) => onAvatarError(e, staff)"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none"></div>

              <div class="absolute top-2.5 left-2.5">
                <span
                  class="px-2.5 py-0.5 rounded-md text-[10px] font-orbitron font-bold tracking-wide uppercase shadow-md backdrop-blur-sm border"
                  :class="getStaffBadgeClass(staff.title)"
                >
                  {{ formatStaffTitle(staff.title) }}
                </span>
              </div>
            </div>

            <div class="flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 class="font-orbitron font-bold text-white text-base group-hover:text-cyan-400 transition truncate">
                  {{ staff.nickname || staff.name }}
                </h3>
                <p v-if="staff.name && staff.name !== staff.nickname" class="text-xs text-gray-400 font-mono truncate">
                  {{ staff.name }}
                </p>
                <p v-if="staff.domisili" class="text-[11px] text-gray-500 font-mono mt-0.5 truncate flex items-center gap-1">
                  <i class="fas fa-map-marker-alt text-cyan-400/80 text-[10px]"></i>
                  <span>{{ staff.domisili }}</span>
                </p>
              </div>

              <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span class="text-[10px] font-mono text-gray-500">Official Staff</span>
                <a
                  v-if="staff.instagram"
                  :href="`https://instagram.com/${staff.instagram.replace('@', '')}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram Profile"
                  class="text-fuchsia-400 hover:text-fuchsia-300 text-xs transition"
                >
                  <i class="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="staffList.length > visibleCards && totalStaffPages > 1" class="flex justify-center items-center gap-1.5 mt-5">
      <button
        v-for="dotIdx in totalStaffPages"
        :key="dotIdx"
        type="button"
        @click="goToStaffPage(dotIdx - 1)"
        :title="`Halaman ${dotIdx}`"
        class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
        :class="currentStaffPage === (dotIdx - 1) ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.6)]' : 'w-2 bg-gray-700 hover:bg-gray-500'"
      ></button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  staffList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const staffViewportRef = ref(null);
const currentStaffPage = ref(0);
const visibleCards = ref(4);
const cardWidthPx = ref(0);
const gapPx = 16;
const isHovered = ref(false);
const isTransitioning = ref(true);
let staffAutoplayTimer = null;
let resizeObserver = null;

const touchStartX = ref(0);
const touchDeltaX = ref(0);

const updateCarouselDimensions = () => {
  if (!staffViewportRef.value) return;
  const viewportWidth = staffViewportRef.value.clientWidth;
  if (!viewportWidth) return;

  if (viewportWidth >= 1024) visibleCards.value = 4;
  else if (viewportWidth >= 768) visibleCards.value = 3;
  else if (viewportWidth >= 520) visibleCards.value = 2;
  else visibleCards.value = 1;

  const totalGaps = gapPx * (visibleCards.value - 1);
  cardWidthPx.value = Math.max(120, (viewportWidth - totalGaps) / visibleCards.value);
};

const cardStyle = computed(() => {
  if (cardWidthPx.value > 0) {
    return {
      width: `${cardWidthPx.value}px`,
      minWidth: `${cardWidthPx.value}px`,
      maxWidth: `${cardWidthPx.value}px`
    };
  }
  return {};
});

const totalStaffPages = computed(() => {
  if (!props.staffList.length || visibleCards.value <= 0) return 0;
  return Math.ceil(props.staffList.length / visibleCards.value);
});

const maxStartIndex = computed(() => {
  return Math.max(0, props.staffList.length - visibleCards.value);
});

const getPageIndexStartIndex = (page) => {
  const unclamped = page * visibleCards.value;
  return Math.min(unclamped, maxStartIndex.value);
};

const currentTranslateX = computed(() => {
  if (props.staffList.length <= visibleCards.value || cardWidthPx.value <= 0) return 0;
  const startIndex = getPageIndexStartIndex(currentStaffPage.value);
  const step = cardWidthPx.value + gapPx;
  return startIndex * step;
});

const trackStyle = computed(() => {
  return {
    transform: `translate3d(-${currentTranslateX.value}px, 0, 0)`,
    transition: isTransitioning.value ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
  };
});

const goToStaffPage = (page) => {
  if (totalStaffPages.value <= 0) return;
  currentStaffPage.value = Math.max(0, Math.min(page, totalStaffPages.value - 1));
};

const nextStaff = () => {
  if (totalStaffPages.value <= 1) return;
  if (currentStaffPage.value < totalStaffPages.value - 1) {
    currentStaffPage.value++;
  } else {
    currentStaffPage.value = 0;
  }
};

const prevStaff = () => {
  if (totalStaffPages.value <= 1) return;
  if (currentStaffPage.value > 0) {
    currentStaffPage.value--;
  } else {
    currentStaffPage.value = totalStaffPages.value - 1;
  }
};

const onTouchStart = (e) => {
  if (!e.touches || e.touches.length === 0) return;
  touchStartX.value = e.touches[0].clientX;
  touchDeltaX.value = 0;
};

const onTouchMove = (e) => {
  if (!e.touches || e.touches.length === 0) return;
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value;
};

const onTouchEnd = () => {
  if (Math.abs(touchDeltaX.value) > 40) {
    if (touchDeltaX.value < 0) {
      nextStaff();
    } else {
      prevStaff();
    }
  }
  touchDeltaX.value = 0;
};

const startStaffAutoplay = () => {
  stopStaffAutoplay();
  if (props.staffList.length > visibleCards.value) {
    staffAutoplayTimer = setInterval(() => {
      if (!isHovered.value) {
        nextStaff();
      }
    }, 5000);
  }
};

const stopStaffAutoplay = () => {
  if (staffAutoplayTimer) {
    clearInterval(staffAutoplayTimer);
    staffAutoplayTimer = null;
  }
};

const formatStaffTitle = (title) => {
  if (!title) return 'STAFF';
  const t = title.toLowerCase();
  if (t.includes('owner')) return 'OWNER';
  if (t.includes('vice')) return 'VICE LEADER';
  if (t.includes('leader')) return 'LEADER';
  if (t.includes('meet')) return 'STAFF MEET';
  if (t.includes('tester')) return 'STAFF TESTER';
  return 'STAFF';
};

const getStaffBadgeClass = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('owner')) return 'bg-amber-400 text-black border-amber-300';
  if (t.includes('leader')) return 'bg-fuchsia-500 text-white border-fuchsia-400';
  return 'bg-cyan-500 text-black border-cyan-400';
};

const getStaffBorderClass = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('owner')) return 'border-amber-500/30 hover:border-amber-400/80';
  if (t.includes('leader')) return 'border-fuchsia-500/30 hover:border-fuchsia-400/80';
  return 'border-cyan-500/30 hover:border-cyan-400/80';
};

const getStaffAvatar = (staff) => {
  if (staff?.avatar && typeof staff.avatar === 'string' && staff.avatar.trim()) {
    return staff.avatar;
  }
  const label = staff?.nickname || staff?.name || 'X5';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=0b1016&color=00ffff&size=512&font-size=0.35&bold=true`;
};

const onAvatarError = (e, staff) => {
  e.target.onerror = null;
  const label = staff?.nickname || staff?.name || 'X5';
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=0b1016&color=00ffff&size=512&font-size=0.35&bold=true`;
};

watch(() => props.staffList, async () => {
  await nextTick();
  updateCarouselDimensions();
  startStaffAutoplay();
});

onMounted(() => {
  updateCarouselDimensions();
  window.addEventListener('resize', updateCarouselDimensions);
  if (typeof ResizeObserver !== 'undefined' && staffViewportRef.value && !resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      updateCarouselDimensions();
    });
    resizeObserver.observe(staffViewportRef.value);
  }
  startStaffAutoplay();
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  window.removeEventListener('resize', updateCarouselDimensions);
  stopStaffAutoplay();
});
</script>
