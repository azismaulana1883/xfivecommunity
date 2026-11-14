<template>
  <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0e14] via-[#0d131d] to-[#121820] border border-cyan-500/20 shadow-[0_0_50px_rgba(0,255,255,0.06)] p-6 sm:p-8 md:p-12 pt-10 md:pt-14">
    <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-fuchsia-500 shadow-[0_0_15px_rgba(0,255,255,0.8)]"></div>
    <div class="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 grid grid-cols-1 lg:grid-cols-[52%_48%] gap-8 lg:gap-12 items-center">
      <div class="w-full flex justify-center order-1 lg:order-1 hero-image-wrapper">
        <div class="relative group">
          <img
            src="/img/xfive-team2.webp"
            alt="Tim XFIVE Community"
            class="w-full max-w-md lg:max-w-lg h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-102"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0e14]/60 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
        </div>
      </div>

      <div class="w-full order-2 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,255,255,0.2)] font-orbitron">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>XFIVE Community</span>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight font-orbitron drop-shadow-md tracking-wide">
          DAFTAR ANGGOTA <br class="hidden sm:block"/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-500 drop-shadow-[0_0_12px_rgba(0,255,255,0.6)]">
            XFIVE
          </span>
        </h1>

        <p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
          Selamat datang di XFIVE Community AyoDance. Website ini memuat informasi resmi mengenai anggota komunitas XFIVE. Hanya nickname yang terdaftar di sini yang diakui sebagai member resmi.
        </p>

        <div class="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
          <button
            type="button"
            @click="$emit('open-tester')"
            class="px-6 sm:px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest text-xs font-orbitron transition-all shadow-[0_0_25px_rgba(0,255,255,0.4)] flex items-center gap-2 cursor-pointer"
          >
            <i class="fab fa-whatsapp text-sm"></i>
            <span>Hubungi Tester</span>
          </button>

          <RouterLink
            to="/member-list"
            class="px-6 sm:px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-bold uppercase tracking-widest text-xs font-orbitron transition-all flex items-center gap-2"
          >
            <i class="fas fa-users text-xs"></i>
            <span>Lihat Member</span>
          </RouterLink>
        </div>

        <div class="flex items-center justify-center lg:justify-start gap-6 border-t border-white/10 pt-5 mt-2 w-full max-w-md">
          <div class="flex flex-col text-left">
            <span class="text-cyan-400 font-bold text-2xl font-orbitron">{{ totalMembersCount || 500 }}+</span>
            <span class="text-gray-500 text-[10px] uppercase tracking-widest font-mono">Total Member</span>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <div class="flex flex-col text-left">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
              <span class="text-emerald-400 font-bold text-sm uppercase tracking-wider font-orbitron">Online</span>
            </div>
            <span class="text-gray-500 text-[10px] uppercase tracking-widest font-mono mt-0.5">System Status</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  totalMembersCount: {
    type: Number,
    default: 500
  }
});

defineEmits(['open-tester']);
</script>
