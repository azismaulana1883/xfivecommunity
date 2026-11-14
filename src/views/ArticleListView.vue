<template>
  <div class="min-h-screen bg-[#070a10] text-gray-200 font-sans pb-24 selection:bg-cyan-500 selection:text-black">
    <!-- HERO HEADER -->
    <section class="relative pt-12 pb-8 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.06)_0%,transparent_70%)] pointer-events-none"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(0,255,255,0.15)]">
          <BookOpen class="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>XFIVE OFFICIAL ARTICLES &amp; NEWS</span>
        </div>

        <h1 class="text-3xl md:text-5xl font-black font-orbitron uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-pink-500 mb-3">
          XFIVE ARTICLES
        </h1>
        <p class="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Warta resmi, panduan teknis, pengumuman kejuaraan, dan wawasan seputar ekosistem komunitas Audition AyoDance XFIVE.
        </p>

        <!-- SEARCH & FILTER TOOLBAR -->
        <div class="mt-8 flex flex-col md:flex-row items-center justify-between gap-3 max-w-3xl mx-auto p-2 sm:p-2.5 rounded-2xl bg-[#0d131f]/90 border border-white/10 shadow-2xl backdrop-blur-md">
          <!-- Search Input -->
          <div class="relative w-full md:flex-1">
            <Search class="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              type="text"
              placeholder="Cari judul, topik, atau kata kunci artikel..."
              class="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/60 border border-white/5 focus:border-cyan-400 text-cyan-300 font-mono text-xs sm:text-sm outline-none transition"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="text-gray-500 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Category Quick Dropdown on Mobile / Label -->
          <div class="w-full md:w-auto flex items-center justify-between gap-2 px-1 text-xs font-mono text-gray-400">
            <span>Kategori:</span>
            <select
              v-model="selectedCategory"
              @change="onCategoryChange"
              class="px-3 py-2 rounded-xl bg-black/60 border border-cyan-500/30 text-cyan-300 font-orbitron text-xs outline-none cursor-pointer"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
        </div>

        <!-- CATEGORY PILLS (DESKTOP) -->
        <div class="hidden sm:flex flex-wrap items-center justify-center gap-2 mt-4 max-w-3xl mx-auto">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="setCategory(cat)"
            class="px-3 py-1.5 rounded-xl text-xs font-orbitron transition-all cursor-pointer whitespace-nowrap"
            :class="
              selectedCategory === cat
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,255,0.35)]'
                : 'bg-black/50 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            "
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </section>

    <!-- CONTENT BODY -->
    <main class="container mx-auto px-4 max-w-6xl mt-4">
      <!-- LOADING STATE -->
      <div v-if="loading" class="py-20 text-center">
        <RefreshCw class="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
        <p class="text-sm font-mono text-gray-400">Memuat artikel komunitas...</p>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="error" class="py-16 text-center max-w-md mx-auto p-6 rounded-2xl bg-red-950/40 border border-red-500/40">
        <AlertTriangle class="w-8 h-8 text-red-400 mx-auto mb-2" />
        <h3 class="text-sm font-orbitron font-bold text-red-300 mb-1">Gagal Memuat Data</h3>
        <p class="text-xs text-gray-400 font-mono mb-4">{{ error }}</p>
        <button
          @click="fetchArticles"
          class="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono transition cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="articles.length === 0" class="py-20 text-center max-w-md mx-auto p-8 rounded-2xl bg-[#0c121e]/80 border border-white/5">
        <FileText class="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h3 class="text-base font-orbitron font-bold text-gray-300 mb-1">Tidak Ada Artikel Ditemukan</h3>
        <p class="text-xs text-gray-400 font-mono mb-4">
          Belum ada artikel yang cocok dengan pencarian "{{ searchQuery }}" atau kategori "{{ selectedCategory }}".
        </p>
        <button
          @click="resetFilters"
          class="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition cursor-pointer"
        >
          Reset Filter &amp; Tampilkan Semua
        </button>
      </div>

      <!-- ARTICLES LIST -->
      <div v-else class="space-y-10 animate-fade-in">
        <!-- 1. FEATURED ARTICLE HERO BANNER (Hanya tampil di halaman 1 jika tidak sedang search) -->
        <article
          v-if="featuredArticle && page === 1 && !searchQuery && (selectedCategory === 'Semua' || selectedCategory === 'all')"
          class="relative rounded-3xl border border-cyan-500/40 bg-[#0d131f] p-5 sm:p-7 shadow-[0_0_50px_rgba(0,255,255,0.12)] overflow-hidden group hover:border-cyan-400 transition-all duration-300"
        >
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <!-- Cover 16:9 Image -->
            <div class="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-video bg-black/60 border border-white/10 group-hover:border-cyan-500/30 transition">
              <img
                :src="featuredArticle.cover_image || defaultCover"
                :alt="featuredArticle.title"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
                @error="onImageError"
              />
              <div class="absolute top-3 left-3 flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-lg bg-pink-600 text-white font-orbitron font-bold text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                  ★ FEATURED
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-orbitron text-[10px] font-bold uppercase">
                  {{ featuredArticle.category }}
                </span>
              </div>
            </div>

            <!-- Content Meta -->
            <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <span class="flex items-center gap-1.5 text-cyan-400">
                    <Calendar class="w-3.5 h-3.5" />
                    {{ formatDate(featuredArticle.published_at) }}
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1.5 text-gray-400">
                    <Clock class="w-3.5 h-3.5" />
                    {{ featuredArticle.read_time }}
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1.5 text-gray-400">
                    <Eye class="w-3.5 h-3.5" />
                    {{ featuredArticle.views }}
                  </span>
                </div>

                <h2 class="text-xl sm:text-2xl font-black font-orbitron uppercase tracking-wide text-white group-hover:text-cyan-300 transition leading-snug">
                  <RouterLink :to="`/article/${featuredArticle.slug}`">
                    {{ featuredArticle.title }}
                  </RouterLink>
                </h2>

                <p class="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3 font-sans">
                  {{ featuredArticle.excerpt }}
                </p>
              </div>

              <!-- Author & Action -->
              <div class="pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-2.5">
                  <img
                    :src="featuredArticle.author_avatar || defaultAvatar"
                    :alt="featuredArticle.author_name"
                    class="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/40 object-cover"
                  />
                  <div>
                    <div class="text-xs font-bold text-white font-orbitron">{{ featuredArticle.author_name }}</div>
                    <div class="text-[10px] font-mono text-cyan-400 uppercase">{{ featuredArticle.author_role }}</div>
                  </div>
                </div>

                <RouterLink
                  :to="`/article/${featuredArticle.slug}`"
                  class="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.3)] cursor-pointer"
                >
                  <span>Baca Artikel</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </RouterLink>
              </div>
            </div>
          </div>
        </article>

        <!-- 2. GRID KARTU ARTIKEL (3 Kolom Desktop / 2 Kolom Tablet / 1 Kolom Mobile) -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm sm:text-base font-bold font-orbitron uppercase tracking-widest text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Daftar Artikel Komunitas</span>
            </h3>
            <span class="text-xs font-mono text-gray-400">
              Menampilkan {{ displayArticles.length }} dari {{ totalArticles }} artikel
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="item in displayArticles"
              :key="item.id"
              class="rounded-2xl border border-white/5 hover:border-cyan-500/40 bg-[#0c121e]/90 hover:bg-[#0e1626] transition-all duration-300 flex flex-col overflow-hidden group shadow-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]"
            >
              <!-- Thumbnail 16:9 -->
              <RouterLink :to="`/article/${item.slug}`" class="relative block aspect-video bg-black/60 overflow-hidden">
                <img
                  :src="item.cover_image || defaultCover"
                  :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                  @error="onImageError"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#0c121e] via-transparent to-transparent opacity-60"></div>
                <!-- Category Badge -->
                <span
                  class="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[10px] font-orbitron font-bold uppercase tracking-wider backdrop-blur-md border"
                  :class="getCategoryBadgeClass(item.category)"
                >
                  {{ item.category }}
                </span>
                <span class="absolute bottom-2 right-3 text-[10px] text-gray-300 font-mono bg-black/70 px-2 py-0.5 rounded backdrop-blur">
                  👁️ {{ item.views }}
                </span>
              </RouterLink>

              <!-- Card Body -->
              <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                    <span>{{ formatDate(item.published_at) }}</span>
                    <span>•</span>
                    <span>{{ item.read_time }}</span>
                  </div>

                  <h4 class="font-bold font-orbitron text-base text-white group-hover:text-cyan-300 transition line-clamp-2 leading-snug">
                    <RouterLink :to="`/article/${item.slug}`">
                      {{ item.title }}
                    </RouterLink>
                  </h4>

                  <p class="text-xs text-gray-400 font-sans line-clamp-3 leading-relaxed">
                    {{ item.excerpt || 'Baca selengkapnya mengenai informasi dan pembaruan resmi komunitas XFIVE...' }}
                  </p>
                </div>

                <!-- Footer Author & Link -->
                <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2 min-w-0">
                    <img
                      :src="item.author_avatar || defaultAvatar"
                      :alt="item.author_name"
                      class="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/30 object-cover shrink-0"
                    />
                    <span class="text-gray-300 font-mono text-[11px] truncate">{{ item.author_name }}</span>
                  </div>

                  <RouterLink
                    :to="`/article/${item.slug}`"
                    class="text-cyan-400 hover:text-cyan-300 font-orbitron text-[11px] font-bold flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition"
                  >
                    <span>Baca</span>
                    <ChevronRight class="w-3.5 h-3.5" />
                  </RouterLink>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- PAGINATION -->
        <div v-if="totalPages > 1" class="pt-6 flex justify-center items-center gap-2">
          <button
            @click="goToPage(page - 1)"
            :disabled="page <= 1"
            class="px-3.5 py-2 rounded-xl border border-white/10 bg-black/40 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-mono transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            @click="goToPage(p)"
            class="w-9 h-9 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer"
            :class="
              page === p
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white'
            "
          >
            {{ p }}
          </button>

          <button
            @click="goToPage(page + 1)"
            :disabled="page >= totalPages"
            class="px-3.5 py-2 rounded-xl border border-white/10 bg-black/40 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-mono transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <span>Selanjutnya</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useSeo } from '@/composables/useSeo';
import { useAutoSync } from '@/composables/useDataSync';
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  FileText,
} from 'lucide-vue-next';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  category: string;
  tags: string | null;
  excerpt: string | null;
  author_name: string;
  author_role: string;
  author_avatar: string | null;
  status: string;
  views: number;
  read_time: string;
  published_at: string;
  created_at: string;
}

