<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
    <div class="w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(0,255,255,0.15)] relative max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">
            <i class="fas fa-question-circle"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black font-orbitron text-white uppercase tracking-wider">
              PETUNJUK BERMAIN (HOW TO PLAY)
            </h3>
            <p class="text-xs font-mono text-cyan-400">Ketentuan &amp; Regulasi Gacha Poin Meetup XFIVE</p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <i class="fas fa-times text-sm"></i>
        </button>
      </div>

      <!-- Rules Content Scrollable -->
      <div class="overflow-y-auto space-y-4 pr-1 text-xs text-gray-300 font-mono leading-relaxed custom-scrollbar flex-1">
        <!-- Rule 1: Point Conversion -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div class="font-bold text-white font-orbitron uppercase text-xs flex items-center gap-2 text-cyan-400">
            <i class="fas fa-coins"></i>
            <span>1. Poin Kehadiran Meetup sebagai Tiket Gacha</span>
          </div>
          <p>
            Poin yang digunakan untuk memutar Gacha adalah akumulasi dari <strong>kehadiran meetup resmi XFIVE</strong> di domisili Anda.
          </p>
          <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            &bull; <strong>1 Poin Meetup = 1x Kesempatan Roll Gacha</strong>.<br/>
            &bull; Pilihan penarikan: <strong>Random 1x</strong> (1 Poin), <strong>Random 5x</strong> (5 Poin), dan <strong>Random 10x</strong> (10 Poin).
          </div>
        </div>

        <!-- Rule 2: Voucher Mi-Cash Mechanism -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div class="font-bold text-white font-orbitron uppercase text-xs flex items-center gap-2 text-emerald-400">
            <i class="fas fa-ticket"></i>
            <span>2. Klaim Hadiah Mi-Cash (Megaxus) &amp; Keamanan Kode</span>
          </div>
          <p>
            Jika Anda beruntung mendapatkan hadiah <strong>Mi-Cash</strong>, sistem secara otomatis memberikan <strong>Kode Voucher (12 digit) &amp; Password</strong> langsung di layar pop-up kemenangan saat itu juga.
          </p>
          <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200">
            ⚠️ <strong>PENTING:</strong> Segera simpan atau langsung redeem kode voucher tersebut ke akun Megaxus Anda. Demi keamanan akun Anda dari orang lain yang mengetahui member code Anda, kode voucher <strong>tidak akan ditampilkan secara terbuka</strong> pada menu riwayat publik.
          </div>
        </div>

        <!-- Rule 3: VIP & Others Mechanism -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div class="font-bold text-white font-orbitron uppercase text-xs flex items-center gap-2 text-purple-400">
            <i class="fas fa-crown"></i>
            <span>3. Hadiah VIP &amp; Hadiah Fisik (Others)</span>
          </div>
          <p>
            Jika Anda memenangkan hadiah <strong>VIP (72k, 120k, dll)</strong> atau <strong>Others (Merchandise/Jersey)</strong>:
          </p>
          <ul class="list-disc pl-5 space-y-1 text-gray-300">
            <li>Sistem akan menerbitkan <strong>Kode Tiket Klaim Resmi</strong> (contoh: <code>TKT-VIP-202611-XXXX</code>).</li>
            <li>Silakan klik tombol <strong>"Hubungi Staff via WhatsApp"</strong> untuk melakukan konfirmasi penyerahan hadiah oleh Dewan Staff / Vice Leader.</li>
          </ul>
        </div>

        <!-- Rule 4: ZONK Mechanism -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div class="font-bold text-white font-orbitron uppercase text-xs flex items-center gap-2 text-red-400">
            <i class="fas fa-bomb"></i>
            <span>4. Mekanisme ZONK</span>
          </div>
          <p>
            Setiap penarikan gacha memiliki kemungkinan mendapatkan <strong>ZONK</strong> (Belum Beruntung), yang dihitung transparan dari sisa total drop rate hadiah. Poin yang digunakan untuk roll ZONK tidak dapat dikembalikan. Terus hadiri meetup berikutnya untuk menambah saldo poin!
          </p>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="pt-3 border-t border-white/10 flex justify-end">
        <button
          type="button"
          @click="emit('close')"
          class="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
        >
          Mengerti
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close']);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
