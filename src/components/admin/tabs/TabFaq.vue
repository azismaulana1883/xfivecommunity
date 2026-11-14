<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  HelpCircle,
  Plus,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-vue-next';
import { useAdminFaq, type FaqItem } from '@/composables/admin/useAdminFaq';

const { faqsList, loadingFaqs, fetchFaqs, saveFaq, deleteFaq } = useAdminFaq();

const faqSearch = ref('');
const faqModalOpen = ref(false);
const deleteFaqModalOpen = ref(false);
const isSavingFaq = ref(false);
const isDeletingFaq = ref(false);
const faqFormError = ref('');
const faqToDelete = ref<FaqItem | null>(null);

const faqForm = reactive({
  id: null as number | null,
  question: '',
  answer: '',
  order_index: 0,
});

onMounted(() => {
  if (faqsList.value.length === 0) {
    fetchFaqs();
  }
});

const filteredFaqs = computed(() => {
  if (!faqSearch.value.trim()) return faqsList.value;
  const q = faqSearch.value.toLowerCase().trim();
  return faqsList.value.filter(
    (f) =>
      (f.question && f.question.toLowerCase().includes(q)) ||
      (f.answer && f.answer.toLowerCase().includes(q))
  );
});

const openAddFaqModal = () => {
  faqForm.id = null;
  faqForm.question = '';
  faqForm.answer = '';
  faqForm.order_index = faqsList.value.length + 1;
  faqFormError.value = '';
  faqModalOpen.value = true;
};

const openEditFaqModal = (faq: FaqItem) => {
  faqForm.id = faq.id;
  faqForm.question = faq.question;
  faqForm.answer = faq.answer;
  faqForm.order_index = faq.order_index || 0;
  faqFormError.value = '';
  faqModalOpen.value = true;
};

const handleSaveFaq = async () => {
  faqFormError.value = '';
  if (!faqForm.question.trim() || !faqForm.answer.trim()) {
    faqFormError.value = 'Pertanyaan dan jawaban FAQ wajib diisi.';
    return;
  }

  isSavingFaq.value = true;
  const result = await saveFaq({
    id: faqForm.id,
    question: faqForm.question,
    answer: faqForm.answer,
    order_index: faqForm.order_index,
  });

  if (result.success) {
    faqModalOpen.value = false;
  } else {
    faqFormError.value = result.message || 'Gagal menyimpan FAQ.';
  }
  isSavingFaq.value = false;
};

const promptDeleteFaq = (faq: FaqItem) => {
  faqToDelete.value = faq;
  deleteFaqModalOpen.value = true;
};

