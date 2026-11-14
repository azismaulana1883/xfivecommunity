<template>
  <div class="min-h-screen bg-[#07090e] text-gray-200 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Ambient Cyberpunk Background Glows -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="container mx-auto max-w-7xl relative z-10 space-y-8">
      <!-- Title & Marquee Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <i class="fas fa-dice text-cyan-400"></i>
          <span>XFIVE EXCLUSIVE GACHA SYSTEM</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black font-orbitron text-white tracking-wider">
          MEETUP <span class="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">POINT GACHA</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-gray-400 max-w-2xl mx-auto">
          Tukarkan akumulasi poin kehadiran Meetup Anda dengan hadiah VIP eksklusif, Voucher Mi-Cash langsung dapat, atau merchandise resmi!
        </p>
      </div>

      <!-- MAIN 2-COLUMN LAYOUT -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- ============================================================== -->
        <!-- LEFT COLUMN: BANNER, TIMER, MODAL BUTTONS, & MEMBER AUTH       -->
        <!-- ============================================================== -->
        <div class="lg:col-span-6 space-y-6">
          <!-- 1. Event Banner & Info Card -->
          <div class="rounded-3xl border border-cyan-500/30 bg-[#0c121e]/90 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-5">
            <!-- Top Gradient Accent -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-blue-500"></div>

            <div class="flex items-start justify-between gap-4">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">OFFICIAL COMMUNITY EVENT</span>
                <h2 class="text-lg sm:text-xl font-black font-orbitron text-white mt-0.5">
                  {{ eventSettings.event_title }}
                </h2>
                <p class="text-xs font-mono text-gray-400 mt-1">
                  {{ eventSettings.event_subtitle }}
                </p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl flex-shrink-0">
                <i class="fas fa-gift"></i>
              </div>
            </div>

            <!-- Event Banner Image (Below Description) -->
            <div
              v-if="eventSettings.banner_url"
              class="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-black/60 shadow-[0_0_20px_rgba(0,255,255,0.15)] group"
            >
              <img
                :src="eventSettings.banner_url"
                :alt="eventSettings.event_title || 'Gacha Event Banner'"
                class="w-full h-auto max-h-56 object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0c121e]/80 via-transparent to-transparent pointer-events-none"></div>
            </div>

            <!-- Event Period Dates -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div class="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-1">
                <div class="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fas fa-calendar-alt text-cyan-400"></i>
                  <span>Periode Gacha</span>
                </div>
                <div class="text-white font-bold">
                  {{ formatShortDate(eventSettings.start_date) }} &bull; {{ formatShortDate(eventSettings.end_date) }}
                </div>
              </div>

              <div class="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-1">
                <div class="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fas fa-coins text-amber-400"></i>
                  <span>Biaya per Putaran</span>
                </div>
                <div class="text-cyan-300 font-bold">
                  {{ eventSettings.points_per_roll }} Poin Kehadiran / Roll
                </div>
              </div>
            </div>

            <!-- Countdown Timer (Time Left) -->
            <div class="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 text-center space-y-1 shadow-inner">
              <div class="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
                <i class="fas fa-clock animate-pulse"></i>
                <span>SISA WAKTU EVENT (TIME LEFT)</span>
              </div>
              <div class="text-xl sm:text-2xl font-black font-orbitron text-white tracking-widest drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                {{ countdownText }}
              </div>
            </div>

            <!-- Two Action Buttons: Reward List & Activity Details -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                @click="showRewardListModal = true"
                class="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <i class="fas fa-list-ul text-cyan-400"></i>
                <span>Reward List</span>
              </button>

              <button
                type="button"
                @click="showHowToPlayModal = true"
                class="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <i class="fas fa-circle-question text-cyan-400"></i>
                <span>How to Play</span>
              </button>
            </div>
          </div>

          <!-- 2. Member Authentication & Points Status Card -->
          <div class="rounded-3xl border border-white/10 bg-[#0c121e]/90 p-6 backdrop-blur-xl shadow-2xl space-y-4">
            <!-- Header Card Title -->
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 class="font-orbitron font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <i :class="isAuthenticated ? 'fas fa-shield-check text-emerald-400' : 'fas fa-shield-halved text-cyan-400'"></i>
                <span>{{ isAuthenticated ? 'Member Terverifikasi' : 'Autentikasi Akun Member' }}</span>
              </h3>
              <span
                v-if="isAuthenticated"
                class="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              >
                <i class="fas fa-check-circle text-[10px]"></i>
                <span>Akses Sah</span>
              </span>
            </div>

            <!-- 1. Form Login / Autentikasi (Jika Belum Login) -->
            <div v-if="!isAuthenticated" class="space-y-4">
              <p class="text-xs font-mono text-gray-400 leading-relaxed">
                Demi keamanan poin &amp; hak hadiah Anda, masukkan <strong class="text-cyan-400">Member Code</strong> dan <strong class="text-amber-400">Kode Rahasia (unique_code_edit)</strong> akun Anda:
              </p>

              <!-- Input Member Code -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-mono uppercase tracking-wider text-gray-300">
                  1. Member Code
                </label>
                <div class="relative">
                  <input
                    type="text"
                    v-model="memberCodeInput"
                    placeholder="Contoh: X5-MEMBER-11075"
                    @keyup.enter="focusSecretInput"
                    class="w-full bg-black/60 border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white font-mono uppercase tracking-wider outline-none transition-all placeholder:text-gray-600"
                  />
                  <i class="fas fa-id-card text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 text-sm"></i>
                </div>
              </div>

              <!-- Input Kode Rahasia (unique_code_edit) -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="block text-[11px] font-mono uppercase tracking-wider text-gray-300">
                    2. Kode Rahasia Member
                  </label>
                  <span class="text-[10px] font-mono text-gray-500">
                    (Rahasia Akun)
                  </span>
                </div>
                <div class="relative">
                  <input
                    ref="secretInputRef"
                    :type="showSecretPassword ? 'text' : 'password'"
                    v-model="secretCodeInput"
                    placeholder="Contoh: X5-EDIT-B890EF92"
                    @keyup.enter="handleLogin"
                    class="w-full bg-black/60 border border-white/10 focus:border-amber-400 rounded-2xl px-4 py-3 pr-11 text-xs sm:text-sm text-white font-mono uppercase tracking-wider outline-none transition-all placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    @click="showSecretPassword = !showSecretPassword"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1 cursor-pointer"
                    title="Tampilkan / Sembunyikan Kode"
                  >
                    <i :class="showSecretPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Tombol Verifikasi & Buka Gacha -->
              <button
                type="button"
                @click="handleLogin"
                :disabled="loadingMember"
                class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <i :class="loadingMember ? 'fas fa-circle-notch animate-spin' : 'fas fa-unlock-keyhole'"></i>
                <span>{{ loadingMember ? 'Memverifikasi...' : 'Verifikasi & Buka Gacha' }}</span>
              </button>

              <!-- Pesan Error -->
              <div
                v-if="memberError"
                class="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 flex items-start gap-2"
              >
                <i class="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0"></i>
                <div class="leading-relaxed">{{ memberError }}</div>
              </div>

              <!-- Lupa Kode Rahasia Helpdesk Link -->
              <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span class="text-gray-500">Lupa kode rahasia Anda?</span>
                <a
                  :href="forgotCodeWaLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition"
                >
                  <i class="fab fa-whatsapp text-emerald-400"></i>
                  <span>Bantuan Staff XFIVE</span>
                </a>
              </div>
            </div>

            <!-- 2. Tampilan Profil Terverifikasi (Jika Sudah Berhasil Login) -->
            <div v-else class="space-y-4 animate-fade-in">
              <!-- Profil Member Card -->
              <div class="p-4 rounded-2xl bg-black/50 border border-cyan-500/30 space-y-3 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>

                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3.5 min-w-0">
                    <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img
                        v-if="memberInfo.avatar"
                        :src="memberInfo.avatar"
                        alt="Avatar"
                        class="w-full h-full object-cover"
                      />
                      <i v-else class="fas fa-user text-cyan-400 text-xl"></i>
                    </div>
                    <div class="truncate">
                      <div class="text-sm font-black font-orbitron text-white truncate flex items-center gap-2">
                        <span>{{ memberInfo.nickname }}</span>
                      </div>
                      <div class="text-xs font-mono text-gray-400 truncate mt-0.5">
                        {{ memberInfo.name }} &bull; Dom: <strong class="text-gray-200">{{ memberInfo.domisili }}</strong>
                      </div>
                      <div class="text-[10px] font-mono text-cyan-400 mt-0.5">
                        {{ memberInfo.member_code }}
                      </div>
                    </div>
                  </div>

                  <!-- Tombol Logout / Ganti Member -->
                  <button
                    type="button"
                    @click="handleLogout"
                    class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-[10px] font-mono transition cursor-pointer flex-shrink-0 flex items-center gap-1.5"
                    title="Keluar / Ganti Akun"
                  >
                    <i class="fas fa-right-from-bracket"></i>
                    <span class="hidden sm:inline">Ganti Akun</span>
                  </button>
                </div>

                <!-- Poin Stats -->
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono text-center">
                  <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div class="text-[10px] text-gray-400 uppercase">Total Kehadiran</div>
                    <div class="text-sm sm:text-base font-bold text-white mt-0.5">{{ memberInfo.total_hadir }} Meetup</div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
                    <div class="text-[10px] text-cyan-400 uppercase font-bold">Sisa Poin Gacha</div>
                    <div class="text-sm sm:text-base font-black font-orbitron text-cyan-300 mt-0.5">
                      {{ memberInfo.available_points }} <span class="text-[11px] font-normal">Poin</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Member Personal History Summary Link -->
              <div v-if="myHistory.length > 0" class="pt-2 border-t border-white/5">
                <button
                  type="button"
                  @click="showHistoryDrawer = !showHistoryDrawer"
                  class="w-full flex items-center justify-between text-xs font-mono text-gray-400 hover:text-cyan-300 py-1 transition cursor-pointer"
                >
                  <span class="flex items-center gap-1.5">
                    <i class="fas fa-history text-cyan-400"></i>
                    <span>Riwayat Roll Anda ({{ myHistory.length }} Catatan)</span>
                  </span>
                  <i class="fas text-[10px]" :class="showHistoryDrawer ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </button>

                <div v-if="showHistoryDrawer" class="space-y-1.5 pt-2 max-h-48 overflow-y-auto custom-scrollbar">
                  <div
                    v-for="h in myHistory"
                    :key="h.id"
                    class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px] font-mono"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <i :class="h.is_zonk ? 'fas fa-times-circle text-red-400' : 'fas fa-gift text-emerald-400'"></i>
                      <div class="truncate">
                        <span :class="h.is_zonk ? 'text-gray-400' : 'text-white font-bold'">
                          {{ h.reward_name }}
                        </span>
                        <div v-if="h.masked_voucher_code" class="text-[10px] text-emerald-400/80">
                          Kode: {{ h.masked_voucher_code }}
                        </div>
                      </div>
                    </div>
                    <span class="text-gray-500 text-[10px] flex-shrink-0 ml-2">
                      {{ formatShortDate(h.rolled_at) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- RIGHT COLUMN: PLAYPARK GACHA MACHINE & ROLL CONTROLS           -->
        <!-- ============================================================== -->
        <div class="lg:col-span-6 space-y-6">
          <div class="rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0c1424] via-[#090d16] to-[#06080e] p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,255,0.15)] relative overflow-hidden flex flex-col items-center">
            
            <!-- Gacha Machine Top Marquee Header -->
            <div class="w-full text-center pb-4 border-b border-cyan-500/20 mb-4">
              <span class="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-orbitron font-extrabold text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                 XFIVE GACHA POINT
              </span>
            </div>

            <!-- Gacha Machine Visual Globe (Capsule Dome) -->
            <div class="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-cyan-400/40 bg-gradient-to-b from-cyan-950/30 via-black/80 to-[#07101e] shadow-[0_0_40px_rgba(0,255,255,0.2),inset_0_0_30px_rgba(0,255,255,0.15)] flex items-center justify-center overflow-hidden my-4">
              <!-- Glass Reflection Highlight -->
              <div class="absolute -top-10 left-8 w-44 h-24 bg-gradient-to-b from-white/20 to-transparent rounded-full transform -rotate-25 pointer-events-none blur-sm"></div>

              <!-- Animated Floating Bouncing Capsules Inside Dome -->
              <div class="absolute inset-0 p-6 flex flex-wrap items-center justify-center gap-3">
                <div
                  v-for="(capsule, idx) in capsules"
                  :key="idx"
                  class="w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg border flex items-center justify-center transform transition-transform duration-300"
                  :class="[
                    capsule.color,
                    isRolling ? 'animate-bounce-crazy' : 'animate-float-gentle'
                  ]"
                  :style="{ animationDelay: `${idx * 0.15}s` }"
                >
                  <i :class="capsule.icon" class="text-xs text-white/90 drop-shadow"></i>
                </div>
              </div>

              <!-- Rolling Spinner Indicator when active -->
              <div
                v-if="isRolling"
                class="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20 animate-fade-in"
              >
                <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,255,255,0.8)]"></div>
                <span class="text-xs font-orbitron font-bold text-cyan-300 tracking-wider animate-pulse">
                  MEMUTAR KAPSUL...
                </span>
              </div>
            </div>

            <!-- Gacha Machine Base & Dispenser (GOT IT!) -->
            <div class="w-full max-w-sm rounded-2xl bg-[#090d16] border border-cyan-500/30 p-4 shadow-xl flex items-center justify-between gap-4 mt-2">
              <!-- Dispenser Chute -->
              <div class="flex items-center gap-2.5">
                <div class="w-14 h-12 rounded-xl bg-black border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-orbitron font-extrabold text-[10px] tracking-widest shadow-inner">
                  GOT IT!
                </div>
                <div class="text-[11px] font-mono text-gray-400">
                  Tempat keluar kapsul hadiah
                </div>
              </div>

              <!-- Turn Knob Handle Animation -->
              <div
                class="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 via-gray-900 to-black border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center justify-center cursor-pointer transition-transform duration-700"
                :class="isRolling ? 'rotate-[720deg]' : ''"
              >
                <div class="w-10 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
              </div>
            </div>

            <!-- Roll Action Bar -->
            <div class="w-full mt-6 space-y-4">
              <!-- Warning Banner jika Belum Login -->
              <div
                v-if="!isAuthenticated"
                class="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1 animate-pulse"
              >
                <div class="text-xs font-orbitron font-bold text-amber-300 flex items-center justify-center gap-2">
                  <i class="fas fa-lock text-amber-400"></i>
                  <span>MESIN GACHA TERKUNCI</span>
                </div>
                <p class="text-[11px] font-mono text-gray-400">
                  Verifikasi Member Code &amp; Kode Rahasia akun Anda di panel kiri untuk membuka tombol roll.
                </p>
              </div>

              <div class="grid grid-cols-3 gap-2.5 sm:gap-3">
                <!-- Random 1x -->
                <button
                  type="button"
                  @click="handleRoll(1)"
                  :disabled="isRolling || !isAuthenticated || !canRoll(1)"
                  class="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-cyan-500/20 to-blue-600/30 hover:from-cyan-400/30 hover:to-blue-500/40 border border-cyan-500/40 hover:border-cyan-400 text-white font-orbitron font-bold text-center transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex flex-col items-center justify-center gap-1 group"
                >
                  <span class="text-xs sm:text-sm font-black group-hover:text-cyan-300">Random 1x</span>
                  <span class="text-[10px] font-mono text-cyan-400 font-normal">1 Poin</span>
                </button>

                <!-- Random 5x -->
                <button
                  type="button"
                  @click="handleRoll(5)"
                  :disabled="isRolling || !isAuthenticated || !canRoll(5)"
                  class="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-purple-500/20 to-pink-600/30 hover:from-purple-400/30 hover:to-pink-500/40 border border-purple-500/40 hover:border-pink-400 text-white font-orbitron font-bold text-center transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex flex-col items-center justify-center gap-1 group"
                >
                  <span class="text-xs sm:text-sm font-black group-hover:text-pink-300">Random 5x</span>
                  <span class="text-[10px] font-mono text-pink-400 font-normal">5 Poin</span>
                </button>

                <!-- Random 10x -->
                <button
                  type="button"
                  @click="handleRoll(10)"
                  :disabled="isRolling || !isAuthenticated || !canRoll(10)"
                  class="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-yellow-600/30 hover:from-amber-400/30 hover:to-yellow-500/40 border border-amber-500/40 hover:border-amber-400 text-white font-orbitron font-bold text-center transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex flex-col items-center justify-center gap-1 group"
                >
                  <span class="text-xs sm:text-sm font-black group-hover:text-amber-300">Random 10x</span>
                  <span class="text-[10px] font-mono text-amber-400 font-normal">10 Poin</span>
                </button>
              </div>

              <!-- Skip Animation Toggle -->
              <div class="flex items-center justify-center gap-2 pt-1 text-xs font-mono text-gray-400">
                <input
                  type="checkbox"
                  id="skipAnim"
                  :checked="skipAnimation"
                  @change="setSkipAnimation($event.target.checked)"
                  class="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                />
                <label for="skipAnim" class="cursor-pointer select-none hover:text-white transition">
                  Skip Animation (Langsung buka hasil penarikan)
                </label>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- MODAL POPUPS -->
    <RewardListModal
      v-if="showRewardListModal"
      :rewards="rewards"
      :total-reward-rate="totalRewardRate"
      :zonk-rate="zonkRate"
      @close="showRewardListModal = false"
    />

    <HowToPlayModal
      v-if="showHowToPlayModal"
      @close="showHowToPlayModal = false"
    />

    <GachaResultModal
      v-if="showResultModal"
      :results="rollResults"
      :remaining-points="memberInfo?.available_points ?? 0"
      :member-info="memberInfo || {}"
      @close="showResultModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGacha } from '@/composables/useGacha';
