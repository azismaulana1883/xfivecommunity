<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { Search, ChevronDown, X, Check, Loader2 } from 'lucide-vue-next';

interface OptionItem {
  id: string | number;
  name: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: any[];
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    valid?: boolean;
    icon?: any;
    id?: string;
  }>(),
  {
    modelValue: '',
    options: () => [],
    label: '',
    placeholder: 'Pilih...',
    disabled: false,
    loading: false,
    invalid: false,
    valid: false,
    id: () => 'ss-' + Math.random().toString(36).substring(2, 9),
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void;
  (e: 'change', val: string | number): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const activeIndex = ref(-1);

// Normalize options to { id: string, name: string }
const normalizedOptions = computed<OptionItem[]>(() => {
  if (!Array.isArray(props.options)) return [];
  return props.options
    .filter((opt) => opt !== null && opt !== undefined)
    .map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { id: String(opt), name: String(opt) };
      }
      const id = opt.id !== undefined && opt.id !== null ? String(opt.id) : (opt.value !== undefined && opt.value !== null ? String(opt.value) : '');
      const name = opt.name !== undefined && opt.name !== null ? String(opt.name) : (opt.label !== undefined && opt.label !== null ? String(opt.label) : String(id));
      return { id, name };
    });
});

const selectedItem = computed(() => {
  if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) {
    return null;
  }
  const strVal = String(props.modelValue);
  return normalizedOptions.value.find((opt) => opt.id === strVal) || null;
});

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return normalizedOptions.value;
  return normalizedOptions.value.filter((opt) => opt.name.toLowerCase().includes(q));
});

const toggleDropdown = () => {
  if (props.disabled || props.loading) return;
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const openDropdown = () => {
  if (props.disabled || props.loading) return;
  isOpen.value = true;
  searchQuery.value = '';
  activeIndex.value = -1;
  nextTick(() => {
    searchInputRef.value?.focus();
  });
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = '';
  activeIndex.value = -1;
};

const selectOption = (opt: OptionItem) => {
  emit('update:modelValue', opt.id);
  emit('change', opt.id);
  closeDropdown();
};

const clearSelection = (e: MouseEvent) => {
  e.stopPropagation();
  emit('update:modelValue', '');
  emit('change', '');
};

const onKeyDown = (e: KeyboardEvent) => {
  if (!isOpen.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openDropdown();
    }
    return;
  }

  if (e.key === 'Escape') {
    e.preventDefault();
    closeDropdown();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (activeIndex.value < filteredOptions.value.length - 1) {
      activeIndex.value++;
      scrollToActive();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (activeIndex.value > 0) {
      activeIndex.value--;
      scrollToActive();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (activeIndex.value >= 0 && activeIndex.value < filteredOptions.value.length) {
      selectOption(filteredOptions.value[activeIndex.value]);
    } else if (filteredOptions.value.length === 1) {
      selectOption(filteredOptions.value[0]);
    }
  }
};

const scrollToActive = () => {
  nextTick(() => {
    if (!listRef.value) return;
    const items = listRef.value.querySelectorAll('.option-item');
    if (items[activeIndex.value]) {
      (items[activeIndex.value] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  });
};

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div ref="containerRef" class="relative w-full text-left" @keydown="onKeyDown">
    <!-- Trigger Box -->
    <div
      :id="id"
      tabindex="0"
      @click="toggleDropdown"
      class="select2-trigger relative flex items-center w-full px-3.5 py-2.5 rounded-xl border bg-black/60 transition-all cursor-pointer select-none"
      :class="[
        disabled ? 'opacity-40 cursor-not-allowed border-gray-800' : 'hover:border-cyan-400/60',
        isOpen ? 'border-cyan-400 ring-1 ring-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : (
          invalid ? 'border-red-500/80' : (valid ? 'border-green-600/70' : 'border-gray-800')
        )
      ]"
    >
      <!-- Leading Icon -->
      <component
        v-if="icon"
        :is="icon"
        class="w-4 h-4 mr-2.5 transition-colors flex-shrink-0"
        :class="isOpen ? 'text-neon-blue' : 'text-gray-500'"
      />

      <!-- Text Container (Label + Value) -->
      <div class="flex-1 min-w-0 pr-6">
        <span
          class="block text-[10px] uppercase tracking-wider font-bold transition-all"
          :class="isOpen || selectedItem ? 'text-neon-blue' : 'text-gray-400'"
        >
          {{ label }}
        </span>
        <span
          class="block text-sm truncate font-medium mt-0.5"
          :class="selectedItem ? 'text-white' : 'text-gray-500'"
        >
          {{ selectedItem ? selectedItem.name : (placeholder || 'Pilih...') }}
        </span>
      </div>

      <!-- Trailing Action: Loading / Clear / Arrow -->
      <div class="absolute right-3 flex items-center gap-1.5 text-gray-400">
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin text-cyan-400" />
        <button
          v-else-if="selectedItem && !disabled"
          type="button"
          @click="clearSelection"
          class="p-1 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
          title="Reset pilihan"
        >
          <X class="w-3.5 h-3.5" />
        </button>
        <ChevronDown
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180 text-cyan-400': isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown Popover (Select2 style search + list) -->
    <div
      v-if="isOpen"
      class="absolute left-0 right-0 z-50 mt-1.5 bg-[#0b0f16] border border-cyan-500/50 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,255,0.15)] overflow-hidden animate-fade-in"
    >
      <!-- Search Input Header -->
      <div class="p-2 border-b border-gray-800/80 bg-black/40">
        <div class="relative flex items-center">
          <Search class="w-3.5 h-3.5 absolute left-3 text-cyan-400 pointer-events-none" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="'Cari ' + (label || 'pilihan') + '...'"
            class="w-full pl-9 pr-3 py-1.5 text-xs bg-black/80 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-sans"
            @keydown.stop="onKeyDown"
          />
        </div>
      </div>

      <!-- Options List -->
      <ul
        ref="listRef"
        class="max-h-56 overflow-y-auto py-1 divide-y divide-gray-900/60 custom-scrollbar m-0 p-0 list-none"
      >
        <li
          v-if="filteredOptions.length === 0"
          class="px-4 py-4 text-center text-xs text-gray-500 italic"
        >
          Tidak ada hasil untuk "{{ searchQuery }}"
        </li>

        <li
          v-for="(opt, idx) in filteredOptions"
          :key="opt.id"
          @click="selectOption(opt)"
          class="option-item px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors"
          :class="[
            opt.id === String(modelValue)
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400'
              : (activeIndex === idx ? 'bg-cyan-950/40 text-cyan-200' : 'text-gray-300 hover:bg-cyan-950/30 hover:text-cyan-200')
          ]"
        >
          <span class="truncate">{{ opt.name }}</span>
          <Check
            v-if="opt.id === String(modelValue)"
            class="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 ml-2"
          />
        </li>
      </ul>

      <!-- Footer count -->
      <div class="px-3 py-1.5 text-[10px] text-gray-500 bg-black/60 border-t border-gray-800/60 flex justify-between items-center font-mono">
        <span>{{ filteredOptions.length }} pilihan</span>
        <span class="text-gray-600">Ketik untuk menyaring</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.4);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.25);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}
</style>

