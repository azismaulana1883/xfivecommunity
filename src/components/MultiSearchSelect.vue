<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { Search, ChevronDown, X, Check, MapPin, Sparkles } from 'lucide-vue-next';

export interface MultiSelectOption {
  id: string;
  name: string;
  subtitle?: string;
}

export interface MultiSelectPreset {
  label: string;
  values: string[];
}

const props = withDefaults(
  defineProps<{
    modelValue?: string[];
    options?: MultiSelectOption[];
    label?: string;
    placeholder?: string;
    presets?: MultiSelectPreset[];
    disabled?: boolean;
    id?: string;
  }>(),
  {
    modelValue: () => [],
    options: () => [],
    label: 'Target Wilayah Domisili (Tingkat II Pemprov)',
    placeholder: 'Cari & pilih 1 atau lebih wilayah...',
    presets: () => [],
    disabled: false,
    id: () => 'mss-' + Math.random().toString(36).substring(2, 9),
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string[]): void;
  (e: 'change', val: string[]): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

const selectedIds = computed<string[]>(() => {
  return Array.isArray(props.modelValue) ? props.modelValue : [];
});

const selectedItems = computed<MultiSelectOption[]>(() => {
  return selectedIds.value.map((id) => {
    const found = props.options.find((opt) => opt.id === id);
    return found || { id, name: id };
  });
});

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(q) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(q)) ||
      opt.id.toLowerCase().includes(q)
  );
});

const isSelected = (id: string) => {
  return selectedIds.value.includes(id);
};

const toggleOption = (id: string) => {
  if (props.disabled) return;
  const current = [...selectedIds.value];
  const idx = current.indexOf(id);

  if (idx > -1) {
    current.splice(idx, 1);
  } else {
    // Jika memilih NASIONAL, apakah mau reset yg lain atau biarkan?
    if (id === 'NASIONAL') {
      current.length = 0;
      current.push('NASIONAL');
    } else {
      // Jika sebelumnya ada NASIONAL dan admin memilih kota spesifik, hapus NASIONAL
      const nasIdx = current.indexOf('NASIONAL');
      if (nasIdx > -1) current.splice(nasIdx, 1);
      current.push(id);
    }
  }

  emit('update:modelValue', current);
  emit('change', current);
};

const removeOption = (id: string, ev?: Event) => {
  if (ev) ev.stopPropagation();
  if (props.disabled) return;
  const updated = selectedIds.value.filter((val) => val !== id);
  emit('update:modelValue', updated);
  emit('change', updated);
};

const applyPreset = (preset: MultiSelectPreset) => {
  if (props.disabled) return;
  emit('update:modelValue', [...preset.values]);
  emit('change', [...preset.values]);
};

const clearAll = (ev?: Event) => {
  if (ev) ev.stopPropagation();
  if (props.disabled) return;
  emit('update:modelValue', []);
  emit('change', []);
};