import { useToast } from '@/composables/useToast';
import RewardListModal from '@/components/gacha/RewardListModal.vue';
import HowToPlayModal from '@/components/gacha/HowToPlayModal.vue';
import GachaResultModal from '@/components/gacha/GachaResultModal.vue';

const toast = useToast();

const {
  memberCodeInput,
  secretCodeInput,
  memberInfo,
  isAuthenticated,
  loadingMember,
  memberError,
  rewards,
  totalRewardRate,
  zonkRate,
  eventSettings,
  myHistory,
  isRolling,
  rollResults,
  showResultModal,
  skipAnimation,
  setSkipAnimation,
  fetchSettings,
  fetchRewards,
  loginMember,
  logoutMember,
  fetchMyHistory,
  rollGacha,
} = useGacha();

const showRewardListModal = ref(false);
const showHowToPlayModal = ref(false);
const showHistoryDrawer = ref(false);
const showSecretPassword = ref(false);
const secretInputRef = ref(null);

const focusSecretInput = () => {
  secretInputRef.value?.focus();
};

const handleLogin = async () => {
  await loginMember();
};

const handleLogout = () => {
  logoutMember();
};

const forgotCodeWaLink = computed(() => {
  const code = (memberCodeInput.value || '').trim();
  const text = `Halo Admin/Staff XFIVE, saya ingin bantuan konfirmasi Kode Rahasia (unique_code_edit) saya untuk bermain Gacha Reward Meetup.${code ? ` Member Code saya: ${code}` : ''}`;
  return `https://wa.me/6281211112222?text=${encodeURIComponent(text)}`;
});