const confirmDeleteFaq = async () => {
  if (!faqToDelete.value) return;
  isDeletingFaq.value = true;
  const result = await deleteFaq(faqToDelete.value.id);
  if (result.success) {
    deleteFaqModalOpen.value = false;
    faqToDelete.value = null;
  }
  isDeletingFaq.value = false;
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="rounded-2xl border border-cyan-500/20 bg-[#0c121e]/80 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <h3 class="text-sm font-bold font-orbitron text-cyan-400 flex items-center gap-2">
          <HelpCircle class="w-4 h-4" /> FAQ DATABASE MANAGEMENT
        </h3>
        <p class="text-xs text-gray-400 font-mono mt-0.5">Pertanyaan FAQ disimpan langsung di database MySQL `faqs`.</p>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <input
          v-model="faqSearch"
          type="text"
          placeholder="Cari FAQ..."
          class="px-3.5 py-2 rounded-xl bg-black/60 border border-gray-800 text-white text-xs outline-none font-mono flex-1 sm:w-60"
        />
        <button
          @click="openAddFaqModal"
          class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(0,255,255,0.2)] flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>TAMBAH FAQ</span>
        </button>
      </div>
    </div>

    <div class="rounded-2xl border border-white/5 bg-[#0c121e]/80 overflow-hidden shadow-xl">
      <div v-if="loadingFaqs" class="text-center py-12 text-gray-500 font-mono">
        <RefreshCw class="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
        Memuat data FAQ dari database...
      </div>
      <div v-else-if="filteredFaqs.length === 0" class="text-center py-12 text-gray-500 font-mono">
        Tidak ada data FAQ yang cocok.
      </div>
      <div v-else class="divide-y divide-white/5">
        <div
          v-for="faq in filteredFaqs"
          :key="faq.id"
          class="p-5 hover:bg-white/[0.02] transition flex flex-col sm:flex-row justify-between items-start gap-4"
        >
          <div class="space-y-2 flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                ID: {{ faq.id }}
              </span>
              <span v-if="faq.order_index" class="text-[10px] text-gray-500 font-mono">
                Order: #{{ faq.order_index }}
              </span>
            </div>
            <h4 class="font-bold text-white text-sm font-orbitron tracking-wide">
              {{ faq.question }}
            </h4>
            <p class="text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-line">
              {{ faq.answer }}
            </p>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            <button
              @click="openEditFaqModal(faq)"
              class="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Edit class="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              @click="promptDeleteFaq(faq)"
              class="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add / Edit FAQ -->
    <Teleport to="body">
      <div
        v-if="faqModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      >
        <div class="rounded-2xl border border-cyan-500/40 bg-[#0d121c] p-3.5 sm:p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,255,255,0.2)] max-h-[92vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/5">
            <div class="flex items-center gap-2.5 text-cyan-400 font-orbitron font-bold text-sm sm:text-base">
              <HelpCircle class="w-5 h-5" />
              <span>{{ faqForm.id ? 'EDIT FAQ' : 'TAMBAH FAQ BARU' }}</span>
            </div>
            <button @click="faqModalOpen = false" class="text-gray-400 hover:text-white cursor-pointer text-sm sm:text-base">✕</button>
          </div>

          <form @submit.prevent="handleSaveFaq" class="space-y-4 text-xs">
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">
                Pertanyaan (Question)
              </label>
              <input
                v-model="faqForm.question"
                type="text"
                required
                placeholder="Contoh: Apa itu XFIVE?"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">
                Jawaban (Answer)
              </label>
              <textarea
                v-model="faqForm.answer"
                rows="4"
                required
                placeholder="Tuliskan jawaban lengkap di sini..."
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white text-xs outline-none leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">
                Urutan Tampilan (Order Index)
              </label>
              <input
                v-model.number="faqForm.order_index"
                type="number"
                min="0"
                class="w-32 p-2.5 rounded-xl bg-black/60 border border-gray-800 text-cyan-300 font-mono text-xs outline-none"
              />
              <p class="text-[10px] text-gray-500 mt-1">Angka terkecil akan tampil paling atas.</p>
            </div>

            <div v-if="faqFormError" class="p-2.5 rounded-lg bg-red-950/80 border border-red-500 text-red-300 text-xs">
              {{ faqFormError }}
            </div>

            <div class="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-white/5">
              <button
                type="button"
                @click="faqModalOpen = false"
                class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSavingFaq"
                class="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw v-if="isSavingFaq" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ isSavingFaq ? 'Menyimpan...' : 'Simpan FAQ' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Delete FAQ Confirmation -->
    <Teleport to="body">
      <div
        v-if="deleteFaqModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      >
        <div class="rounded-2xl border border-red-500/40 bg-[#0d121c] p-4 sm:p-6 w-full max-w-md shadow-2xl">
          <h3 class="font-bold font-orbitron text-sm sm:text-base text-white mb-2">Hapus FAQ Dari Database?</h3>
          <p class="text-xs text-gray-300 mb-2">
            Apakah kamu yakin ingin menghapus FAQ berikut dari database?
          </p>
          <div v-if="faqToDelete" class="p-3 rounded-xl bg-black/60 border border-white/10 mb-4 font-mono text-xs">
            <div class="text-cyan-400 font-bold mb-1">ID: {{ faqToDelete.id }}</div>
            <div class="text-white">{{ faqToDelete.question }}</div>
          </div>

          <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              @click="deleteFaqModalOpen = false"
              class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="button"
              @click="confirmDeleteFaq"
              :disabled="isDeletingFaq"
              class="w-full sm:w-auto px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw v-if="isDeletingFaq" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isDeletingFaq ? 'Menghapus...' : 'Ya, Hapus FAQ' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