const toggleDropdown = () => {
  if (props.disabled) return;
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const openDropdown = () => {
  if (props.disabled) return;
  isOpen.value = true;
  searchQuery.value = '';
  nextTick(() => {
    searchInputRef.value?.focus();
  });
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = '';
};

const handleClickOutside = (event: MouseEvent) => {
  if (!containerRef.value) return;
  const target = event.target as Node;
  if (!containerRef.value.contains(target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
});
</script>

<template>
  <div ref="containerRef" class="relative w-full text-left font-sans select-none">
    <!-- Label & Badges Counter -->
    <div class="flex items-center justify-between mb-1.5">
      <label :for="id" class="block font-orbitron text-gray-300 uppercase tracking-wider text-xs font-bold flex items-center gap-1.5">
        <MapPin class="w-3.5 h-3.5 text-cyan-400" />
        <span>{{ label }}</span>
      </label>
      <div class="flex items-center gap-2">
        <span
          v-if="selectedIds.length > 0"
          class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold"
        >
          {{ selectedIds.length }} Wilayah Terpilih
        </span>
        <button
          v-if="selectedIds.length > 0 && !disabled"
          type="button"
          @click="clearAll"
          class="text-[10px] font-mono text-gray-400 hover:text-red-400 transition cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Trigger Input Box (Chips Display + Arrow) -->
    <div
      :id="id"
      @click="toggleDropdown"
      class="min-h-[42px] w-full p-2 rounded-xl bg-black/60 border transition-all cursor-pointer flex flex-wrap items-center gap-1.5 relative pr-8"
      :class="[
        isOpen
          ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.25)] ring-1 ring-cyan-400/50'
          : 'border-gray-800 hover:border-cyan-500/40',
        disabled ? 'opacity-50 cursor-not-allowed bg-black/30' : ''
      ]"
    >
      <!-- Selected Chips -->
      <template v-if="selectedItems.length > 0">
        <span
          v-for="item in selectedItems"
          :key="item.id"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition"
          :class="
            item.id === 'NASIONAL'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.15)]'
          "
        >
          <span>{{ item.name }}</span>
          <button
            type="button"
            @click="removeOption(item.id, $event)"
            class="hover:text-red-400 p-0.5 rounded transition cursor-pointer text-gray-400"
            title="Hapus wilayah ini"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
      </template>

      <!-- Placeholder when empty -->
      <span v-else class="text-xs text-gray-500 font-mono py-1 px-1">
        {{ placeholder }}
      </span>

      <!-- Trailing Chevron -->
      <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180 text-cyan-400': isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown Popover (Select Search + Presets + Options List) -->
    <div
      v-if="isOpen"
      class="absolute left-0 right-0 z-50 mt-1.5 bg-[#0b0f16] border border-cyan-500/50 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(0,255,255,0.15)] overflow-hidden animate-fade-in"
    >
      <!-- Search Input Header -->
      <div class="p-2 border-b border-white/10 bg-black/40">
        <div class="relative flex items-center">
          <Search class="w-3.5 h-3.5 absolute left-3 text-cyan-400 pointer-events-none" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Cari Kota / Kabupaten (Tingkat II)..."
            class="w-full pl-9 pr-3 py-1.5 text-xs bg-black/80 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
            @click.stop
          />
        </div>
      </div>

      <!-- Presets / Quick Actions -->
      <div v-if="presets.length > 0" class="p-2 bg-black/20 border-b border-white/5 flex items-center gap-1.5 flex-wrap">
        <span class="text-[10px] font-mono text-gray-400 flex items-center gap-1">
          <Sparkles class="w-3 h-3 text-cyan-400" /> Cepat:
        </span>
        <button
          v-for="preset in presets"
          :key="preset.label"
          type="button"
          @click="applyPreset(preset)"
          class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-gray-300 hover:text-cyan-300 transition cursor-pointer"
        >
          {{ preset.label }}
        </button>
      </div>

      <!-- Options List -->
      <ul class="max-h-60 overflow-y-auto py-1 divide-y divide-white/5 custom-scrollbar m-0 p-0 list-none">
        <li
          v-if="filteredOptions.length === 0"
          class="px-4 py-4 text-center text-xs text-gray-500 italic font-mono"
        >
          Tidak ada wilayah yang cocok dengan "{{ searchQuery }}"
        </li>

        <li
          v-for="opt in filteredOptions"
          :key="opt.id"
          @click="toggleOption(opt.id)"
          class="px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors"
          :class="[
            isSelected(opt.id)
              ? 'bg-cyan-500/15 text-cyan-200 font-semibold'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <!-- Custom Cyber Checkbox -->
            <div
              class="w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0"
              :class="
                isSelected(opt.id)
                  ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_8px_rgba(0,255,255,0.4)]'
                  : 'border-white/20 bg-black/40 text-transparent'
              "
            >
              <Check class="w-3 h-3 stroke-[3]" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="font-bold tracking-wide flex items-center gap-1.5" :class="isSelected(opt.id) ? 'text-cyan-300' : 'text-gray-200'">
                {{ opt.name }}
                <span
                  v-if="opt.id === 'NASIONAL'"
                  class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-normal uppercase"
                >
                  Akbar
                </span>
              </div>
              <div v-if="opt.subtitle" class="text-[10px] text-gray-400 font-mono truncate">
                {{ opt.subtitle }}
              </div>
            </div>
          </div>

          <span
            v-if="isSelected(opt.id)"
            class="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider shrink-0 ml-2"
          >
            Terpilih
          </span>
        </li>
      </ul>

      <!-- Footer Info -->
      <div class="p-2 border-t border-white/5 bg-black/40 text-[10px] text-gray-500 font-mono text-center">
        💡 Bisa memilih lebih dari 1 kota (misal: Bekasi & Depok, Jakarta & Tangerang).
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.4);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.3);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.6);
}
</style>