// Dummy colorful capsules for visual inside machine
const capsules = [
  { color: 'bg-cyan-500/80 border-cyan-300', icon: 'fas fa-ticket' },
  { color: 'bg-pink-500/80 border-pink-300', icon: 'fas fa-crown' },
  { color: 'bg-amber-500/80 border-amber-300', icon: 'fas fa-star' },
  { color: 'bg-purple-500/80 border-purple-300', icon: 'fas fa-gem' },
  { color: 'bg-emerald-500/80 border-emerald-300', icon: 'fas fa-coins' },
  { color: 'bg-blue-500/80 border-blue-300', icon: 'fas fa-gift' },
  { color: 'bg-red-500/80 border-red-300', icon: 'fas fa-bomb' },
  { color: 'bg-cyan-400/80 border-cyan-200', icon: 'fas fa-ticket' },
];

const canRoll = (count) => {
  if (!isAuthenticated.value || !memberInfo.value) return false;
  return memberInfo.value.available_points >= count * (eventSettings.value.points_per_roll || 1);
};

const handleRoll = async (count) => {
  if (!isAuthenticated.value) {
    toast.warning('Silakan verifikasi Member Code & Kode Rahasia Anda terlebih dahulu pada panel kiri.', 'Verifikasi Diperlukan');
    return;
  }
  await rollGacha(count);
};

