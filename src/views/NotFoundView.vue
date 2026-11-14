<template>
  <main class="min-h-[80vh] flex items-center justify-center relative z-10 px-4 py-16">
    <div class="text-center max-w-lg mx-auto">
      <div class="w-28 h-28 mx-auto mb-8 relative animate-bounce">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-[0_0_25px_rgba(0,255,255,0.4)]">
          <circle cx="60" cy="60" r="54" stroke="#00ffff" stroke-width="2" stroke-dasharray="6 6" opacity="0.4" />
          <path d="M40 78c0-11 9-20 20-20s20 9 20 20" stroke="#00ffff" stroke-width="3" stroke-linecap="round" />
          <circle cx="46" cy="46" r="5" fill="#00ffff" />
          <circle cx="74" cy="46" r="5" fill="#00ffff" />
          <path d="M48 36l6 4M72 36l-6 4" stroke="#00ffff" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>

      <div class="inline-block px-4 py-1.5 mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-[0.25em] uppercase font-orbitron">
        Error 404
      </div>

      <h1 class="text-3xl md:text-5xl font-bold font-orbitron text-white uppercase tracking-wider mb-4">
        Halaman Tidak Ditemukan
      </h1>

      <p class="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
        Maaf, halaman yang Anda cari tidak tersedia, telah dihapus, atau link yang Anda tuju salah.
      </p>

      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-orbitron text-sm font-bold tracking-wider hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all uppercase"
      >
        <i class="fas fa-home"></i> Kembali ke Beranda
      </router-link>
    </div>
  </main>
</template>

<script setup>
</script>

