<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-cyan-500/30 bg-[#0c121e]/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div class="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-black font-orbitron text-white">
            PENJELASAN LENGKAP RULES POIN KEHADIRAN
          </h2>
          <p class="text-xs text-cyan-400 font-mono uppercase tracking-wider">XFIVE COMMUNITY OFFICIAL REGULATION</p>
        </div>
      </div>

      <div class="space-y-6 text-sm text-gray-300 leading-relaxed">
        <div class="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <h3 class="text-base font-bold font-orbitron text-cyan-300 flex items-center gap-2">
            <span>📍 1. YANG TERPENTING ADALAH WILAYAH DOMISILI SENDIRI</span>
          </h3>
          <p>Setiap member yang berdomisili di wilayah prioritas:</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono font-bold text-center">
            <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">JAKARTA</div>
            <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">TANGERANG</div>
            <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">BEKASI</div>
            <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">BOGOR – DEPOK</div>
          </div>
          <p class="text-xs text-gray-400">
            Wajib memperhatikan Meetup / Gathering di wilayah domisilinya masing-masing.
          </p>
          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono space-y-1.5">
            <div class="text-red-300">➡️ Kamu domisili Bekasi dan tidak hadir Meetup Bekasi ➔ <strong>-1 poin</strong></div>
            <div class="text-gray-300">➡️ Kamu domisili Jakarta dan tidak hadir Meetup Bekasi ➔ <strong>0 poin</strong></div>
            <div class="text-emerald-300">➡️ Tidak hadir Meetup di luar domisili ➔ <strong>Tidak mengurangi poin</strong></div>
          </div>
          <p class="text-xs text-gray-400 italic">
            *Jadi, poin minus hanya berlaku apabila kamu tidak hadir di Meetup/Gathering wilayah domisilimu sendiri.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <h3 class="text-base font-bold font-orbitron text-amber-300 flex items-center gap-2">
            <span>🎯 2. JIKA SEDANG DI LUAR DOMISILI / BERHALANGAN</span>
          </h3>
          <p>Bagaimana jika kamu sedang:</p>
          <div class="flex flex-wrap gap-2 text-xs font-mono">
            <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">✈️ Liburan</span>
            <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">💼 Bekerja / Lembur</span>
            <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">📋 Dinas / Tugas Luar</span>
            <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">🚢 Bekerja di Kapal / Berlayar</span>
            <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">🏙️ Berada di luar kota</span>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed">
            Jika kondisi tersebut menyebabkan kamu tidak dapat hadir di Meetup domisili, yang terpenting adalah <strong>memberikan informasi yang jujur kepada Staff Meet</strong>.
          </p>
          <div class="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <i class="fas fa-info-circle text-amber-400 flex-shrink-0"></i>
            <span>Apabila Vice Leader melakukan konfirmasi, member wajib memberikan keterangan dan bukti yang valid sesuai kondisi sebenarnya (status akan diubah menjadi IZIN dan poin aman).</span>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <h3 class="text-base font-bold font-orbitron text-emerald-300 flex items-center gap-2">
            <span>🏆 3. POIN KEHADIRAN JUGA MENJADI REWARD</span>
          </h3>
          <p class="text-xs text-gray-300 leading-relaxed">
            Selain sebagai sistem keaktifan, poin kehadiran juga menjadi bagian dari program reward member aktif. Semakin banyak Meetup/Gathering yang kamu ikuti, semakin banyak poin kehadiran yang kamu kumpulkan.
          </p>
          <div class="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
            <div class="font-bold uppercase tracking-wider font-orbitron text-emerald-300">🎁 Kesempatan Undian Hadiah Tahunan Member Aktif:</div>
            <div class="flex flex-wrap gap-3">
              <span class="px-3 py-1 rounded-lg bg-black/60 border border-emerald-500/40 text-emerald-400 font-mono">💰 Uang Tunai</span>
              <span class="px-3 py-1 rounded-lg bg-black/60 border border-emerald-500/40 text-emerald-400 font-mono">👑 Avatar VIP Eksklusif</span>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
          <h3 class="text-base font-bold font-orbitron text-red-400 flex items-center gap-2">
            <span>⚠️ 4. JIKA POIN MENCAPAI -2 POIN (SANKSI TEGURAN)</span>
          </h3>
          <p class="text-xs text-gray-300">
            Jika member tidak hadir pada Meetup di wilayah domisilinya sebanyak 2 kali tanpa izin:
          </p>
          <div class="space-y-1.5 text-xs font-mono">
            <div class="text-red-300">❌ Tidak hadir 1x di domisili ➔ <strong>-1 poin</strong></div>
            <div class="text-red-400">❌ Tidak hadir 2x di domisili ➔ <strong>-2 poin</strong></div>
            <div class="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 font-bold flex items-center gap-2">
              <i class="fas fa-exclamation-triangle text-red-400 text-base"></i>
              <span>⚠️ Akumulasi -2 Poin ➔ 1x TEGURAN RESMI DARI VICE LEADER</span>
            </div>
          </div>
          <p class="text-xs text-gray-400">
            *Member yang terkena teguran masih diberikan kesempatan untuk memulihkan poin sesuai ketentuan yang berlaku.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
