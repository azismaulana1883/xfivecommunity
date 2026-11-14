<template>
  <div class="flex flex-col gap-6">
    <header class="identity-block">
      <div class="identity-badges">
        <span v-if="member.verified" class="profile-badge profile-badge-verified" title="Verified member">
          <i class="fas fa-check-circle"></i>
          <span>Verified</span>
        </span>
        <span v-if="member.title" class="profile-badge profile-badge-title" :title="member.title">
          <i class="fas fa-id-badge"></i>
          <span>{{ member.title }}</span>
        </span>
      </div>

      <h1 class="identity-name font-orbitron">{{ member.name }}</h1>

      <div class="identity-handle-row">
        <span
          v-if="member.nickname"
          class="identity-handle"
          @click="$emit('copy-nickname')"
          title="Click to copy"
        >
          <i class="fas fa-at"></i><span>{{ member.nickname }}</span>
        </span>
        <button
          v-if="member.nickname"
          type="button"
          @click="$emit('copy-nickname')"
          class="icon-action cursor-pointer transition-colors"
          :class="{ '!border-cyan-400 !text-cyan-400': isCopiedNick }"
          title="Copy nickname"
          aria-label="Copy nickname"
        >
          <i :class="isCopiedNick ? 'fas fa-check' : 'fas fa-copy'"></i>
        </button>
        <button
          @click="$emit('open-edit')"
          class="icon-action !border-fuchsia-500/50 !text-fuchsia-400 hover:!border-fuchsia-400 hover:!bg-fuchsia-500/20"
          title="Edit data profil ini dengan kunci edit unikmu"
          aria-label="Edit profile"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button
          @click="$emit('share-profile')"
          class="icon-action"
          title="Share profile"
          aria-label="Share profile"
        >
          <i class="fas fa-share-alt"></i>
        </button>
      </div>

      <p v-if="member.description" class="text-gray-300 leading-relaxed mt-4 text-sm md:text-base">
        {{ member.description }}
      </p>
    </header>

    <div v-if="hasInfoChips" class="info-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        v-if="dobInfo"
        class="info-chip border-fuchsia-500/25 bg-fuchsia-500/5 text-fuchsia-200 flex items-center gap-3 rounded-lg border px-3 py-2.5"
      >
        <i class="fas fa-birthday-cake text-cyan-400 text-sm w-4 text-center"></i>
        <div class="min-w-0">
          <div class="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold">
            {{ dobInfo.age != null ? `Tanggal Lahir · ${dobInfo.age} th` : 'Tanggal Lahir' }}
          </div>
          <div class="text-sm font-semibold truncate">{{ dobInfo.pretty }}</div>
        </div>
      </div>

      <div
        v-if="member.domisili"
        class="info-chip border-cyan-500/25 bg-cyan-500/5 text-cyan-200 flex items-center gap-3 rounded-lg border px-3 py-2.5"
      >
        <i class="fas fa-map-marker-alt text-cyan-400 text-sm w-4 text-center"></i>
        <div class="min-w-0">
          <div class="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold">Domisili</div>
          <div class="text-sm font-semibold truncate">{{ member.domisili }}</div>
        </div>
      </div>

      <div
        v-if="member.gender && member.gender !== '-'"
        class="info-chip border-white/10 bg-white/5 text-gray-200 flex items-center gap-3 rounded-lg border px-3 py-2.5"
      >
        <i class="fas fa-venus-mars text-cyan-400 text-sm w-4 text-center"></i>
        <div class="min-w-0">
          <div class="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold">Gender</div>
          <div class="text-sm font-semibold truncate capitalize">{{ member.gender }}</div>
        </div>
      </div>

      <div
        v-if="member.category"
        class="info-chip border-white/10 bg-white/5 text-gray-200 flex items-center gap-3 rounded-lg border px-3 py-2.5"
      >
        <i class="fas fa-layer-group text-cyan-400 text-sm w-4 text-center"></i>
        <div class="min-w-0">
          <div class="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold">Category</div>
          <div class="text-sm font-semibold truncate">{{ member.category }}</div>
        </div>
      </div>
    </div>

    <div>
      <h2 class="section-eyebrow">
        <span class="eyebrow-bar cyan"></span> Quote
      </h2>
      <div
        v-if="member.quote"
        class="quote-block relative bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-cyan-500/20 rounded-xl p-6 md:p-8 shadow-[0_0_30px_rgba(0,255,255,0.05)]"
      >
        <i class="fas fa-quote-left text-cyan-400/40 text-3xl md:text-4xl absolute top-4 left-4"></i>
        <p class="text-base md:text-lg text-gray-200 italic leading-relaxed pl-10 md:pl-12 pr-2">
          {{ member.quote }}
        </p>
        <i class="fas fa-quote-right text-fuchsia-500/40 text-3xl md:text-4xl absolute bottom-4 right-4"></i>
      </div>
      <div
        v-else
        class="quote-block-placeholder relative bg-gradient-to-br from-[#161b22]/60 to-[#0d1117]/60 border border-dashed border-white/10 rounded-xl p-8 text-center"
      >
        <i class="fas fa-feather-alt text-gray-600 text-3xl mb-3"></i>
        <p class="text-gray-500 italic text-sm">Member belum menambahkan quote.</p>
      </div>
    </div>

    <div>
      <h2 class="section-eyebrow">
        <span class="eyebrow-bar fuchsia"></span> Connect
      </h2>
      <div class="flex items-center gap-3 md:gap-4 flex-wrap">
        <a
          v-if="safeUrl(member.facebook)"
          :href="member.facebook"
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
          class="social-btn w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border bg-blue-600/20 border-blue-500/60 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:scale-110"
        >
          <i class="fab fa-facebook-f text-lg md:text-xl"></i>
        </a>
        <span
          v-else
          title="Facebook (not set)"
          class="social-btn w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border bg-gray-800/40 border-gray-700 text-gray-600 cursor-not-allowed opacity-60"
        >
          <i class="fab fa-facebook-f text-lg md:text-xl"></i>
        </span>

        <a
          v-if="safeUrl(member.instagram)"
          :href="member.instagram"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
          class="social-btn w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border bg-pink-600/20 border-pink-500/60 text-pink-400 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:border-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-110"
        >
          <i class="fab fa-instagram text-lg md:text-xl"></i>
        </a>
        <span
          v-else
          title="Instagram (not set)"
          class="social-btn w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border bg-gray-800/40 border-gray-700 text-gray-600 cursor-not-allowed opacity-60"
        >
          <i class="fab fa-instagram text-lg md:text-xl"></i>
        </span>

        <a
          v-if="safeUrl(member.twitter)"
          :href="member.twitter"
          target="_blank"
          rel="noopener noreferrer"
          title="Twitter / X"
          class="social-btn w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border bg-gray-700/20 border-gray-500/60 text-gray-200 hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:scale-110"
        >
          <i class="fab fa-x-twitter text-lg md:text-xl"></i>
        </a>
        <span
          v-else
          title="Twitter / X (not set)"
          class="social-btn w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border bg-gray-800/40 border-gray-700 text-gray-600 cursor-not-allowed opacity-60"
        >
          <i class="fab fa-x-twitter text-lg md:text-xl"></i>
        </span>
      </div>
    </div>

    <div class="quick-actions flex flex-wrap gap-3 mt-auto pt-4">
      <button
        type="button"
        @click="$emit('copy-profile-link')"
        class="action-primary cursor-pointer transition-all duration-300"
        :class="{ '!bg-gradient-to-r !from-green-400 !to-emerald-500 !text-black shadow-[0_0_20px_rgba(34,197,94,0.6)]': isCopiedLink }"
      >
        <i :class="isCopiedLink ? 'fas fa-check' : 'fas fa-link'"></i>
        {{ isCopiedLink ? 'Link Copied!' : 'Copy Profile Link' }}
      </button>
      <button type="button" @click="$emit('open-ektp')" class="action-ghost cursor-pointer">
        <i class="fas fa-id-card"></i> E-KTP Digital
      </button>
      <button
        type="button"
        @click="$emit('open-edit')"
        class="action-ghost cursor-pointer !border-fuchsia-500/60 !text-fuchsia-300 hover:!bg-fuchsia-500 hover:!text-black shadow-[0_0_15px_rgba(217,70,239,0.2)]"
      >
        <i class="fas fa-edit"></i> Edit Profil
      </button>
      <button type="button" @click="$emit('share-profile')" class="action-ghost cursor-pointer">
        <i class="fas fa-share-alt"></i> Share
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  member: {
    type: Object,
    required: true
  },
  dobInfo: {
    type: Object,
    default: null
  },
  hasInfoChips: {
    type: Boolean,
    default: false
  },
  isCopiedNick: {
    type: Boolean,
    default: false
  },
  isCopiedLink: {
    type: Boolean,
    default: false
  }
});

defineEmits([
  'copy-nickname',
  'copy-profile-link',
  'open-edit',
  'open-ektp',
  'share-profile'
]);

function safeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}
</script>
