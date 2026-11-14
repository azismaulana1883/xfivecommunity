<template>
  <section id="recruitment-section" class="mb-12 bg-[#0d1117]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
    <div class="flex flex-col gap-6 mb-8 text-center md:text-left">
      <div class="flex flex-col md:flex-row items-center gap-4">
        <h2 class="text-2xl md:text-3xl font-bold font-orbitron text-fuchsia-400 uppercase tracking-widest">Recruitment Tester</h2>
        <div class="flex items-center text-xs font-bold tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/30">
          <span class="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
          <span class="text-green-400">ACTIVE</span>
        </div>
      </div>
      <p class="text-gray-300 max-w-2xl mx-auto md:mx-0 text-sm">
        Pilih tester yang sedang online dan hubungi mereka melalui WhatsApp untuk memulai proses briefing keanggotaan.
      </p>
    </div>

    <div class="max-w-4xl mx-auto">
      <div class="bg-[#0b1016]/90 border border-white/5 rounded-xl p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 transition-all shadow-xl">
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <label for="tester-select" class="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2 font-orbitron">Pilih Tester</label>
            <div class="relative mb-6">
              <select
                id="tester-select"
                v-model="selectedTesterIndex"
                class="w-full bg-[#161b22] border border-cyan-500/30 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer text-sm font-mono"
              >
                <option v-for="(tester, idx) in testers" :key="tester.name" :value="idx" class="bg-[#0a0f18] text-white">
                  {{ tester.name }} ({{ tester.status === 'online' ? 'Online' : 'Offline' }})
                </option>
              </select>
              <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none text-xs"></i>
            </div>

            <div class="space-y-4 mb-6">
              <div class="flex items-center gap-3">
                <span class="text-gray-400 text-xs font-mono">Status Saat Ini:</span>
                <div class="flex items-center gap-2 bg-[#161b22] px-3 py-1.5 rounded-full border border-white/5">
                  <div
                    class="w-2.5 h-2.5 rounded-full"
                    :class="currentTester.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 animate-pulse'"
                  ></div>
                  <span :class="currentTester.status === 'online' ? 'text-green-400' : 'text-red-400'" class="text-xs font-bold uppercase tracking-wider font-mono">
                    {{ currentTester.status }}
                  </span>
                </div>
              </div>

              <p class="text-xs text-gray-400 leading-relaxed">
                Hubungi <strong class="text-white">{{ currentTester.name }}</strong> langsung melalui WhatsApp untuk konsultasi atau jadwal briefing.
              </p>
            </div>
          </div>

          <a
            :href="currentTester.link"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-3.5 px-6 rounded-xl border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center font-bold tracking-widest transition-all uppercase text-cyan-400 hover:text-white hover:bg-cyan-500/10 text-xs font-orbitron"
          >
            Hubungi {{ currentTester.name }} <i class="fab fa-whatsapp ml-2 text-lg"></i>
          </a>
        </div>

        <div class="hidden md:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

        <div class="flex flex-col items-center justify-center flex-1">
          <div
            class="p-3 rounded-2xl mb-4 bg-gradient-to-tr from-cyan-500/20 to-fuchsia-500/20"
            style="box-shadow: 0 0 30px rgba(0, 240, 255, 0.1);"
          >
            <div class="bg-white p-4 rounded-xl flex items-center justify-center min-w-[212px] min-h-[212px]">
              <div ref="qrContainerRef" class="qr-code-container flex items-center justify-center"></div>
            </div>
          </div>
          <button
            type="button"
            @click="downloadQR"
            class="text-xs font-bold tracking-widest text-gray-400 hover:text-white uppercase transition-colors flex items-center gap-2 mt-2 cursor-pointer bg-transparent border-none font-mono"
          >
            <i class="fas fa-download"></i> Download QR
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  testers: {
    type: Array,
    required: true
  }
});

const selectedTesterIndex = ref(0);
const currentTester = computed(() => props.testers[selectedTesterIndex.value] || props.testers[0]);
const qrContainerRef = ref(null);

function renderQRCode() {
  if (!qrContainerRef.value || !currentTester.value) return;
  qrContainerRef.value.innerHTML = '';
  const currentLink = currentTester.value.link;

  if (typeof window.QRCode !== 'undefined') {
    new window.QRCode(qrContainerRef.value, {
      text: currentLink,
      width: 180,
      height: 180,
      correctLevel: window.QRCode.CorrectLevel.H,
      colorDark: '#000000',
      colorLight: '#ffffff'
    });
  } else if (typeof window.QRious !== 'undefined') {
    const canvas = document.createElement('canvas');
    new window.QRious({
      element: canvas,
      value: currentLink,
      size: 180,
      level: 'H'
    });
    qrContainerRef.value.appendChild(canvas);
  } else {
    setTimeout(renderQRCode, 200);
  }
}

function downloadQR() {
  if (!qrContainerRef.value) return;
  const canvas = qrContainerRef.value.querySelector('canvas');
  const img = qrContainerRef.value.querySelector('img');
  let url = '';
  if (canvas) {
    url = canvas.toDataURL('image/png');
  } else if (img) {
    url = img.src;
  }
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = `QR-${currentTester.value.name}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

watch(selectedTesterIndex, () => {
  nextTick(() => {
    renderQRCode();
  });
});

onMounted(() => {
  nextTick(() => {
    renderQRCode();
  });
});
</script>
