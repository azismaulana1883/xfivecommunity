<template>
  <div class="space-y-6">
    <!-- Sub-tab Navigation -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="activeSubTab = 'rewards'"
          class="px-4 py-2 rounded-xl text-xs font-orbitron uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          :class="activeSubTab === 'rewards' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'"
        >
          <i class="fas fa-gift"></i>
          <span>Hadiah &amp; Drop Rate</span>
        </button>

        <button
          type="button"
          @click="activeSubTab = 'vouchers'"
          class="px-4 py-2 rounded-xl text-xs font-orbitron uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          :class="activeSubTab === 'vouchers' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'"
        >
          <i class="fas fa-ticket"></i>
          <span>Stok Voucher Mi-Cash</span>
        </button>

        <button
          type="button"
          @click="activeSubTab = 'history'"
          class="px-4 py-2 rounded-xl text-xs font-orbitron uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          :class="activeSubTab === 'history' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'"
        >
          <i class="fas fa-trophy text-amber-400"></i>
          <span>Riwayat Pemenang &amp; Klaim</span>
        </button>

        <button
          type="button"
          @click="activeSubTab = 'settings'"
          class="px-4 py-2 rounded-xl text-xs font-orbitron uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          :class="activeSubTab === 'settings' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'"
        >
          <i class="fas fa-gear"></i>
          <span>Pengaturan Event</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="refreshCurrentTab"
          class="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 text-xs transition cursor-pointer"
          title="Refresh Data"
        >
          <i class="fas fa-rotate" :class="isRefreshing ? 'animate-spin text-cyan-400' : ''"></i>
        </button>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SUB-TAB 1: HADIAH & DROP RATE                                  -->
    <!-- ============================================================== -->
    <div v-if="activeSubTab === 'rewards'" class="space-y-6">
      <!-- Summary Rate & ZONK Meter -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1: Total Hadiah Aktif -->
        <div class="p-5 rounded-2xl bg-[#0c121e]/90 border border-cyan-500/20 backdrop-blur-md flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl">
            <i class="fas fa-box-open"></i>
          </div>
          <div>
            <div class="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Total Hadiah Terpasang</div>
            <div class="text-2xl font-black font-orbitron text-white mt-0.5">
              {{ rewardsList.length }} <span class="text-xs text-gray-400 font-mono font-normal">Item</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Total Drop Rate Hadiah -->
        <div class="p-5 rounded-2xl bg-[#0c121e]/90 border border-cyan-500/20 backdrop-blur-md flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl">
            <i class="fas fa-percent"></i>
          </div>
          <div>
            <div class="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Peluang Menang Hadiah</div>
            <div class="text-2xl font-black font-orbitron text-emerald-400 mt-0.5">
              {{ totalRewardRate.toFixed(2) }}%
            </div>
          </div>
        </div>

        <!-- Card 3: ZONK Otomatis -->
        <div class="p-5 rounded-2xl bg-[#0c121e]/90 border border-red-500/20 backdrop-blur-md flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xl">
            <i class="fas fa-bomb"></i>
          </div>
          <div>
            <div class="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Peluang ZONK Otomatis</div>
            <div class="text-2xl font-black font-orbitron text-red-400 mt-0.5">
              {{ zonkRate.toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Banner Sisa Waktu Event (Time Left) & Shortcut Pengaturan -->
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xl flex-shrink-0 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <i class="fas fa-stopwatch-20"></i>
          </div>
          <div>
            <div class="text-[11px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span>Sisa Waktu Event (Time Left)</span>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                :class="settings.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
              >
                {{ settings.is_active ? 'EVENT AKTIF' : 'EVENT NONAKTIF' }}
              </span>
            </div>
            <div class="text-lg sm:text-xl font-black font-orbitron text-white mt-0.5 tracking-wider flex items-center gap-2">
              <span class="text-cyan-400">{{ previewAdminCountdown }}</span>
            </div>
            <div class="text-[11px] font-mono text-gray-400 mt-0.5">
              Mulai: <strong class="text-gray-200">{{ formatDate(settings.start_date) }}</strong> &bull; Berakhir: <strong class="text-gray-200">{{ formatDate(settings.end_date) }}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="activeSubTab = 'settings'"
          class="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-orbitron uppercase tracking-wider font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,255,0.2)] self-start sm:self-center flex-shrink-0"
        >
          <i class="fas fa-pen-to-square"></i>
          <span>Ubah Time Left Event</span>
        </button>
      </div>

      <!-- Probability Gauge Bar -->
      <div class="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
        <div class="flex items-center justify-between text-xs font-mono">
          <span class="text-gray-300">Distribusi Probabilitas Gacha:</span>
          <span class="text-gray-400">Total: <strong>100.00%</strong></span>
        </div>
        <div class="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
          <div
            class="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
            :style="{ width: `${Math.min(100, totalRewardRate)}%` }"
            :title="`Hadiah: ${totalRewardRate}%`"
          ></div>
          <div
            class="h-full bg-red-500/80 transition-all duration-500"
            :style="{ width: `${zonkRate}%` }"
            :title="`Zonk Otomatis: ${zonkRate}%`"
          ></div>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-0.5">
          <span class="text-emerald-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            Hadiah ({{ totalRewardRate.toFixed(2) }}%)
          </span>
          <span class="text-red-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-red-400"></span>
            ZONK Otomatis ({{ zonkRate.toFixed(2) }}%)
          </span>
        </div>
      </div>

      <!-- Action Button & Rewards Table -->
      <div class="flex items-center justify-between">
        <h3 class="font-orbitron font-bold text-sm text-white uppercase tracking-wider">Daftar Hadiah Gacha</h3>
        <button
          type="button"
          @click="openAddRewardModal"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <i class="fas fa-plus"></i>
          <span>Tambah Hadiah</span>
        </button>
      </div>

      <div class="rounded-2xl border border-white/10 bg-[#0c121e]/80 overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-black/60 text-gray-400 uppercase tracking-wider text-[11px] border-b border-white/10">
              <tr>
                <th class="p-3.5">Kategori</th>
                <th class="p-3.5">Nama Hadiah</th>
                <th class="p-3.5">Drop Rate (%)</th>
                <th class="p-3.5">Biaya Poin</th>
                <th class="p-3.5">Stok / Voucher</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-gray-200">
              <tr v-for="reward in rewardsList" :key="reward.id" class="hover:bg-white/5 transition-colors">
                <td class="p-3.5">
                  <span
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider font-orbitron uppercase border"
                    :class="[
                      reward.category === 'VIP' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
                      reward.category === 'MI-CASH' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' :
                      'bg-purple-500/15 border-purple-500/30 text-purple-300'
                    ]"
                  >
                    {{ reward.category }}
                    <span v-if="reward.vip_type" class="ml-1 text-[9px] lowercase">({{ reward.vip_type }})</span>
                  </span>
                </td>
                <td class="p-3.5 font-bold text-white">
                  {{ reward.name }}
                  <div v-if="reward.description" class="text-[10px] text-gray-400 font-normal truncate max-w-xs">
                    {{ reward.description }}
                  </div>
                </td>
                <td class="p-3.5">
                  <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    {{ reward.drop_rate.toFixed(2) }}%
                  </span>
                </td>
                <td class="p-3.5 text-cyan-400 font-bold">
                  {{ reward.point_cost }} Poin
                </td>
                <td class="p-3.5">
                  <span v-if="reward.category === 'MI-CASH'" class="font-bold">
                    <span :class="(reward.available_vouchers || 0) > 0 ? 'text-emerald-400' : 'text-red-400'">
                      {{ reward.available_vouchers || 0 }} Tersedia
                    </span>
                    <span class="text-gray-500 text-[10px] ml-1">({{ reward.claimed_vouchers || 0 }} Terpakai)</span>
                  </span>
                  <span v-else class="text-gray-400">
                    {{ reward.stock > 0 ? `${reward.stock} Kuota` : 'Unlimited' }}
                  </span>
                </td>
                <td class="p-3.5">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    :class="reward.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'"
                  >
                    {{ reward.is_active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td class="p-3.5 text-right space-x-2">
                  <button
                    type="button"
                    @click="openEditRewardModal(reward)"
                    class="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 text-gray-300 transition cursor-pointer"
                    title="Edit Hadiah"
                  >
                    <i class="fas fa-pencil text-xs"></i>
                  </button>
                  <button
                    type="button"
                    @click="handleDeleteReward(reward)"
                    class="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-400 text-red-400 transition cursor-pointer"
                    title="Hapus Hadiah"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="rewardsList.length === 0">
                <td colspan="7" class="text-center py-12 text-gray-500 font-mono">
                  Belum ada hadiah gacha yang ditambahkan. Silakan klik "Tambah Hadiah" di atas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SUB-TAB 2: STOK VOUCHER MI-CASH                                -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'vouchers'" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-orbitron font-bold text-sm text-white uppercase tracking-wider">Inventori Voucher Mi-Cash</h3>
          <p class="text-xs text-gray-400 font-mono">Input kode voucher 12 digit (3 kotak @ 4 digit) + password untuk sistem pemberian kode otomatis.</p>
        </div>
        <button
          type="button"
          @click="openAddVoucherModal"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <i class="fas fa-plus"></i>
          <span>Tambah Voucher Baru</span>
        </button>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="w-60">
          <SelectSearch
            v-model="voucherFilterRewardId"
            :options="miCashRewardOptionsWithAll"
            placeholder="Filter Hadiah Mi-Cash"
            @change="fetchVouchersFiltered"
          />
        </div>

        <div class="w-48">
          <SelectSearch
            v-model="voucherFilterStatus"
            :options="voucherStatusOptions"
            placeholder="Filter Status"
            @change="fetchVouchersFiltered"
          />
        </div>
      </div>

      <!-- Vouchers Table -->
      <div class="rounded-2xl border border-white/10 bg-[#0c121e]/80 overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-black/60 text-gray-400 uppercase tracking-wider text-[11px] border-b border-white/10">
              <tr>
                <th class="p-3.5">Hadiah</th>
                <th class="p-3.5">Kode Voucher (12 Digit)</th>
                <th class="p-3.5">Password</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5">Pemenang / Pengklaim</th>
                <th class="p-3.5">Waktu Klaim</th>
                <th class="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-gray-200">
              <tr v-for="v in vouchersList" :key="v.id" class="hover:bg-white/5 transition-colors">
                <td class="p-3.5 font-bold text-cyan-300">
                  {{ v.reward_name }}
                </td>
                <td class="p-3.5 font-mono font-bold tracking-wider text-white">
                  {{ v.full_code }}
                </td>
                <td class="p-3.5 font-mono text-gray-300">
                  <span v-if="revealedVoucherIds.includes(v.id)">{{ v.password }}</span>
                  <span v-else class="text-gray-500">••••••••</span>
                  <button
                    type="button"
                    @click="toggleRevealPassword(v.id)"
                    class="ml-2 text-gray-400 hover:text-cyan-400 transition"
                    title="Toggle Password"
                  >
                    <i :class="revealedVoucherIds.includes(v.id) ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </td>
                <td class="p-3.5">
                  <span
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-orbitron uppercase border"
                    :class="[
                      v.status === 'AVAILABLE' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
                      v.status === 'CLAIMED' ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' :
                      'bg-gray-500/15 border-gray-500/30 text-gray-400'
                    ]"
                  >
                    {{ v.status === 'AVAILABLE' ? 'Tersedia' : v.status === 'CLAIMED' ? 'Terklaim' : 'Expired' }}
                  </span>
                </td>
                <td class="p-3.5">
                  <span v-if="v.claimed_by_member_code" class="text-cyan-400 font-bold">
                    {{ v.claimed_by_member_code }}
                  </span>
                  <span v-else class="text-gray-500">-</span>
                </td>
                <td class="p-3.5 text-gray-400 text-[11px]">
                  {{ v.claimed_at ? formatDate(v.claimed_at) : '-' }}
                </td>
                <td class="p-3.5 text-right">
                  <button
                    v-if="v.status === 'AVAILABLE'"
                    type="button"
                    @click="handleDeleteVoucher(v)"
                    class="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-400 text-red-400 transition cursor-pointer"
                    title="Hapus Voucher"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                  <span v-else class="text-gray-600 text-xs italic">Terkunci</span>
                </td>
              </tr>

              <tr v-if="vouchersList.length === 0">
                <td colspan="7" class="text-center py-12 text-gray-500 font-mono">
                  Belum ada voucher Mi-Cash yang sesuai filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SUB-TAB 3: RIWAYAT PEMENANG & KLAIM (HISTORY)                  -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'history'" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-orbitron font-bold text-sm text-white uppercase tracking-wider">Log Penarikan &amp; Pemenang Gacha</h3>
          <p class="text-xs text-gray-400 font-mono">
            Pantau seluruh member yang memutar gacha. Detail voucher Mi-Cash ditampilkan lengkap di panel admin ini untuk verifikasi.
          </p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div class="sm:col-span-2 relative">
          <input
            type="text"
            v-model="historySearch"
            placeholder="Cari member code, nama, nickname, atau tiket..."
            class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 font-mono outline-none"
            @input="debounceHistorySearch"
          />
          <i class="fas fa-search text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-xs"></i>
        </div>

        <div>
          <SelectSearch
            v-model="historyFilterCategory"
            :options="historyCategoryOptions"
            placeholder="Filter Kategori"
            @change="fetchRollsFiltered"
          />
        </div>

        <div>
          <SelectSearch
            v-model="historyFilterStatus"
            :options="historyStatusOptions"
            placeholder="Filter Status Klaim"
            @change="fetchRollsFiltered"
          />
        </div>
      </div>

      <!-- Winner Only Toggle -->
      <div class="flex items-center gap-2 text-xs font-mono text-gray-300">
        <input
          type="checkbox"
          id="winnerOnlyCheck"
          v-model="historyWinnerOnly"
          @change="fetchRollsFiltered"
          class="accent-cyan-400 w-4 h-4 cursor-pointer rounded"
        />
        <label for="winnerOnlyCheck" class="cursor-pointer select-none">
          Hanya tampilkan pemenang hadiah (sembunyikan ZONK)
        </label>
      </div>

      <!-- History Table -->
      <div class="rounded-2xl border border-white/10 bg-[#0c121e]/80 overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-black/60 text-gray-400 uppercase tracking-wider text-[11px] border-b border-white/10">
              <tr>
                <th class="p-3.5">Waktu Roll</th>
                <th class="p-3.5">Member</th>
                <th class="p-3.5">Hadiah Didapatkan</th>
                <th class="p-3.5">Detail Voucher / Tiket Klaim</th>
                <th class="p-3.5">Status Klaim</th>
                <th class="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-gray-200">
              <tr v-for="roll in rollsHistory" :key="roll.id" class="hover:bg-white/5 transition-colors">
                <td class="p-3.5 text-gray-400 text-[11px] whitespace-nowrap">
                  {{ formatDate(roll.rolled_at) }}
                </td>
                <td class="p-3.5">
                  <div class="font-bold text-white">{{ roll.member_nickname }}</div>
                  <div class="text-[10px] text-gray-400">
                    {{ roll.member_name }} &bull; <span class="text-cyan-400 font-bold">{{ roll.member_code }}</span>
                  </div>
                </td>
                <td class="p-3.5">
                  <div v-if="roll.is_zonk" class="text-red-400 font-bold flex items-center gap-1.5">
                    <i class="fas fa-times-circle"></i>
                    <span>ZONK</span>
                  </div>
                  <div v-else class="font-bold text-emerald-400 flex items-center gap-1.5">
                    <i class="fas fa-gift"></i>
                    <span>{{ roll.reward_name }}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-normal">
                      {{ roll.reward_category }}
                    </span>
                  </div>
                </td>
                <td class="p-3.5">
                  <!-- Jika Mi-Cash -->
                  <div v-if="roll.reward_category === 'MI-CASH' && roll.voucher_code">
                    <div class="font-bold text-cyan-300 font-mono tracking-wider">
                      {{ roll.voucher_code }}
                    </div>
                    <div class="text-[10px] text-gray-400">
                      Pass: <span class="text-white font-mono">{{ roll.voucher_password || '-' }}</span>
                    </div>
                  </div>
                  <!-- Jika VIP / Others / Zonk -->
                  <div v-else>
                    <span class="text-xs text-gray-300 font-mono">{{ roll.claim_ticket_code }}</span>
                  </div>
                </td>
                <td class="p-3.5">
                  <span
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-orbitron uppercase border"
                    :class="[
                      roll.claim_status === 'AUTO_CLAIMED' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
                      roll.claim_status === 'FULFILLED' ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' :
                      roll.claim_status === 'PENDING_STAFF' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
                      'bg-gray-500/15 border-gray-500/30 text-gray-400'
                    ]"
                  >
                    {{
                      roll.claim_status === 'AUTO_CLAIMED' ? 'Otomatis' :
                      roll.claim_status === 'FULFILLED' ? 'Selesai / Diberikan' :
                      roll.claim_status === 'PENDING_STAFF' ? 'Menunggu Staff' :
                      'ZONK'
                    }}
                  </span>
                </td>
                <td class="p-3.5 text-right">
                  <button
                    v-if="roll.claim_status === 'PENDING_STAFF'"
                    type="button"
                    @click="handleMarkFulfilled(roll)"
                    class="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-mono transition cursor-pointer"
                    title="Tandai Hadiah Sudah Diberikan ke Member"
                  >
                    <i class="fas fa-check-double mr-1"></i>
                    <span>Tandai Selesai</span>
                  </button>
                  <span v-else-if="roll.claim_status === 'FULFILLED'" class="text-blue-400 text-xs flex items-center justify-end gap-1">
                    <i class="fas fa-check-circle"></i>
                    <span>Selesai</span>
                  </span>
                  <span v-else class="text-gray-600 text-xs">-</span>
                </td>
              </tr>

              <tr v-if="rollsHistory.length === 0">
                <td colspan="6" class="text-center py-12 text-gray-500 font-mono">
                  Belum ada log penarikan yang sesuai filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SUB-TAB 4: PENGATURAN EVENT GACHA                              -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'settings'" class="space-y-6 max-w-4xl">
      <div class="rounded-2xl border border-white/10 bg-[#0c121e]/80 p-6 space-y-6">
        <h3 class="font-orbitron font-bold text-sm text-white uppercase tracking-wider border-b border-white/10 pb-3">
          Konfigurasi Global Event Gacha
        </h3>

        <!-- Status Event Active Toggle -->
        <div class="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
          <div>
            <div class="text-xs font-orbitron uppercase text-white font-bold">Status Event Gacha</div>
            <div class="text-[11px] font-mono text-gray-400">Aktifkan atau nonaktifkan fitur gacha di sisi pengguna.</div>
          </div>
          <button
            type="button"
            @click="formSettings.is_active = !formSettings.is_active"
            class="px-4 py-2 rounded-xl text-xs font-orbitron uppercase tracking-wider font-bold transition-all cursor-pointer border"
            :class="formSettings.is_active ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-red-500/20 border-red-500/40 text-red-400'"
          >
            {{ formSettings.is_active ? 'AKTIF' : 'NONAKTIF' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Judul Event</label>
            <input
              type="text"
              v-model="formSettings.event_title"
              class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Biaya Poin per Roll</label>
            <input
              type="number"
              min="1"
              v-model="formSettings.points_per_roll"
              class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Subjudul / Deskripsi Event</label>
          <input
            type="text"
            v-model="formSettings.event_subtitle"
            class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
          />
        </div>

        <!-- Banner Event Gacha (WebP Upload / URL Link) -->
        <div class="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label class="block text-xs font-orbitron uppercase text-gray-200 font-bold flex items-center gap-2">
                <i class="fas fa-image text-cyan-400 text-xs"></i>
                <span>Banner Event Gacha (Opsional)</span>
              </label>
              <div class="text-[11px] font-mono text-gray-400 mt-0.5">
                Tampil di halaman member <strong>/gacha</strong> tepat di bawah teks deskripsi.
              </div>
            </div>

            <!-- Mode Switcher -->
            <div class="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono self-start sm:self-center">
              <button
                type="button"
                @click="gachaBannerInputMode = 'url'"
                :class="gachaBannerInputMode === 'url' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-white border-transparent'"
                class="px-2.5 py-1 rounded-lg border text-[10px] font-mono transition cursor-pointer"
              >
                URL Link
              </button>
              <button
                type="button"
                @click="gachaBannerInputMode = 'upload'"
                :class="gachaBannerInputMode === 'upload' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-white border-transparent'"
                class="px-2.5 py-1 rounded-lg border text-[10px] font-mono transition cursor-pointer flex items-center gap-1.5"
              >
                <i class="fas fa-wand-magic-sparkles text-[10px] text-cyan-400"></i>
                <span>Upload WebP (~70KB)</span>
              </button>
            </div>
          </div>

          <!-- Mode URL Link -->
          <div v-if="gachaBannerInputMode === 'url'" class="space-y-1.5">
            <input
              v-model="formSettings.banner_url"
              type="url"
              placeholder="https://images.unsplash.com/... atau URL banner langsung"
              class="w-full bg-black/60 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
            />
          </div>

          <!-- Mode Upload WebP -->
          <div v-else class="space-y-2">
            <div
              v-if="!formSettings.banner_url"
              @dragover.prevent="gachaBannerDragOver = true"
              @dragleave.prevent="gachaBannerDragOver = false"
              @drop.prevent="handleGachaBannerDrop"
              :class="gachaBannerDragOver ? 'border-cyan-400 bg-cyan-950/30' : 'border-white/10 bg-black/50'"
              class="border-2 border-dashed hover:border-cyan-500/60 rounded-xl p-5 text-center transition cursor-pointer relative"
            >
              <input
                type="file"
                accept="image/*"
                @change="handleGachaBannerFileSelect"
                class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div v-if="isUploadingGachaBanner" class="space-y-2 py-2">
                <i class="fas fa-rotate animate-spin text-cyan-400 text-2xl mx-auto block"></i>
                <p class="text-xs font-mono text-cyan-300">Mengompresi ke WebP 16:9 &amp; mengunggah...</p>
              </div>
              <div v-else class="space-y-1.5 py-1">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg mx-auto mb-1">
                  <i class="fas fa-cloud-arrow-up"></i>
                </div>
                <p class="text-xs font-orbitron text-gray-200">Tarik &amp; lepas banner gacha atau <span class="text-cyan-400 underline font-bold">Pilih File</span></p>
                <p class="text-[10px] font-mono text-gray-400">Otomatis di-convert ke WebP 16:9 ultra-ringan (~70KB) sebelum dikirim.</p>
              </div>
            </div>

            <!-- Compression Stats Badge -->
            <div
              v-if="gachaBannerCompressionStats"
              class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono shadow-inner"
            >
              <div class="flex items-center gap-2 text-cyan-300">
                <i class="fas fa-wand-magic-sparkles text-cyan-400 text-xs"></i>
                <span>Kompresi: {{ gachaBannerCompressionStats.original }} &rarr; <strong class="text-white">{{ gachaBannerCompressionStats.compressed }}</strong></span>
              </div>
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Hemat {{ gachaBannerCompressionStats.reduction }}%
              </span>
            </div>

            <!-- Error Banner -->
            <div v-if="gachaBannerError" class="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono flex items-center gap-2">
              <i class="fas fa-triangle-exclamation shrink-0"></i>
              <span>{{ gachaBannerError }}</span>
            </div>
          </div>

          <!-- Banner Preview Card -->
          <div v-if="formSettings.banner_url" class="relative mt-2 rounded-xl overflow-hidden border border-cyan-500/30 bg-black/70 aspect-[21/9] sm:aspect-[16/7] max-h-52 group shadow-lg">
            <img :src="formSettings.banner_url" alt="Banner Preview" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                @click="resetGachaBanner"
                class="px-3.5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600 text-white text-xs font-orbitron font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <i class="fas fa-trash-can text-xs"></i>
                <span>Hapus / Ganti Banner</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Pengaturan Periode & Time Left (Hitung Mundur Event) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-4 shadow-inner">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
            <div>
              <div class="text-xs font-orbitron uppercase text-cyan-300 font-bold flex items-center gap-2">
                <i class="fas fa-stopwatch text-cyan-400"></i>
                <span>Periode Event &amp; Sisa Waktu (Time Left)</span>
              </div>
              <div class="text-[11px] font-mono text-gray-400 mt-0.5">
                Pengaturan tanggal berakhir di bawah ini secara otomatis mengontrol tampilan hitung mundur <strong>"Time Left"</strong> di halaman member.
              </div>
            </div>

            <!-- Live Countdown Preview Badge -->
            <div class="px-3 py-1.5 rounded-xl bg-black/60 border border-cyan-500/30 text-right flex-shrink-0">
              <div class="text-[9px] font-mono text-gray-400 uppercase">Live Preview Time Left:</div>
              <div class="text-xs font-orbitron font-bold text-cyan-400 mt-0.5">{{ previewAdminCountdown }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tanggal Mulai -->
            <div>
              <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
                <i class="fas fa-calendar-plus text-emerald-400 text-xs"></i>
                <span>Tanggal &amp; Jam Mulai</span>
              </label>
              <input
                type="datetime-local"
                v-model="formSettings.start_date"
                class="w-full bg-black/60 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <!-- Tanggal Berakhir (Menentukan Time Left) -->
            <div>
              <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
                <i class="fas fa-calendar-xmark text-amber-400 text-xs"></i>
                <span>Tanggal &amp; Jam Berakhir (Time Left)</span>
              </label>
              <input
                type="datetime-local"
                v-model="formSettings.end_date"
                class="w-full bg-black/60 border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none shadow-[0_0_10px_rgba(0,255,255,0.1)]"
              />
            </div>
          </div>

          <!-- Quick Presets for End Date -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span class="text-[11px] font-mono text-gray-400 mr-1 flex items-center gap-1">
              <i class="fas fa-bolt text-amber-400 text-xs"></i>
              <span>Tombol Cepat Durasi:</span>
            </span>
            <button
              type="button"
              @click="setEndDatePreset(7)"
              class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-[10px] font-mono text-gray-300 hover:text-cyan-300 transition cursor-pointer"
            >
              +7 Hari
            </button>
            <button
              type="button"
              @click="setEndDatePreset(14)"
              class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-[10px] font-mono text-gray-300 hover:text-cyan-300 transition cursor-pointer"
            >
              +14 Hari
            </button>
            <button
              type="button"
              @click="setEndDatePreset(30)"
              class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-[10px] font-mono text-gray-300 hover:text-cyan-300 transition cursor-pointer"
            >
              +30 Hari (1 Bulan)
            </button>
            <button
              type="button"
              @click="setEndDateEndOfMonth"
              class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-[10px] font-mono text-gray-300 hover:text-cyan-300 transition cursor-pointer"
            >
              Sampai Akhir Bulan Ini
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Panduan / Rules Bermain (How to Play)</label>
          <textarea
            v-model="formSettings.how_to_play"
            rows="6"
            class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl p-3.5 text-xs text-white font-mono outline-none leading-relaxed"
            placeholder="Tuliskan panduan cara bermain dan aturan klaim..."
          ></textarea>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            type="button"
            @click="handleSaveSettings"
            :disabled="isSavingSettings"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {{ isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: TAMBAH / EDIT HADIAH                                    -->
    <!-- ============================================================== -->
    <div
      v-if="rewardModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-lg rounded-2xl bg-[#0c121e] border border-cyan-500/30 p-6 space-y-5 shadow-2xl relative">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 class="font-orbitron font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fas fa-gift text-cyan-400"></i>
            <span>{{ editingRewardId ? 'Edit Hadiah Gacha' : 'Tambah Hadiah Gacha' }}</span>
          </h4>
          <button
            type="button"
            @click="rewardModalOpen = false"
            class="text-gray-400 hover:text-white transition"
          >
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Kategori Hadiah (SelectSearch) -->
          <div>
            <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Kategori Hadiah</label>
            <SelectSearch
              v-model="formReward.category"
              :options="categoryOptions"
              placeholder="Pilih Kategori (VIP, MI-CASH, OTHERS)"
            />
          </div>

          <!-- Jika VIP: Pilihan Subkategori VIP -->
          <div v-if="formReward.category === 'VIP'">
            <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Subkategori VIP</label>
            <SelectSearch
              v-model="formReward.vip_type"
              :options="vipTypeOptions"
              placeholder="Pilih Durasi/Nominal VIP"
              @change="handleVipTypeChange"
            />
          </div>

          <!-- Nama Hadiah -->
          <div>
            <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Nama Hadiah</label>
            <input
              type="text"
              v-model="formReward.name"
              placeholder="Contoh: VIP 120k (30 Hari) atau Mi-Cash 100.000"
              class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
            />
          </div>

          <!-- Input Voucher Code & Password KHUSUS Kategori MI-CASH (3 Kotak @ 4 Digit + Password) -->
          <div
            v-if="formReward.category === 'MI-CASH'"
            class="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-3.5 shadow-inner"
          >
            <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span class="text-xs font-orbitron font-bold text-cyan-300 flex items-center gap-2">
                <i class="fas fa-ticket text-cyan-400"></i>
                <span>{{ editingRewardId ? 'Tambah Stok Voucher Mi-Cash (Opsional)' : 'Input Voucher & Password Mi-Cash' }}</span>
              </span>
              <span class="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                12 Digit + Pass
              </span>
            </div>

            <!-- Komponen 3 Kotak @ 4 Digit & Password Input -->
            <VoucherCodeInput v-model="formRewardVoucher" ref="rewardVoucherInputRef" />

            <div class="p-2 rounded-lg bg-black/40 border border-cyan-500/20 text-[10px] font-mono text-gray-300 flex items-start gap-2">
              <i class="fas fa-info-circle text-cyan-400 mt-0.5 flex-shrink-0"></i>
              <div class="leading-relaxed">
                {{ editingRewardId
                  ? 'Isi kode dan password di atas jika Anda ingin langsung menyuntikkan 1 stok voucher baru ke hadiah ini.'
                  : 'Kode voucher 12 digit (XXXX-XXXX-XXXX) dan password ini akan langsung disimpan ke database sebagai stok voucher awal hadiah Mi-Cash ini.'
                }}
              </div>
            </div>
          </div>

          <!-- Drop Rate (%) -->
          <div>
            <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1 flex items-center justify-between">
              <span>Drop Rate (%)</span>
              <span class="text-[10px] text-emerald-400 font-mono">Persentase Menang</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              v-model="formReward.drop_rate"
              placeholder="Contoh: 5.00"
              class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
            />
          </div>

          <!-- Biaya Poin & Stok -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Biaya Poin</label>
              <input
                type="number"
                min="1"
                v-model="formReward.point_cost"
                class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">
                {{ formReward.category === 'MI-CASH' ? 'Stok (Otomatis dari Voucher)' : 'Kuota Stok Fisik' }}
              </label>
              <input
                type="number"
                min="0"
                :disabled="formReward.category === 'MI-CASH'"
                v-model="formReward.stock"
                class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none disabled:opacity-40"
              />
            </div>
          </div>

          <!-- Deskripsi -->
          <div>
            <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Keterangan / Deskripsi</label>
            <textarea
              v-model="formReward.description"
              rows="2"
              placeholder="Keterangan tambahan untuk hadiah ini..."
              class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-xs text-white font-mono outline-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            @click="rewardModalOpen = false"
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="handleSaveReward"
            :disabled="isSavingReward"
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.3)] transition cursor-pointer disabled:opacity-50"
          >
            {{ isSavingReward ? 'Menyimpan...' : 'Simpan Hadiah' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: TAMBAH VOUCHER MI-CASH (3 KOTAK KECIL @ 4 DIGIT)        -->
    <!-- ============================================================== -->
    <div
      v-if="voucherModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-lg rounded-2xl bg-[#0c121e] border border-cyan-500/30 p-6 space-y-5 shadow-2xl relative">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 class="font-orbitron font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fas fa-ticket text-cyan-400"></i>
            <span>Tambah Kode Voucher Mi-Cash</span>
          </h4>
          <button
            type="button"
            @click="voucherModalOpen = false"
            class="text-gray-400 hover:text-white transition"
          >
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Pilih Hadiah Mi-Cash (SelectSearch) -->
          <div>
            <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1">Target Hadiah Mi-Cash</label>
            <SelectSearch
              v-model="formVoucher.reward_id"
              :options="miCashRewardOptions"
              placeholder="Pilih Hadiah Mi-Cash Tujuan..."
            />
          </div>

          <!-- Input Voucher 3 Kotak @ 4 Digit + Password -->
          <VoucherCodeInput
            ref="voucherInputComponentRef"
            v-model="voucherCodeParts"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            @click="voucherModalOpen = false"
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="handleSaveVoucher"
            :disabled="isSavingVoucher"
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.3)] transition cursor-pointer disabled:opacity-50"
          >
            {{ isSavingVoucher ? 'Menyimpan...' : 'Simpan Voucher' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useAdminGacha } from '@/composables/admin/useAdminGacha';
import SelectSearch from '@/components/common/SelectSearch.vue';
import VoucherCodeInput from '@/components/common/VoucherCodeInput.vue';
import { compressBannerImage } from '@/utils/imageCompressor';
import { adminApi } from '@/utils/admin/adminApi';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';

const toast = useToast();
const { confirm: confirmModal } = useConfirm();

const {
  rewardsList,
  vouchersList,
  rollsHistory,
  settings,
  totalRewardRate,
  zonkRate,
  fetchRewards,
  saveReward,
  deleteReward,
  fetchVouchers,
  saveVoucher,
  deleteVoucher,
  fetchRollsHistory,
  updateClaimStatus,
  fetchSettings,
  saveSettings,
} = useAdminGacha();

const activeSubTab = ref('rewards');
const isRefreshing = ref(false);

// Options for SelectSearch
const categoryOptions = [
  { label: 'VIP (AyoDance)', value: 'VIP', sublabel: 'Pilihan 72k, 120k, dll' },
  { label: 'MI-CASH (Megaxus)', value: 'MI-CASH', sublabel: 'Voucher 12 digit + pass' },
  { label: 'OTHERS (Custom)', value: 'OTHERS', sublabel: 'Merchandise / Jersey / Hadiah fisik' },
];

const vipTypeOptions = [
  { label: 'VIP 72k (30 Hari)', value: 'vip 72k' },
  { label: 'VIP 120k (30 Hari)', value: 'vip 120k' },
  { label: 'VIP 144k (30 Hari)', value: 'vip 144k' },
  { label: 'VIP 168k (30 Hari)', value: 'vip 168k' },
  { label: 'VIP 282k (30 Hari)', value: 'vip 282k' },
];

const voucherStatusOptions = [
  { label: 'Semua Status Voucher', value: '' },
  { label: 'Tersedia (AVAILABLE)', value: 'AVAILABLE' },
  { label: 'Terklaim (CLAIMED)', value: 'CLAIMED' },
];

const historyCategoryOptions = [
  { label: 'Semua Kategori', value: '' },
  { label: 'VIP', value: 'VIP' },
  { label: 'MI-CASH', value: 'MI-CASH' },
  { label: 'OTHERS', value: 'OTHERS' },
  { label: 'ZONK', value: 'ZONK' },
];

const historyStatusOptions = [
  { label: 'Semua Status Klaim', value: '' },
  { label: 'Otomatis (AUTO_CLAIMED)', value: 'AUTO_CLAIMED' },
  { label: 'Menunggu Staff (PENDING_STAFF)', value: 'PENDING_STAFF' },
  { label: 'Selesai (FULFILLED)', value: 'FULFILLED' },
];

const miCashRewardOptions = computed(() => {
  return rewardsList.value
    .filter((r) => r.category === 'MI-CASH')
    .map((r) => ({
      label: r.name,
      value: r.id,
      sublabel: `${r.available_vouchers || 0} stok`,
    }));
});

const miCashRewardOptionsWithAll = computed(() => {
  return [
    { label: 'Semua Hadiah Mi-Cash', value: '' },
    ...miCashRewardOptions.value,
  ];
});

// Reward Modal & Form
const rewardModalOpen = ref(false);
const editingRewardId = ref(null);
const isSavingReward = ref(false);
const rewardVoucherInputRef = ref(null);

const formReward = reactive({
  category: 'VIP',
  vip_type: 'vip 72k',
  name: '',
  description: '',
  drop_rate: 5,
  point_cost: 1,
  stock: 0,
  is_active: true,
});

const formRewardVoucher = reactive({
  code_part1: '',
  code_part2: '',
  code_part3: '',
  password: '',
});

const handleVipTypeChange = (opt) => {
  if (formReward.category === 'VIP' && opt?.label) {
    formReward.name = opt.label;
  }
};

const openAddRewardModal = () => {
  editingRewardId.value = null;
  formReward.category = 'VIP';
  formReward.vip_type = 'vip 72k';
  formReward.name = 'VIP 72k (30 Hari)';
  formReward.description = '';
  formReward.drop_rate = 5;
  formReward.point_cost = 1;
  formReward.stock = 0;
  formReward.is_active = true;

  formRewardVoucher.code_part1 = '';
  formRewardVoucher.code_part2 = '';
  formRewardVoucher.code_part3 = '';
  formRewardVoucher.password = '';
  rewardVoucherInputRef.value?.reset();

  rewardModalOpen.value = true;
};

const openEditRewardModal = (reward) => {
  editingRewardId.value = reward.id;
  formReward.category = reward.category;
  formReward.vip_type = reward.vip_type || 'vip 72k';
  formReward.name = reward.name;
  formReward.description = reward.description || '';
  formReward.drop_rate = reward.drop_rate;
  formReward.point_cost = reward.point_cost;
  formReward.stock = reward.stock;
  formReward.is_active = reward.is_active;

  formRewardVoucher.code_part1 = '';
  formRewardVoucher.code_part2 = '';
  formRewardVoucher.code_part3 = '';
  formRewardVoucher.password = '';
  rewardVoucherInputRef.value?.reset();

  rewardModalOpen.value = true;
};

const handleSaveReward = async () => {
  if (!formReward.name) {
    toast.warning('Nama hadiah wajib diisi.', 'Form Belum Lengkap');
    return;
  }

  let voucherPayload = null;
  if (formReward.category === 'MI-CASH') {
    const p1 = (formRewardVoucher.code_part1 || '').trim().toUpperCase();
    const p2 = (formRewardVoucher.code_part2 || '').trim().toUpperCase();
    const p3 = (formRewardVoucher.code_part3 || '').trim().toUpperCase();
    const pass = (formRewardVoucher.password || '').trim();
    const hasVoucherInput = Boolean(p1 || p2 || p3 || pass);

    if (hasVoucherInput) {
      if (p1.length !== 4 || p2.length !== 4 || p3.length !== 4) {
        toast.warning('Format Kode Voucher Mi-Cash belum lengkap! Harap isi 3 kotak masing-masing 4 digit (total 12 digit).', 'Format Voucher');
        return;
      }
      if (!pass) {
        toast.warning('Password voucher Mi-Cash wajib diisi.', 'Password Kosong');
        return;
      }
      voucherPayload = {
        code_part1: p1,
        code_part2: p2,
        code_part3: p3,
        password: pass,
      };
    }
  }

  isSavingReward.value = true;
  try {
    const payload = {
      ...formReward,
      voucher: voucherPayload,
    };
    await saveReward(payload, editingRewardId.value);
    await fetchVouchers();
    rewardModalOpen.value = false;
    toast.success('Data hadiah gacha berhasil disimpan!', 'Hadiah Tersimpan');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan hadiah.', 'Gagal Menyimpan');
  } finally {
    isSavingReward.value = false;
  }
};

const handleDeleteReward = async (reward) => {
  const ok = await confirmModal({
    title: 'Hapus Hadiah Gacha?',
    message: `Hapus hadiah "${reward.name}"? Seluruh voucher dan data terkait akan ikut terhapus secara permanen.`,
    confirmText: 'Ya, Hapus Hadiah',
    cancelText: 'Batal',
    variant: 'danger',
  });
  if (!ok) return;

  try {
    await deleteReward(reward.id);
    toast.success(`Hadiah "${reward.name}" berhasil dihapus.`, 'Hadiah Dihapus');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal menghapus hadiah.', 'Gagal Menghapus');
  }
};

// Voucher Modal & Form
const voucherModalOpen = ref(false);
const isSavingVoucher = ref(false);
const voucherInputComponentRef = ref(null);
const formVoucher = reactive({
  reward_id: '',
});
const voucherCodeParts = reactive({
  code_part1: '',
  code_part2: '',
  code_part3: '',
  password: '',
});

const voucherFilterRewardId = ref('');
const voucherFilterStatus = ref('');
const revealedVoucherIds = ref([]);

const toggleRevealPassword = (id) => {
  const idx = revealedVoucherIds.value.indexOf(id);
  if (idx >= 0) {
    revealedVoucherIds.value.splice(idx, 1);
  } else {
    revealedVoucherIds.value.push(id);
  }
};

const openAddVoucherModal = () => {
  if (miCashRewardOptions.value.length === 0) {
    toast.warning('Belum ada hadiah kategori MI-CASH. Tambahkan hadiah MI-CASH terlebih dahulu di tab Hadiah.', 'Belum Ada Hadiah');
    return;
  }
  formVoucher.reward_id = miCashRewardOptions.value[0]?.value || '';
  voucherCodeParts.code_part1 = '';
  voucherCodeParts.code_part2 = '';
  voucherCodeParts.code_part3 = '';
  voucherCodeParts.password = '';
  voucherModalOpen.value = true;
};

const handleSaveVoucher = async () => {
  if (!formVoucher.reward_id) {
    toast.warning('Pilih hadiah Mi-Cash tujuan terlebih dahulu.', 'Hadiah Belum Dipilih');
    return;
  }
  if (!voucherCodeParts.code_part1 || !voucherCodeParts.code_part2 || !voucherCodeParts.code_part3) {
    toast.warning('Isi lengkap 3 kotak kode voucher (masing-masing 4 digit).', 'Format Voucher');
    return;
  }
  if (!voucherCodeParts.password) {
    toast.warning('Password voucher wajib diisi.', 'Password Kosong');
    return;
  }

  isSavingVoucher.value = true;
  try {
    await saveVoucher({
      reward_id: Number(formVoucher.reward_id),
      code_part1: voucherCodeParts.code_part1,
      code_part2: voucherCodeParts.code_part2,
      code_part3: voucherCodeParts.code_part3,
      password: voucherCodeParts.password,
    });
    voucherModalOpen.value = false;
    toast.success('Stok voucher Mi-Cash baru berhasil ditambahkan!', 'Voucher Tersimpan');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan voucher.', 'Gagal Menyimpan');
  } finally {
    isSavingVoucher.value = false;
  }
};

const handleDeleteVoucher = async (v) => {
  const ok = await confirmModal({
    title: 'Hapus Voucher Mi-Cash?',
    message: `Hapus voucher "${v.full_code}" dari stok sistem? Tindakan ini tidak dapat dibatalkan.`,
    confirmText: 'Ya, Hapus Voucher',
    cancelText: 'Batal',
    variant: 'danger',
  });
  if (!ok) return;

  try {
    await deleteVoucher(v.id);
    toast.success(`Voucher "${v.full_code}" berhasil dihapus.`, 'Voucher Dihapus');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal menghapus voucher.', 'Gagal Menghapus');
  }
};

const fetchVouchersFiltered = () => {
  fetchVouchers(
    voucherFilterRewardId.value ? Number(voucherFilterRewardId.value) : undefined,
    voucherFilterStatus.value || undefined
  );
};

// History Filter & Actions
const historySearch = ref('');
const historyFilterCategory = ref('');
const historyFilterStatus = ref('');
const historyWinnerOnly = ref(false);
let searchDebounceTimeout = null;

const debounceHistorySearch = () => {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    fetchRollsFiltered();
  }, 350);
};

const fetchRollsFiltered = () => {
  fetchRollsHistory({
    search: historySearch.value,
    category: historyFilterCategory.value,
    status: historyFilterStatus.value,
    winners_only: historyWinnerOnly.value,
  });
};

const handleMarkFulfilled = async (roll) => {
  const ok = await confirmModal({
    title: 'Selesaikan Klaim Hadiah?',
    message: `Tandai klaim "${roll.reward_name}" untuk ${roll.member_nickname} (${roll.member_code}) sebagai Selesai / FULFILLED?`,
    confirmText: 'Ya, Tandai Selesai',
    cancelText: 'Batal',
    variant: 'info',
  });
  if (!ok) return;

  try {
    await updateClaimStatus(roll.id, 'FULFILLED');
    await fetchRollsFiltered();
    toast.success(`Status klaim ${roll.reward_name} (${roll.member_nickname}) diselesaikan.`, 'Klaim Selesai');
  } catch (err) {
    toast.error('Gagal memperbarui status klaim.', 'Gagal Update');
  }
};

// Settings Form & Date Formatting
const toLocalISOString = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Banner Upload State & Handlers
const gachaBannerInputMode = ref('upload');
const isUploadingGachaBanner = ref(false);
const gachaBannerDragOver = ref(false);
const gachaBannerError = ref('');
const gachaBannerCompressionStats = ref(null);

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const handleGachaBannerFileSelect = async (e) => {
  const input = e.target;
  if (input.files && input.files[0]) {
    await processAndUploadGachaBanner(input.files[0]);
  }
};

const handleGachaBannerDrop = async (e) => {
  gachaBannerDragOver.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0];
    await processAndUploadGachaBanner(file);
  }
};

const processAndUploadGachaBanner = async (file) => {
  if (!file.type || !file.type.startsWith('image/')) {
    gachaBannerError.value = 'Berkas yang dipilih harus berupa gambar (JPG, PNG, WebP).';
    return;
  }

  isUploadingGachaBanner.value = true;
  gachaBannerError.value = '';

  try {
    const compressed = await compressBannerImage(file, 1280, 560, 0.82);
    gachaBannerCompressionStats.value = {
      original: formatFileSize(compressed.originalSize),
      compressed: formatFileSize(compressed.compressedSize),
      reduction: compressed.reductionPercentage,
    };

    const formData = new FormData();
    formData.append('banner', compressed.file);

    const res = await adminApi.post('/api/v1/admin/gacha/upload-banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.data?.success && res.data?.url) {
      formSettings.banner_url = res.data.url;
      toast.success('Banner event gacha berhasil dikompresi ke WebP & diunggah!', 'Upload Berhasil');
    } else {
      gachaBannerError.value = res.data?.message || 'Gagal mengunggah banner event gacha.';
      toast.error(gachaBannerError.value, 'Upload Gagal');
    }
  } catch (err) {
    console.error('Error compress & upload gacha banner:', err);
    gachaBannerError.value =
      err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses banner gacha.';
    toast.error(gachaBannerError.value, 'Gagal Memproses');
  } finally {
    isUploadingGachaBanner.value = false;
  }
};

const resetGachaBanner = () => {
  formSettings.banner_url = '';
  gachaBannerCompressionStats.value = null;
  gachaBannerError.value = '';
};

const formSettings = reactive({
  is_active: true,
  event_title: '',
  event_subtitle: '',
  banner_url: '',
  points_per_roll: 1,
  start_date: '',
  end_date: '',
  how_to_play: '',
});
const isSavingSettings = ref(false);

const previewAdminCountdown = computed(() => {
  const targetDate = formSettings.end_date || settings.value?.end_date;
  if (!targetDate) return 'Tidak Terbatas';
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return 'Event Telah Berakhir';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  const pad = (n) => String(n).padStart(2, '0');
  return `${days} Hari ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
});

const setEndDatePreset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  formSettings.end_date = toLocalISOString(d);
};

const setEndDateEndOfMonth = () => {
  const d = new Date();
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 0, 0);
  formSettings.end_date = toLocalISOString(nextMonth);
};

watch(
  settings,
  (val) => {
    if (val) {
      formSettings.is_active = Boolean(val.is_active);
      formSettings.event_title = val.event_title || '';
      formSettings.event_subtitle = val.event_subtitle || '';
      formSettings.banner_url = val.banner_url || '';
      formSettings.points_per_roll = val.points_per_roll || 1;
      formSettings.start_date = toLocalISOString(val.start_date);
      formSettings.end_date = toLocalISOString(val.end_date);
      formSettings.how_to_play = val.how_to_play || '';
    }
  },
  { immediate: true, deep: true }
);

const handleSaveSettings = async () => {
  isSavingSettings.value = true;
  try {
    await saveSettings(formSettings);
    toast.success('Pengaturan event gacha berhasil disimpan!', 'Pengaturan Disimpan');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan.', 'Gagal Menyimpan');
  } finally {
    isSavingSettings.value = false;
  }
};

const refreshCurrentTab = async () => {
  isRefreshing.value = true;
  try {
    if (activeSubTab.value === 'rewards') await fetchRewards();
    else if (activeSubTab.value === 'vouchers') await fetchVouchersFiltered();
    else if (activeSubTab.value === 'history') await fetchRollsFiltered();
    else if (activeSubTab.value === 'settings') await fetchSettings();
  } finally {
    isRefreshing.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

onMounted(async () => {
  await fetchRewards();
  await fetchVouchers();
  await fetchRollsFiltered();
  await fetchSettings();
});
</script>
