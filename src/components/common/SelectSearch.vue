<template>
  <div class="relative w-full select-none" ref="containerRef">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      class="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-black/50 border text-xs font-mono transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      :class="isOpen ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.15)] text-white' : 'border-white/10 hover:border-cyan-500/40 text-gray-300'"
    >
      <div class="flex items-center gap-2 truncate">
        <span v-if="selectedOption" class="truncate font-medium text-white">
          {{ selectedOption.label }}
          <span v-if="selectedOption.sublabel" class="text-cyan-400/70 ml-1 text-[11px]">({{ selectedOption.sublabel }})</span>
        </span>
        <span v-else class="text-gray-500 truncate">{{ placeholder || 'Pilih opsi...' }}</span>
      </div>
      <i
        class="fas fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200"
        :class="isOpen ? 'rotate-180 text-cyan-400' : ''"
      ></i>
    </button>

    <!-- Floating Dropdown Panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#0c121e] border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,255,255,0.1)] p-2 backdrop-blur-xl flex flex-col gap-1 max-h-60 overflow-hidden"
      >
        <!-- Search Input -->
        <div class="relative px-1 pb-1 border-b border-white/10">
          <i class="fas fa-search text-[11px] text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
          <input
            ref="searchInputRef"
            type="text"
            v-model="searchQuery"
            placeholder="Ketik untuk mencari..."
            class="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
            @keydown.down.prevent="navigateDown"
            @keydown.up.prevent="navigateUp"
            @keydown.enter.prevent="selectHighlighted"
          />
        </div>

        <!-- Options List -->
        <div class="overflow-y-auto space-y-0.5 pt-1 pr-1 custom-scrollbar">
          <div
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            @click="selectOption(option)"
            class="px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer flex items-center justify-between transition-colors"
            :class="[
              option.value === modelValue
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : index === highlightedIndex
                ? 'bg-white/10 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            ]"
          >
            <div class="truncate">
              <span>{{ option.label }}</span>
              <span v-if="option.sublabel" class="text-cyan-400/60 text-[10px] ml-1.5 font-normal">({{ option.sublabel }})</span>
            </div>
            <i v-if="option.value === modelValue" class="fas fa-check text-[10px] text-cyan-400 ml-2"></i>
          </div>

          <div v-if="filteredOptions.length === 0" class="text-center py-4 text-xs font-mono text-gray-500">
            Tidak ada opsi yang cocok
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Pilih opsi...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(0);
const containerRef = ref(null);
const searchInputRef = ref(null);

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue) || null;
});

const filteredOptions = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return props.options;
  return props.options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
  );
});

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
    highlightedIndex.value = 0;
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
};

const selectOption = (opt) => {
  emit('update:modelValue', opt.value);
  emit('change', opt);
  isOpen.value = false;
};

const selectHighlighted = () => {
  if (filteredOptions.value.length > 0 && highlightedIndex.value >= 0) {
    const opt = filteredOptions.value[highlightedIndex.value];
    if (opt) selectOption(opt);
  }
};

const navigateDown = () => {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++;
  }
};

const navigateUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  }
};

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.4);
}
</style>
