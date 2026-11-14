<template>
  <div class="flex flex-col">
    <div class="premium-photo-frame" :aria-label="member.name + ' photo'">
      <div class="premium-photo-inner">
        <img
          :src="avatarSrc"
          :alt="member.name"
          class="premium-photo-img"
          @error="$emit('image-error', $event)"
        />
        <div class="premium-photo-glass"></div>
        <div class="premium-photo-vignette"></div>
        <div v-if="member.verified" class="premium-photo-verified">
          <i class="fas fa-check-circle"></i> Verified
        </div>
      </div>
    </div>

    <div class="mt-5 profile-stats-wrapper">
      <div class="profile-stats grid grid-cols-3 gap-3">
        <div class="stat-card">
          <div class="stat-value">
            <i v-if="member.verified" class="fas fa-check text-cyan-300"></i>
            <i v-else class="fas fa-minus text-gray-600"></i>
          </div>
          <div class="stat-label">Status</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ certificateCount }}</div>
          <div class="stat-label">Certs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ roleDisplay }}</div>
          <div class="stat-label">Role</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  member: {
    type: Object,
    required: true
  },
  avatarSrc: {
    type: String,
    required: true
  },
  certificateCount: {
    type: Number,
    default: 0
  },
  roleDisplay: {
    type: String,
    default: '—'
  }
});

defineEmits(['image-error']);
</script>
