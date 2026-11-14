<template>
  <footer class="relative z-10 mt-auto bg-[#070a0f] border-t border-cyan-500/20 text-gray-300 overflow-hidden font-sans">
    <!-- Subtle Top Ambient Glow Accent -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none"></div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-cyan-500/10">
        
        <!-- BRAND & IDENTITY (Left Column: spans 4 columns on large screens) -->
        <div class="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
          <!-- Logo & Title -->
          <RouterLink to="/" class="inline-flex items-center gap-3 group">
            <div class="relative w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center p-2 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all duration-300">
              <img src="/xfive.svg" alt="XFIVE Logo" class="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
            </div>
            <div class="flex flex-col">
              <span class="font-orbitron font-extrabold text-lg sm:text-xl tracking-wider text-white">
                XFIVE<span class="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">COMMUNITY</span>
              </span>
              <span class="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase -mt-0.5">Audition AyoDance Indonesia</span>
            </div>
          </RouterLink>

          <!-- Description -->
          <p class="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
            Komunitas Resmi Audition AyoDance Love-01. Menjunjung sportivitas, persaudaraan, dan eksistensi kompetitif sejak awal terbentuk.
          </p>

          <!-- Social Links -->
          <div class="pt-1 flex items-center gap-2.5">
            <a
              :href="instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 text-gray-400 hover:text-pink-400 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm cursor-pointer"
              title="Instagram @xfive.au"
              aria-label="Instagram XFIVE"
            >
              <i class="fab fa-instagram text-sm"></i>
            </a>
            <a
              :href="facebookUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm cursor-pointer"
              title="Facebook Official"
              aria-label="Facebook XFIVE"
            >
              <i class="fab fa-facebook-f text-sm"></i>
            </a>
            <RouterLink
              to="/register"
              class="h-9 px-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 text-cyan-400 hover:text-white flex items-center gap-2 text-xs font-mono transition-all duration-200 cursor-pointer"
              title="Pendaftaran Anggota"
            >
              <i class="fas fa-user-plus text-[11px]"></i>
              <span>Join Now</span>
            </RouterLink>
          </div>
        </div>

        <!-- NAVIGATION COLUMNS (Right Grid: spans 8 columns, 2 cols on mobile, 4 cols on desktop) -->
        <div class="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          
          <!-- Column 1: UTAMA -->
          <div class="space-y-3">
            <h3 class="font-orbitron font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.8)]"></span>
              Utama
            </h3>
            <ul class="space-y-2 text-xs font-mono">
              <li>
                <RouterLink to="/" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Home</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/portal" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Portal</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/register" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Registrasi</span>
                </RouterLink>
              </li>
              <li>
                <a href="/admin" class="text-gray-400 hover:text-fuchsia-400 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-lock text-[10px] text-fuchsia-400/60"></i>
                  <span>Login Admin</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Column 2: MEMBERS -->
          <div class="space-y-3">
            <h3 class="font-orbitron font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.8)]"></span>
              Members
            </h3>
            <ul class="space-y-2 text-xs font-mono">
              <li>
                <RouterLink to="/member-list" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Member List</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/motm" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-crown text-[10px] text-amber-400/60"></i>
                  <span>MOTM</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/meetup" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Meetup &amp; Points</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/gacha" class="text-gray-400 hover:text-amber-400 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-dice text-[10px] text-amber-400/60"></i>
                  <span>Gacha Reward</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/blacklist" class="text-gray-400 hover:text-red-400 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-user-slash text-[10px] text-red-400/60"></i>
                  <span>Blacklist</span>
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Column 3: COMMUNITY -->
          <div class="space-y-3">
            <h3 class="font-orbitron font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.8)]"></span>
              Community
            </h3>
            <ul class="space-y-2 text-xs font-mono">
              <li>
                <RouterLink to="/rules?tab=community" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Rules Community</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/rules?tab=ot" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Rules OT</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/dewan-staff" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Dewan Staff</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/faq" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>FAQ</span>
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Column 4: MEDIA -->
          <div class="space-y-3">
            <h3 class="font-orbitron font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.8)]"></span>
              Media
            </h3>
            <ul class="space-y-2 text-xs font-mono">
              <li>
                <RouterLink to="/gallery" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Gallery Meet Up</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/articles" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>Articles</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/news" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-angle-right text-[10px] text-cyan-400/60"></i>
                  <span>News Update</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/rules?tab=privacy" class="text-gray-400 hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                  <i class="fas fa-shield-alt text-[10px] text-cyan-400/60"></i>
                  <span>Privacy Policy</span>
                </RouterLink>
              </li>
            </ul>
          </div>

        </div>

      </div>

      <!-- BOTTOM SUB-BAR -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500 text-center sm:text-left">
        <div>
          &copy; {{ currentYear }} <span class="text-gray-300 font-semibold">XFIVE Community</span>. All rights reserved.
        </div>
        <div class="flex items-center gap-4 text-[11px] text-gray-500">
          <span>AyoDance Indonesia Community</span>
          <span class="hidden sm:inline">&bull;</span>
          <RouterLink to="/rules?tab=privacy" class="hover:text-cyan-400 transition-colors">Privacy</RouterLink>
          <span>&bull;</span>
          <RouterLink to="/rules?tab=community" class="hover:text-cyan-400 transition-colors">Terms</RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
const instagramUrl = import.meta.env.VITE_IG_URL || 'https://www.instagram.com/xfive.au';
const facebookUrl = import.meta.env.VITE_FB_URL || 'https://www.facebook.com/xfiveofficial';
</script>
