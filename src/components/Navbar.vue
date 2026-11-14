<template>
  <header class="sticky top-0 bg-[#0a0e14]/90 backdrop-blur-md border-b border-cyan-500/20 z-50 shadow-[0_4px_30px_rgba(0,255,255,0.05)] transition-all duration-300">
    <div class="container mx-auto px-4 py-3.5 flex justify-between items-center">
      <!-- LOGO / TITLE -->
      <RouterLink to="/" class="text-xl sm:text-2xl font-bold tracking-widest cursor-pointer flex items-center gap-2 group">
        <span class="text-white drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]">XFIVE<span class="text-cyan-400">COMMUNITY</span></span>
      </RouterLink>

      <!-- DESKTOP MENU -->
      <nav class="hidden lg:flex items-center gap-1.5 xl:gap-2">
        <!-- 1. HOME -->
        <RouterLink
          to="/"
          class="nav-item relative font-orbitron font-bold uppercase tracking-wider text-xs px-3 py-2 rounded-xl transition-all"
          :class="$route.path === '/' || $route.path === '/members' ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5'"
        >
          <span>Home</span>
          <span
            v-if="$route.path === '/' || $route.path === '/members'"
            class="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
          ></span>
        </RouterLink>

        <!-- 2. PORTAL -->
        <RouterLink
          to="/portal"
          class="nav-item relative font-orbitron font-bold uppercase tracking-wider text-xs px-3 py-2 rounded-xl transition-all"
          :class="$route.path === '/portal' ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5'"
        >
          <span>Portal</span>
          <span
            v-if="$route.path === '/portal'"
            class="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
          ></span>
        </RouterLink>

        <!-- 3. MEMBERS DROPDOWN -->
        <div
          class="relative"
          @mouseenter="handleMouseEnter('members')"
          @mouseleave="handleMouseLeave"
        >
          <button
            type="button"
            @click="toggleDropdown('members')"
            class="nav-item font-orbitron font-bold uppercase tracking-wider text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            :class="isMembersActive ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : (activeDropdown === 'members' ? 'text-cyan-300 bg-white/5' : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5')"
          >
            <span>Members</span>
            <i
              class="fas fa-chevron-down text-[10px] transition-transform duration-200"
              :class="activeDropdown === 'members' ? 'rotate-180 text-cyan-400' : 'opacity-60'"
            ></i>
            <span
              v-if="isMembersActive"
              class="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
            ></span>
          </button>

          <!-- Floating Dropdown Panel -->
          <Transition name="dropdown">
            <div
              v-if="activeDropdown === 'members'"
              class="dropdown-panel absolute top-full left-0 mt-1.5 w-56 py-2 px-1.5 rounded-2xl bg-[#0c121e]/95 backdrop-blur-xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,255,255,0.1)] z-50 flex flex-col gap-1"
            >
              <RouterLink
                to="/member-list"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path === '/member-list' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-users w-4 text-center text-cyan-400"></i>
                <span>Member List</span>
              </RouterLink>

              <RouterLink
                to="/motm"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path === '/motm' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-crown w-4 text-center text-amber-400"></i>
                <span>Member Of The Month</span>
              </RouterLink>

              <RouterLink
                to="/meetup"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path.startsWith('/meetup') ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-calendar-check w-4 text-center text-emerald-400"></i>
                <span>Meetup &amp; Points</span>
              </RouterLink>

              <RouterLink
                to="/gacha"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path === '/gacha' ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30' : 'text-gray-300 hover:text-amber-300 hover:bg-amber-500/5'"
              >
                <i class="fas fa-dice w-4 text-center text-amber-400"></i>
                <span>Gacha Reward</span>
              </RouterLink>

              <RouterLink
                to="/blacklist"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path === '/blacklist' ? 'bg-red-500/15 text-red-400 font-bold border border-red-500/30' : 'text-gray-300 hover:text-red-300 hover:bg-red-500/5'"
              >
                <i class="fas fa-user-slash w-4 text-center text-red-400"></i>
                <span>Blacklist Member</span>
              </RouterLink>
            </div>
          </Transition>
        </div>

        <!-- 3. COMMUNITY DROPDOWN -->
        <div
          class="relative"
          @mouseenter="handleMouseEnter('community')"
          @mouseleave="handleMouseLeave"
        >
          <button
            type="button"
            @click="toggleDropdown('community')"
            class="nav-item font-orbitron font-bold uppercase tracking-wider text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            :class="isCommunityActive ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : (activeDropdown === 'community' ? 'text-cyan-300 bg-white/5' : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5')"
          >
            <span>Community</span>
            <i
              class="fas fa-chevron-down text-[10px] transition-transform duration-200"
              :class="activeDropdown === 'community' ? 'rotate-180 text-cyan-400' : 'opacity-60'"
            ></i>
            <span
              v-if="isCommunityActive"
              class="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
            ></span>
          </button>

          <!-- Floating Dropdown Panel -->
          <Transition name="dropdown">
            <div
              v-if="activeDropdown === 'community'"
              class="dropdown-panel absolute top-full left-0 mt-1.5 w-60 py-2 px-1.5 rounded-2xl bg-[#0c121e]/95 backdrop-blur-xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,255,255,0.1)] z-50 flex flex-col gap-1"
            >
              <RouterLink
                to="/rules?tab=community"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path.startsWith('/rules') && (!route.query.tab || route.query.tab === 'community') ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-scroll w-4 text-center text-cyan-400"></i>
                <span>Rules Community</span>
              </RouterLink>

              <RouterLink
                to="/rules?tab=ot"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path.startsWith('/rules') && route.query.tab === 'ot' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-gamepad w-4 text-center text-fuchsia-400"></i>
                <span>Rules OT</span>
              </RouterLink>

              <RouterLink
                to="/rules?tab=privacy"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path.startsWith('/rules') && route.query.tab === 'privacy' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-shield-alt w-4 text-center text-emerald-400"></i>
                <span>Privasi Police</span>
              </RouterLink>

              <RouterLink
                to="/dewan-staff"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path === '/dewan-staff' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-user-shield w-4 text-center text-blue-400"></i>
                <span>Dewan Staff</span>
              </RouterLink>

              <RouterLink
                to="/faq"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path === '/faq' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-circle-question w-4 text-center text-purple-400"></i>
                <span>FAQ</span>
              </RouterLink>
            </div>
          </Transition>
        </div>

        <!-- 4. GALLERY DROPDOWN -->
        <div
          class="relative"
          @mouseenter="handleMouseEnter('gallery')"
          @mouseleave="handleMouseLeave"
        >
          <button
            type="button"
            @click="toggleDropdown('gallery')"
            class="nav-item font-orbitron font-bold uppercase tracking-wider text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            :class="isGalleryActive ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : (activeDropdown === 'gallery' ? 'text-cyan-300 bg-white/5' : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5')"
          >
            <span>Gallery</span>
            <i
              class="fas fa-chevron-down text-[10px] transition-transform duration-200"
              :class="activeDropdown === 'gallery' ? 'rotate-180 text-cyan-400' : 'opacity-60'"
            ></i>
            <span
              v-if="isGalleryActive"
              class="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
            ></span>
          </button>

          <!-- Floating Dropdown Panel -->
          <Transition name="dropdown">
            <div
              v-if="activeDropdown === 'gallery'"
              class="dropdown-panel absolute top-full left-0 mt-1.5 w-56 py-2 px-1.5 rounded-2xl bg-[#0c121e]/95 backdrop-blur-xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,255,255,0.1)] z-50 flex flex-col gap-1"
            >
              <RouterLink
                to="/gallery"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path === '/gallery' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-camera-retro w-4 text-center text-cyan-400"></i>
                <span>Gallery Meet Up</span>
              </RouterLink>
            </div>
          </Transition>
        </div>

        <!-- 5. MEDIA DROPDOWN (Articles & News) -->
        <div
          class="relative"
          @mouseenter="handleMouseEnter('media')"
          @mouseleave="handleMouseLeave"
        >
          <button
            type="button"
            @click="toggleDropdown('media')"
            class="nav-item font-orbitron font-bold uppercase tracking-wider text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            :class="isMediaActive ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : (activeDropdown === 'media' ? 'text-cyan-300 bg-white/5' : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5')"
          >
            <span>Media</span>
            <i
              class="fas fa-chevron-down text-[10px] transition-transform duration-200"
              :class="activeDropdown === 'media' ? 'rotate-180 text-cyan-400' : 'opacity-60'"
            ></i>
            <span
              v-if="isMediaActive"
              class="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
            ></span>
          </button>

          <!-- Floating Dropdown Panel -->
          <Transition name="dropdown">
            <div
              v-if="activeDropdown === 'media'"
              class="dropdown-panel absolute top-full left-0 mt-1.5 w-52 py-2 px-1.5 rounded-2xl bg-[#0c121e]/95 backdrop-blur-xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,255,255,0.1)] z-50 flex flex-col gap-1"
            >
              <RouterLink
                to="/articles"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path.startsWith('/article') ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-newspaper w-4 text-center text-cyan-400"></i>
                <span>Articles</span>
              </RouterLink>

              <RouterLink
                to="/news"
                @click="closeDropdownImmediate"
                class="dropdown-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                :class="$route.path === '/news' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'"
              >
                <i class="fas fa-bullhorn w-4 text-center text-fuchsia-400"></i>
                <span>News Update</span>
              </RouterLink>
            </div>
          </Transition>
        </div>

        <!-- 6. ADMIN -->
        <a
          href="/admin"
          class="nav-item font-orbitron font-bold uppercase tracking-wider text-xs px-3 py-2 rounded-xl text-gray-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <i class="fas fa-lock text-[10px] text-fuchsia-400"></i>
          <span>Admin</span>
        </a>

        <!-- 7. CTA BUTTON: DAFTAR X5 -->
        <RouterLink
          to="/register"
          class="ml-2 relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all cursor-pointer"
        >
          <i class="fas fa-user-plus text-[11px]"></i>
          <span>Daftar X5</span>
          <i class="fas fa-arrow-right text-[10px]"></i>
        </RouterLink>
      </nav>

      <!-- MOBILE MENU BUTTON -->
      <button
        @click="isMobileMenuOpen = true"
        class="lg:hidden text-gray-300 hover:text-cyan-400 focus:outline-none transition-colors p-2"
        aria-label="Toggle menu"
      >
        <i class="fas fa-bars text-2xl"></i>
      </button>
    </div>
  </header>

  <!-- MOBILE OFF-CANVAS MENU -->
  <Transition name="fade">
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55]"
    ></div>
  </Transition>

  <Transition name="drawer">
    <div
      v-if="isMobileMenuOpen"
      class="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#0d1117] border-l border-cyan-500/20 z-[60] shadow-[-10px_0_30px_rgba(0,0,0,0.7)] flex flex-col justify-between"
    >
      <div class="flex flex-col h-full overflow-hidden">
        <!-- Drawer Header -->
        <div class="p-5 border-b border-white/5 flex justify-between items-center bg-black/40">
          <span class="text-white font-orbitron font-black tracking-widest text-base">XFIVE<span class="text-cyan-400">MENU</span></span>
          <button
            @click="isMobileMenuOpen = false"
            class="text-gray-400 hover:text-white transition-colors p-2 -mr-2 cursor-pointer"
          >
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>

        <!-- Drawer Accordion Navigation -->
        <nav class="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
          <!-- 1. Home -->
          <RouterLink
            to="/"
            @click="isMobileMenuOpen = false"
            class="w-full p-3 rounded-xl font-orbitron font-bold uppercase tracking-wider text-xs flex items-center gap-3 transition-colors"
            :class="$route.path === '/' || $route.path === '/members' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-gray-300 hover:bg-white/5'"
          >
            <i class="fas fa-home w-5 text-center text-cyan-400"></i>
            <span>Home</span>
          </RouterLink>

          <!-- 2. Portal -->
          <RouterLink
            to="/portal"
            @click="isMobileMenuOpen = false"
            class="w-full p-3 rounded-xl font-orbitron font-bold uppercase tracking-wider text-xs flex items-center gap-3 transition-colors"
            :class="$route.path === '/portal' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-gray-300 hover:bg-white/5'"
          >
            <i class="fas fa-satellite-dish w-5 text-center text-cyan-400"></i>
            <span>Portal</span>
          </RouterLink>

          <!-- 3. Members Accordion -->
          <div class="rounded-xl border border-white/5 overflow-hidden bg-black/30">
            <button
              @click="toggleMobileSection('members')"
              class="w-full p-3 font-orbitron font-bold uppercase tracking-wider text-xs flex items-center justify-between text-left transition-colors cursor-pointer"
              :class="isMembersActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300 hover:bg-white/5'"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-users w-5 text-center text-cyan-400"></i>
                <span>Members</span>
              </div>
              <i
                class="fas fa-chevron-down text-xs transition-transform duration-200"
                :class="mobileSections.members ? 'rotate-180 text-cyan-400' : 'opacity-60'"
              ></i>
            </button>
            <div v-show="mobileSections.members" class="p-2 space-y-1 bg-black/50 border-t border-white/5">
              <RouterLink
                to="/member-list"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
                :class="$route.path === '/member-list' ? 'text-cyan-400 font-bold' : ''"
              >
                👥 Member List
              </RouterLink>
              <RouterLink
                to="/motm"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
                :class="$route.path === '/motm' ? 'text-cyan-400 font-bold' : ''"
              >
                👑 Member Of The Month
              </RouterLink>
              <RouterLink
                to="/meetup"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
                :class="$route.path.startsWith('/meetup') ? 'text-cyan-400 font-bold' : ''"
              >
                📍 Meetup &amp; Points
              </RouterLink>
              <RouterLink
                to="/gacha"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-amber-300 hover:bg-white/5"
                :class="$route.path === '/gacha' ? 'text-amber-400 font-bold' : ''"
              >
                🎲 Gacha Reward Meetup
              </RouterLink>
              <RouterLink
                to="/blacklist"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-red-400 hover:bg-red-500/10"
                :class="$route.path === '/blacklist' ? 'font-bold' : ''"
              >
                ⛔ Blacklist Member
              </RouterLink>
            </div>
          </div>

          <!-- 3. Community Accordion -->
          <div class="rounded-xl border border-white/5 overflow-hidden bg-black/30">
            <button
              @click="toggleMobileSection('community')"
              class="w-full p-3 font-orbitron font-bold uppercase tracking-wider text-xs flex items-center justify-between text-left transition-colors cursor-pointer"
              :class="isCommunityActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300 hover:bg-white/5'"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-handshake-angle w-5 text-center text-cyan-400"></i>
                <span>Community</span>
              </div>
              <i
                class="fas fa-chevron-down text-xs transition-transform duration-200"
                :class="mobileSections.community ? 'rotate-180 text-cyan-400' : 'opacity-60'"
              ></i>
            </button>
            <div v-show="mobileSections.community" class="p-2 space-y-1 bg-black/50 border-t border-white/5">
              <RouterLink
                to="/rules?tab=community"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
              >
                📜 Rules Community
              </RouterLink>
              <RouterLink
                to="/rules?tab=ot"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
              >
                🎯 Rules OT
              </RouterLink>
              <RouterLink
                to="/rules?tab=privacy"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
              >
                🔒 Privasi Police
              </RouterLink>
              <RouterLink
                to="/dewan-staff"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
                :class="$route.path === '/dewan-staff' ? 'text-cyan-400 font-bold' : ''"
              >
                🛡️ Dewan Staff
              </RouterLink>
              <RouterLink
                to="/faq"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
                :class="$route.path === '/faq' ? 'text-cyan-400 font-bold' : ''"
              >
                ❓ FAQ
              </RouterLink>
            </div>
          </div>

          <!-- 4. Gallery Accordion -->
          <div class="rounded-xl border border-white/5 overflow-hidden bg-black/30">
            <button
              @click="toggleMobileSection('gallery')"
              class="w-full p-3 font-orbitron font-bold uppercase tracking-wider text-xs flex items-center justify-between text-left transition-colors cursor-pointer"
              :class="isGalleryActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300 hover:bg-white/5'"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-camera w-5 text-center text-cyan-400"></i>
                <span>Gallery</span>
              </div>
              <i
                class="fas fa-chevron-down text-xs transition-transform duration-200"
                :class="mobileSections.gallery ? 'rotate-180 text-cyan-400' : 'opacity-60'"
              ></i>
            </button>
            <div v-show="mobileSections.gallery" class="p-2 space-y-1 bg-black/50 border-t border-white/5">
              <RouterLink
                to="/gallery"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
                :class="$route.path === '/gallery' ? 'text-cyan-400 font-bold' : ''"
              >
                📸 Gallery Meet Up
              </RouterLink>
            </div>
          </div>

          <!-- 5. Media Accordion -->
          <div class="rounded-xl border border-white/5 overflow-hidden bg-black/30">
            <button
              @click="toggleMobileSection('media')"
              class="w-full p-3 font-orbitron font-bold uppercase tracking-wider text-xs flex items-center justify-between text-left transition-colors cursor-pointer"
              :class="isMediaActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300 hover:bg-white/5'"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-newspaper w-5 text-center text-cyan-400"></i>
                <span>Media</span>
              </div>
              <i
                class="fas fa-chevron-down text-xs transition-transform duration-200"
                :class="mobileSections.media ? 'rotate-180 text-cyan-400' : 'opacity-60'"
              ></i>
            </button>
            <div v-show="mobileSections.media" class="p-2 space-y-1 bg-black/50 border-t border-white/5">
              <RouterLink
                to="/articles"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
                :class="$route.path.startsWith('/article') ? 'text-cyan-400 font-bold' : ''"
              >
                📰 Articles
              </RouterLink>
              <RouterLink
                to="/news"
                @click="isMobileMenuOpen = false"
                class="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-cyan-300 hover:bg-white/5"
                :class="$route.path === '/news' ? 'text-cyan-400 font-bold' : ''"
              >
                📢 News Update
              </RouterLink>
            </div>
          </div>

          <!-- 6. Admin -->
          <a
            href="/admin"
            @click="isMobileMenuOpen = false"
            class="w-full p-3 rounded-xl font-orbitron font-bold uppercase tracking-wider text-xs flex items-center gap-3 text-gray-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-colors"
          >
            <i class="fas fa-shield-alt w-5 text-center text-fuchsia-400"></i>
            <span>Admin</span>
          </a>
        </nav>

        <!-- Drawer Footer CTA -->
        <div class="p-5 border-t border-white/10 bg-black/40">
          <RouterLink
            to="/register"
            @click="isMobileMenuOpen = false"
            class="w-full py-3 px-4 rounded-xl font-orbitron font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          >
            <i class="fas fa-user-plus"></i>
            <span>Daftar X5 (Join Community)</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isMobileMenuOpen = ref(false);

// Active state detection
const isMembersActive = computed(() => {
  const p = route.path;
  return p === '/member-list' || p === '/motm' || p.startsWith('/meetup') || p === '/blacklist' || p.startsWith('/member/');
});

const isCommunityActive = computed(() => {
  const p = route.path;
  return p.startsWith('/rules') || p === '/privacy' || p === '/dewan-staff' || p === '/faq';
});

const isGalleryActive = computed(() => {
  return route.path.startsWith('/gallery');
});

const isMediaActive = computed(() => {
  const p = route.path;
  return p.startsWith('/article') || p === '/news';
});

// Desktop Dropdowns
const activeDropdown = ref(null);
let leaveTimer = null;

const handleMouseEnter = (name) => {
  if (leaveTimer) {
    clearTimeout(leaveTimer);
    leaveTimer = null;
  }
  activeDropdown.value = name;
};

const handleMouseLeave = () => {
  leaveTimer = setTimeout(() => {
    activeDropdown.value = null;
  }, 180);
};

const toggleDropdown = (name) => {
  if (activeDropdown.value === name) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = name;
  }
};

const closeDropdownImmediate = () => {
  if (leaveTimer) clearTimeout(leaveTimer);
  activeDropdown.value = null;
};

// Close on outside click
const handleClickOutside = (e) => {
  if (!e.target.closest('header')) {
    activeDropdown.value = null;
  }
};

// Mobile Accordions
const mobileSections = reactive({
  members: true,
  community: false,
  gallery: false,
  media: false
});

const toggleMobileSection = (key) => {
  mobileSections[key] = !mobileSections[key];
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
  if (leaveTimer) clearTimeout(leaveTimer);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