// Countdown Timer calculation
const countdownText = ref('00 Hari 00:00:00');
let timerInterval = null;

const updateCountdown = () => {
  if (!eventSettings.value.end_date) {
    countdownText.value = 'EVENT AKTIF';
    return;
  }
  const diff = new Date(eventSettings.value.end_date).getTime() - Date.now();
  if (diff <= 0) {
    countdownText.value = 'EVENT SELESAI';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  const pad = (n) => String(n).padStart(2, '0');
  countdownText.value = `${days} Hari ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

onMounted(async () => {
  await fetchSettings();
  await fetchRewards();
  if (isAuthenticated.value) {
    await fetchMyHistory();
  }
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
@keyframes floatGentle {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(8deg); }
}
@keyframes bounceCrazy {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  25% { transform: translate(12px, -18px) rotate(45deg) scale(1.1); }
  50% { transform: translate(-15px, -8px) rotate(-35deg) scale(0.95); }
  75% { transform: translate(10px, 14px) rotate(25deg) scale(1.05); }
  100% { transform: translate(0, 0) rotate(0deg) scale(1); }
}

.animate-float-gentle {
  animation: floatGentle 3s ease-in-out infinite;
}

.animate-bounce-crazy {
  animation: bounceCrazy 0.35s ease-in-out infinite;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
