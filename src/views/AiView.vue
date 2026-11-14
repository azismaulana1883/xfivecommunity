<script setup lang="ts">
import { useRouter } from 'vue-router';
import AiChatModal from '../components/AiChatModal.vue';

const router = useRouter();

const handleClose = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-[#07090e] flex items-center justify-center">
    <AiChatModal :isOpen="true" @close="handleClose" />
  </div>
</template>