const defaultCover = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
const defaultAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=xfive-article';

const articles = ref<ArticleItem[]>([]);
const categories = ref<string[]>(['Semua', 'Komunitas', 'Panduan', 'Event', 'Turnamen', 'Pengumuman']);
const loading = ref(true);
const error = ref('');

const searchQuery = ref('');
const selectedCategory = ref('Semua');
const page = ref(1);
const limit = ref(9);
const totalArticles = ref(0);
const totalPages = ref(1);

let searchTimeout: any = null;

const featuredArticle = computed(() => {
  return articles.value.length > 0 ? articles.value[0] : null;
});

const displayArticles = computed(() => {
  // Jika sedang di halaman 1 dan ada featured, kartu bawah menampilkan sisanya agar tidak dobel
  if (page.value === 1 && !searchQuery.value && (selectedCategory.value === 'Semua' || selectedCategory.value === 'all')) {
    return articles.value.slice(1);
  }
  return articles.value;
});

const fetchArticles = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
    };

    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }

    if (selectedCategory.value && selectedCategory.value !== 'Semua' && selectedCategory.value !== 'all') {
      params.category = selectedCategory.value;
    }

    const res = await axios.get('/api/v1/articles', { params });
    if (res.data && res.data.success) {
      articles.value = res.data.data || [];
      totalArticles.value = res.data.pagination?.total || 0;
      totalPages.value = res.data.pagination?.totalPages || 1;

      if (res.data.categories && res.data.categories.length > 0) {
        categories.value = res.data.categories;
      }
    } else {
      error.value = res.data?.message || 'Gagal memuat artikel.';
    }
  } catch (err: any) {
    console.error('fetchArticles error:', err);
    error.value = err.response?.data?.message || err.message || 'Gagal terhubung ke server.';
  } finally {
    loading.value = false;
  }
};

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchArticles();
  }, 350);
};

