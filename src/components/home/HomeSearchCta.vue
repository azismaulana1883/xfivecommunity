<template>
  <section class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/70 via-[#0d1422] to-purple-950/60 border border-cyan-500/40 p-6 sm:p-8 md:p-10 shadow-[0_0_40px_rgba(0,255,255,0.12)]">
    <div class="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div class="space-y-2 max-w-xl">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-black font-orbitron text-white uppercase tracking-wider drop-shadow-md">
          MAU CARI MEMBER XFIVE?
        </h2>
        <p class="text-xs sm:text-sm text-gray-300 font-mono leading-relaxed">
          Cek keaslian akun, domisili wilayah, dan lihat profil lengkap 500+ anggota resmi komunitas XFIVE AyoDance.
        </p>
      </div>

      <RouterLink
        to="/member-list"
        class="px-8 sm:px-10 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-black font-orbitron uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.7)] hover:scale-105 active:scale-95 shrink-0 flex items-center gap-3 cursor-pointer"
      >
        <span>KLIK DISINI</span>
        <i class="fas fa-arrow-right text-xs"></i>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>
