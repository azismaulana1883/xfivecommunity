<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div class="relative w-full max-w-2xl bg-[#0c1017] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,255,255,0.15)] my-8">
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-none"
        >
          <i class="fas fa-times text-lg"></i>
        </button>

        <div class="flex items-center gap-3 mb-6 border-b border-cyan-500/20 pb-4">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <i class="fas fa-user-edit text-lg"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold font-orbitron text-white">EDIT DATA PROFIL</h3>
            <p class="text-xs text-gray-400">
              Anggota: <span class="text-cyan-400 font-semibold">{{ member?.nickname }}</span>
            </p>
          </div>
        </div>

        <div class="mb-5 p-4 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/50 space-y-2">
          <label class="block text-xs font-orbitron uppercase tracking-wider text-fuchsia-300 font-bold flex items-center gap-1.5">
            <i class="fas fa-key text-fuchsia-400"></i> KUNCI EDIT PROFIL (UNIQUE CODE EDIT) *
          </label>
          <input
            v-model="editForm.unique_code_edit"
            type="text"
            placeholder="CONTOH: X5-EDIT-XXXXXX"
            maxlength="64"
            class="w-full px-4 py-2.5 rounded-lg bg-black/80 border border-fuchsia-500/60 focus:border-fuchsia-400 text-fuchsia-200 font-mono text-sm tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
            required
          />
          <p class="text-[11px] text-gray-400">
            Masukkan kunci rahasia yang kamu dapatkan saat selesai mendaftar. Hanya pemilik kunci yang dapat mengubah data profil ini.
          </p>
        </div>

        <form @submit.prevent="submitMemberEdit" class="space-y-4">
          <div v-if="!member?.can_edit_full" class="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-start gap-2.5">
            <i class="fas fa-shield-alt text-cyan-400 mt-0.5 text-sm flex-shrink-0"></i>
            <div class="leading-relaxed">
              <span class="font-bold text-white font-orbitron">Mode Edit Mandiri Standar:</span>
              Secara default hanya <strong>Nickname Ayodance</strong> yang dapat diperbarui. Kolom Nama, Domisili, dan Gender disembunyikan demi keamanan data. Hubungi Dewan Staff / Admin jika membutuhkan pembaruan data identitas penuh.
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-cyan-300 mb-1 font-semibold flex items-center justify-between">
              <span>Nickname Ayodance *</span>
              <span class="text-[10px] text-gray-400 font-mono">Dapat diedit mandiri</span>
            </label>
            <input
              v-model="editForm.nickname"
              type="text"
              maxlength="30"
              placeholder="Contoh: -RamsX5-"
              class="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-cyan-500/40 focus:border-cyan-400 text-cyan-300 font-orbitron text-sm focus:outline-none font-bold shadow-[0_0_15px_rgba(0,255,255,0.08)]"
              required
            />
          </div>

          <template v-if="member?.can_edit_full">
            <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <i class="fas fa-unlock-alt text-emerald-400"></i>
              <span><strong>Akses Edit Penuh Aktif:</strong> Kamu diizinkan untuk memperbarui seluruh data profil &amp; identitas.</span>
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">Nama Lengkap / Panggilan *</label>
              <input
                v-model="editForm.name"
                type="text"
                maxlength="50"
                class="w-full px-3.5 py-2 rounded-lg bg-black/60 border border-cyan-500/30 focus:border-cyan-400 text-white text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">Domisili</label>
              <input
                v-model="editForm.domisili"
                type="text"
                maxlength="150"
                placeholder="Contoh: Kota Bandung, Jawa Barat"
                class="w-full px-3.5 py-2 rounded-lg bg-black/60 border border-cyan-500/30 focus:border-cyan-400 text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">Quote Profil</label>
              <input
                v-model="editForm.quote"
                type="text"
                maxlength="150"
                placeholder="Quote singkat kamu..."
                class="w-full px-3.5 py-2 rounded-lg bg-black/60 border border-cyan-500/30 focus:border-cyan-400 text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">Deskripsi / Bio Lengkap</label>
              <textarea
                v-model="editForm.description"
                rows="3"
                maxlength="300"
                placeholder="Ceritakan sedikit tentang dirimu atau pencapaianmu di game..."
                class="w-full px-3.5 py-2 rounded-lg bg-black/60 border border-cyan-500/30 focus:border-cyan-400 text-white text-sm focus:outline-none resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">Gender</label>
                <select
                  v-model="editForm.gender"
                  class="w-full px-3.5 py-2 rounded-lg bg-[#0b0f16] border border-cyan-500/30 focus:border-cyan-400 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="-">- Pilih Gender -</option>
                  <option value="male">Laki-laki (Male)</option>
                  <option value="female">Perempuan (Female)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">Instagram (URL)</label>
                <input
                  v-model="editForm.instagram"
                  type="text"
                  placeholder="https://instagram.com/..."
                  class="w-full px-3.5 py-2 rounded-lg bg-black/60 border border-cyan-500/30 focus:border-cyan-400 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">Facebook (URL)</label>
                <input
                  v-model="editForm.facebook"
                  type="text"
                  placeholder="https://facebook.com/..."
                  class="w-full px-3.5 py-2 rounded-lg bg-black/60 border border-cyan-500/30 focus:border-cyan-400 text-white text-sm focus:outline-none"
                />
              </div>
            </div>
          </template>

          <div v-if="editError" class="p-3 rounded-lg bg-red-950/70 border border-red-500 text-red-200 text-xs flex items-center gap-2">
            <i class="fas fa-exclamation-triangle text-red-400"></i>
            <span>{{ editError }}</span>
          </div>

          <div v-if="editSuccess" class="p-3 rounded-lg bg-green-950/70 border border-green-500 text-green-200 text-xs flex items-center gap-2">
            <i class="fas fa-check-circle text-green-400"></i>
            <span>{{ editSuccess }}</span>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              @click="closeModal"
              :disabled="isSavingEdit"
              class="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSavingEdit"
              class="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer border-none font-orbitron"
            >
              <i v-if="isSavingEdit" class="fas fa-circle-notch fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              <span>{{ isSavingEdit ? 'Menyimpan...' : 'Simpan Profil' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  member: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'updated']);