const clearSearch = () => {
  searchQuery.value = '';
  page.value = 1;
  fetchArticles();
};

const setCategory = (cat: string) => {
  selectedCategory.value = cat;
  page.value = 1;
  fetchArticles();
};

const onCategoryChange = () => {
  page.value = 1;
  fetchArticles();
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'Semua';
  page.value = 1;
  fetchArticles();
};

const goToPage = (p: number) => {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
  fetchArticles();
  window.scrollTo({ top: 300, behavior: 'smooth' });
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getCategoryBadgeClass = (cat: string) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('event') || c.includes('turnamen') || c.includes('tournament')) {
    return 'bg-pink-950/80 border-pink-500/40 text-pink-300';
  }
  if (c.includes('panduan') || c.includes('guide') || c.includes('tips')) {
    return 'bg-amber-950/80 border-amber-500/40 text-amber-300';
  }
  if (c.includes('pengumuman') || c.includes('announcement')) {
    return 'bg-purple-950/80 border-purple-500/40 text-purple-300';
  }
  return 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300';
};

const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = defaultCover;
  }
};

const { updateSeo } = useSeo();

useAutoSync('articles', fetchArticles);

onMounted(() => {
  updateSeo({
    title: 'Katalog Warta & Artikel Resmi - XFIVE Ayodance Community',
    description: 'Pusat publikasi warta resmi, panduan gameplay, info turnamen, event, patch update, dan dokumentasi komunitas Audition AyoDance XFIVE.',
    keywords: 'ayodance, xfive, artikel, turnamen, tips perfect, berita ayodance, event ayodance',
    url: 'https://www.xfivephoto.com/articles',
    type: 'website',
  });
  fetchArticles();
});
</script>
