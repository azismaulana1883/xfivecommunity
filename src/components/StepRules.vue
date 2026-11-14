<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['next']);
const accepted = ref(false);

const rules = [
  {
    title: 'BAB I – KETENTUAN UMUM',
    items: [
      { subtitle: 'Pasal 1 – Tujuan', content: '1. Komunitas XFIVE dibentuk sebagai wadah kebersamaan, bermain, dan bersosialisasi antar pemain AyoDance.\n2. Tujuan utama adalah menciptakan lingkungan bermain yang nyaman, aman, dan solid.\n3. Komunitas XFIVE juga berperan sebagai wadah gathering (gath) berskala nasional se-Indonesia.\n4. Semua anggota wajib membaca dan mematuhi aturan sebelum melakukan aktivitas di komunitas.' },
      { subtitle: 'Pasal 2 – Keanggotaan', content: '1. Anggota adalah setiap pemain AyoDance yang resmi bergabung dengan XFIVE.\n2. Anggota wajib menjaga nama baik komunitas serta berpartisipasi aktif dalam kegiatan.\n3. Khusus anggota divisi club, dilarang berpindah ke com tanpa izin pengurus.\n4. Batas nickname com 3 (com X5 | com luar | com luar).' }
    ]
  },
  {
    title: 'BAB II – IDENTITAS KOMUNITAS',
    items: [
      { subtitle: 'Pasal 3 – Nama & Format Nick', content: '1. Nama resmi komunitas adalah XFIVE (X5).\n2. Anggota dianjurkan menggunakan title/nickname dengan identitas nickX5 sesuai ketentuan.\n3. Dilarang melepas title "X5" tanpa persetujuan Leader/Staff.' },
      {
        subtitle: 'Pasal 3A – Kewajiban Nickname di Semua Akun',
        content:
          '1. Setiap anggota WAJIB menggunakan nickname/identitas XFIVE pada:\n' +
          '   • Akun utama (yang sering dipakai)\n' +
          '   ATAU\n' +
          '   • Akun second (yang sering dipakai)\n\n' +
          '2. Apabila akun utama sedang GB/TOUR/EVENT, anggota WAJIB menginformasikan ke Staff terkait.\n\n' +
          '3. SANKSI PELANGGARAN (SANKSI KERAS):\n' +
          '   1) Peringatan Ringan 1x\n' +
          '   2) Blacklist member selama 6 bulan\n' +
          '      (tidak bisa bergabung dengan XFIVE selama masa blacklist berjalan).'
      }
    ]
  },
  {
    title: 'BAB III – TATA TERTIB',
    items: [
      { subtitle: 'Pasal 4 – Etika & Perilaku', content: '1. Anggota wajib menjunjung tinggi etika, adab, dan sopan santun.\n2. Dilarang melakukan diskriminasi atau berdiskusi mengenai SARA maupun politik.\n3. Dilarang menggunakan bahasa kasar, menghina, atau memprovokasi sesama anggota.\n4. Dilarang membawa masalah personal ke komunitas.\n5. Hubungan/pacaran sesama anggota diperbolehkan, namun masalah hubungan tidak boleh dicampuradukkan ke komunitas.\n6. Wajib menyapa sesama anggota dengan sapaan khas “X5!”' },
      { subtitle: 'Pasal 5 – Konten & Media', content: '1. Dilarang mengirim konten pornografi, narkoba, judi, atau kekerasan.\n2. Konten berupa edit, fanart, atau meme AyoDance diperbolehkan selama tidak melanggar etika.\n3. Dilarang chatting secara pribadi dengan anggota lain jika menimbulkan rasa risih.\n4. Dilarang memposting masalah internal club XFIVE di luar komunitas.\n5. Dilarang menyebarkan nomor WhatsApp atau data pribadi anggota lain tanpa izin.' },
      { subtitle: 'Pasal 6 – Aktivitas & Gathering', content: '1. Setiap anggota wajib menghadiri Gathering (Gath) sesuai domisili masing-masing, sebagaimana diatur lebih lanjut dalam Pasal 6A.\n2. Gathering diadakan secara rutin oleh pengurus/staff domisili.\n3. Kehadiran gath menjadi tolak ukur loyalitas & partisipasi aktif anggota.' },
      {
        subtitle: 'Pasal 6A – Kewajiban Meetup/Gathering & Poin Kehadiran',
        content:
          '1. Setiap anggota yang berdomisili di wilayah berikut WAJIB menghadiri acara Meetup/Gathering sesuai domisili masing-masing:\n' +
          '   • Jakarta\n' +
          '   • Tangerang\n' +
          '   • Bekasi\n' +
          '   • Bogor-Depok\n\n' +
          '2. Ketentuan pasal ini berlaku khusus untuk 4 (empat) wilayah domisili tersebut.\n\n' +
          '3. Setiap kehadiran dihitung sebagai 1 (satu) poin kehadiran. Periode penilaian adalah 12 bulan (1 tahun).\n\n' +
          '4. Apabila anggota tidak hadir pada Meetup/Gathering di domisilinya, maka poin kehadiran anggota tersebut dikurangi 1 (minus 1).\n\n' +
          '5. Apabila poin anggota mencapai minus 2, anggota diberikan 1 (satu) kali teguran sesuai Pasal 9.\n\n' +
          '6. Apabila anggota berhalangan hadir pada acara di domisilinya, anggota dapat hadir di Meetup/Gathering domisili lain untuk memulihkan poin kehadiran.\n\n' +
          '7. Rekap poin kehadiran dilakukan setiap akhir tahun dan dikelompokkan ke dalam kategori: 1–3 poin, 4–6 poin, 7–10 poin, dan 11–12 poin.\n\n' +
          '8. Setiap kategori poin mendapatkan hadiah yang berbeda. Semakin banyak poin kehadiran yang terkumpul, semakin besar hadiah yang berhak diikuti.\n\n' +
          '9. Anggota yang hadir secara konsisten berhak mengikuti undian berhadiah uang tunai atau avatar VIP yang diadakan setiap tahun.'
      },
      { subtitle: 'Pasal 7 – Game Play & Club Battle', content: '1. DILARANG KERAS menggunakan program ilegal/cheat dalam bentuk apa pun (Taskey, ACV, Auto, dll).\n2. Setiap anggota diwajibkan menjunjung tinggi kejujuran, sportivitas, dan fair play.\n3. Pelanggaran terhadap aturan ini akan dikenakan sanksi tegas berupa Blacklist Permanen.' }
    ]
  },
  {
    title: 'BAB IV – PENYELESAIAN MASALAH',
    items: [
      { subtitle: 'Pasal 8 – Konflik Internal', content: '1. Jika ada masalah antar anggota, wajib diselesaikan dengan konfirmasi kepada V.Leader / Staff.\n2. Anggota dilarang keluar sendiri tanpa klarifikasi, karena pengurus akan membantu mencari solusi terbaik.' }
    ]
  },
  {
    title: 'BAB V – SANKSI',
    items: [
      { subtitle: 'Pasal 9 – Jenis Sanksi', content: '1. Teguran lisan/tertulis untuk pelanggaran ringan.\n2. Surat Peringatan (SP) maksimal 3 kali.\n3. Banned sementara (1 minggu – 1 bulan).\n4. Blacklist Permanen untuk penggunaan cheat atau penipuan.\n5. Semua sanksi diputuskan oleh pengurus/owner dan bersifat final.' }
    ]
  },
  {
    title: 'BAB VI – PENUTUP',
    items: [
      { subtitle: 'Pasal 10 – Penegakan Aturan', content: '1. Semua anggota wajib mematuhi aturan ini demi menjaga kenyamanan bersama.\n2. Aturan dapat diperbarui sewaktu-waktu sesuai kebutuhan komunitas.' }
    ]
  }
];
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-center glitch-text font-orbitron mb-6">RULES COMMUNITY</h2>

    <div class="h-96 overflow-y-auto pr-4 space-y-6 custom-scrollbar border border-gray-800 p-6 rounded-xl bg-black/50 text-left">
      <div v-for="(section, idx) in rules" :key="idx" class="space-y-4">
        <h3 class="text-neon-blue font-bold text-lg border-b border-gray-800 pb-2">{{ section.title }}</h3>
        <div v-for="(item, i) in section.items" :key="i" class="ml-2">
          <h4 class="text-neon-purple font-semibold text-sm mb-1">{{ item.subtitle }}</h4>
          <p class="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{{ item.content }}</p>
        </div>
      </div>

      <div class="mt-6 p-4 border border-red-900/50 bg-red-900/10 rounded-lg">
        <p class="text-red-400 text-xs font-bold text-center">PERINGATAN: PELANGGARAN ATURAN DAPAT MENYEBABKAN PENGELUARAN DARI KOMUNITAS.</p>
      </div>
    </div>

    <div class="flex items-center justify-center gap-3 pt-4 border-t border-gray-800">
      <input
        type="checkbox"
        id="agree"
        v-model="accepted"
        class="w-5 h-5 accent-neon-blue bg-gray-900 border-gray-600 rounded cursor-pointer"
      >
      <label for="agree" class="cursor-pointer select-none text-sm md:text-base text-gray-300 hover:text-white transition-colors">
        Saya telah membaca dan menyetujui semua aturan di atas.
      </label>
    </div>

    <div class="flex justify-center">
      <button
        @click="$emit('next')"
        :disabled="!accepted"
        class="btn w-full md:w-auto"
      >
        LANJUTKAN
      </button>
    </div>
  </div>
</template>