const isSavingEdit = ref(false);
const editError = ref('');
const editSuccess = ref('');

const editForm = reactive({
  unique_code_edit: '',
  name: '',
  nickname: '',
  quote: '',
  description: '',
  domisili: '',
  gender: '-',
  facebook: '',
  instagram: '',
  twitter: ''
});

watch(() => props.show, (newVal) => {
  if (newVal && props.member) {
    editForm.unique_code_edit = '';
    editForm.name = props.member.name || '';
    editForm.nickname = props.member.nickname || '';
    editForm.quote = props.member.quote || '';
    editForm.description = props.member.description || '';
    editForm.domisili = props.member.domisili || '';
    editForm.gender = props.member.gender || '-';
    editForm.facebook = props.member.facebook || '';
    editForm.instagram = props.member.instagram || '';
    editForm.twitter = props.member.twitter || '';
    editError.value = '';
    editSuccess.value = '';
  }
});

function closeModal() {
  if (isSavingEdit.value) return;
  emit('close');
}

async function submitMemberEdit() {
  if (!editForm.unique_code_edit.trim()) {
    editError.value = 'Kunci Edit Profil (Unique Code Edit) wajib dimasukkan.';
    return;
  }
  if (!editForm.nickname.trim()) {
    editError.value = 'Nickname Ayodance tidak boleh kosong.';
    return;
  }
  if (props.member?.can_edit_full && !editForm.name.trim()) {
    editError.value = 'Nama lengkap / panggilan tidak boleh kosong.';
    return;
  }

  isSavingEdit.value = true;
  editError.value = '';
  editSuccess.value = '';

  try {
    const slug = props.member.slug;
    const payload = {
      member_code: props.member.member_code,
      unique_code_edit: editForm.unique_code_edit.trim(),
      nickname: editForm.nickname.trim()
    };

    if (props.member?.can_edit_full) {
      payload.name = editForm.name.trim();
      payload.quote = editForm.quote.trim();
      payload.description = editForm.description.trim();
      payload.domisili = editForm.domisili.trim();
      payload.gender = editForm.gender;
      payload.facebook = editForm.facebook.trim();
      payload.instagram = editForm.instagram.trim();
      payload.twitter = editForm.twitter.trim();
    }

    const response = await fetch(`/api/v1/members/${slug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();

    if (!response.ok || !resData.success) {
      throw new Error(resData.message || 'Gagal menyimpan perubahan.');
    }

    editSuccess.value = 'Profil berhasil diperbarui!';
    toast.success('Profil kamu berhasil diperbarui!');

    if (resData.data) {
      emit('updated', resData.data);
    }

    setTimeout(() => {
      emit('close');
    }, 1200);
  } catch (err) {
    editError.value = err.message || 'Terjadi kesalahan saat menyimpan profil.';
  } finally {
    isSavingEdit.value = false;
  }
}
</script>
