<template>
  <section class="max-w-4xl mx-auto mb-16">
    <div class="text-center mb-10">
      <h2 class="text-2xl md:text-3xl font-bold font-orbitron text-white uppercase tracking-widest mb-3">Frequently Asked Questions</h2>
      <div class="w-20 h-1 bg-cyan-500 mx-auto rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]"></div>
      <p class="text-gray-400 mt-4 max-w-xl mx-auto text-xs md:text-sm">Pertanyaan yang sering diajukan mengenai komunitas XFIVE AyoDance.</p>
    </div>

    <div class="space-y-4">
      <div
        v-for="(faq, idx) in faqs"
        :key="idx"
        class="bg-[#161b22]/80 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        <button
          @click="toggleFaq(idx)"
          class="w-full flex justify-between items-center p-5 md:p-6 text-left text-white font-bold transition-colors focus:outline-none cursor-pointer"
        >
          <span class="text-sm md:text-base tracking-wide">{{ faq.q }}</span>
          <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 ml-4">
            <i
              class="fas fa-chevron-down transition-transform duration-300 text-cyan-400 text-xs"
              :class="{ 'rotate-180': openFaqIndex === idx }"
            ></i>
          </div>
        </button>
        <div
          v-show="openFaqIndex === idx"
          class="p-5 md:p-6 pt-0 text-gray-300 border-t border-white/5 mt-2 leading-relaxed text-xs md:text-sm"
        >
          {{ faq.a }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const faqs = [
  {
    q: 'AyoDance itu game apa?',
    a: 'AyoDance adalah game online rhythm/dance di mana kamu mengikuti beat musik dan menekan tombol sesuai timing untuk mendapatkan skor tertinggi (Perfect).'
  },
  {
    q: 'Apa itu XFIVE / X5?',
    a: 'XFIVE atau X5 adalah sebuah komunitas resmi dari game Audition AyoDance yang berfokus pada meetup dan gathering skala nasional di seluruh Indonesia.'
  },
  {
    q: 'Bagaimana cara bergabung ke XFIVE?',
    a: 'Kamu bisa mendaftar dengan cara mencari kami di server Love-01 dan menemukan Tester XFIVE yang sedang bertugas di sana, atau hubungi salah satu Tester melalui section Recruitment di website ini.'
  }
];

const openFaqIndex = ref(null);

function toggleFaq(idx) {
  openFaqIndex.value = openFaqIndex.value === idx ? null : idx;
}
</script>
