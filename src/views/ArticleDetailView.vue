<template>
  <div class="min-h-screen bg-[#070a10] text-gray-200 font-sans pb-24 selection:bg-cyan-500 selection:text-black">
    <!-- BACKGROUND GRID & GLOW -->
    <div class="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.06)_0%,transparent_60%)] pointer-events-none"></div>
    <div class="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

    <div class="container mx-auto px-4 max-w-4xl relative z-10 pt-8 sm:pt-12">
      <!-- BREADCRUMB -->
      <nav class="flex items-center gap-2 text-xs font-mono text-gray-400 mb-6 flex-wrap">
        <RouterLink to="/" class="hover:text-cyan-400 transition flex items-center gap-1">
          <Home class="w-3.5 h-3.5" />
          <span>Beranda</span>
        </RouterLink>
        <span>/</span>
        <RouterLink to="/articles" class="hover:text-cyan-400 transition">
          Articles
        </RouterLink>
        <span>/</span>
        <span v-if="article" class="text-cyan-400 font-bold truncate max-w-[200px] sm:max-w-xs">
          {{ article.title }}
        </span>
      </nav>

      <!-- LOADING STATE -->
      <div v-if="loading" class="py-24 text-center">
        <RefreshCw class="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
        <p class="text-sm font-mono text-gray-400">Memuat artikel...</p>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="error || !article" class="py-20 text-center max-w-md mx-auto p-8 rounded-2xl bg-[#0d121c] border border-red-500/30">
        <AlertTriangle class="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 class="text-lg font-orbitron font-bold text-white mb-2">Artikel Tidak Ditemukan</h2>
        <p class="text-xs text-gray-400 font-mono mb-6">
          {{ error || 'Artikel yang kamu tuju mungkin telah dihapus atau belum dipublikasikan ke publik.' }}
        </p>
        <RouterLink
          to="/articles"
          class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition inline-flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,255,0.3)]"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Kembali ke Daftar Artikel</span>
        </RouterLink>
      </div>

      <!-- ARTICLE DETAIL CONTENT -->
      <article v-else class="space-y-8 animate-fade-in">
        <!-- HEADER METADATA -->
        <header class="space-y-4">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span
              class="px-3 py-1 rounded-lg text-xs font-orbitron font-bold uppercase tracking-wider border backdrop-blur"
              :class="getCategoryBadgeClass(article.category)"
            >
              {{ article.category }}
            </span>

            <span
              v-if="article.status === 'DRAFT'"
              class="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs uppercase"
            >
              ⚠ STATUS DRAFT (HANYA ADMIN)
            </span>

            <div class="flex items-center gap-3 text-xs text-gray-400 font-mono ml-auto">
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-cyan-400" />
                {{ article.read_time }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <Eye class="w-3.5 h-3.5 text-cyan-400" />
                {{ article.views }} views
              </span>
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-2xl sm:text-4xl md:text-5xl font-black font-orbitron uppercase tracking-wide text-white leading-tight">
            {{ article.title }}
          </h1>

          <!-- Author Box Top -->
          <div class="flex items-center justify-between flex-wrap gap-4 pt-3 border-t border-white/5">
            <div class="flex items-center gap-3">
              <img
                :src="article.author_avatar || defaultAvatar"
                :alt="article.author_name"
                class="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/40 object-cover"
              />
              <div>
                <div class="text-sm font-bold text-white font-orbitron flex items-center gap-2">
                  <span>{{ article.author_name }}</span>
                  <span class="px-2 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono uppercase">
                    {{ article.author_role }}
                  </span>
                </div>
                <div class="text-[11px] font-mono text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar class="w-3 h-3 text-gray-500" />
                  <span>Diterbitkan pada {{ formatDateFull(article.published_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Share Buttons (Top Bar) -->
            <div class="flex items-center gap-1.5">
              <button
                @click="shareWhatsApp"
                class="w-8 h-8 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition cursor-pointer"
                title="Bagikan ke WhatsApp"
              >
                <i class="fab fa-whatsapp text-sm"></i>
              </button>
              <button
                @click="copyArticleLink"
                class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                title="Salin tautan artikel"
              >
                <Share2 class="w-3.5 h-3.5" />
                <span class="text-[11px]">{{ copiedLink ? 'Tersalin!' : 'Salin Link' }}</span>
              </button>
            </div>
          </div>
        </header>

        <!-- COVER IMAGE BANNER -->
        <div class="relative rounded-3xl overflow-hidden aspect-video bg-black/60 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,255,255,0.15)] group">
          <img
            :src="article.cover_image || defaultCover"
            :alt="article.title"
            class="w-full h-full object-cover"
            @error="onImageError"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#070a10] via-transparent to-transparent opacity-40 pointer-events-none"></div>
        </div>

        <!-- EXCERPT CALLOUT -->
        <div v-if="article.excerpt" class="p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border-l-4 border-cyan-400 border-y border-r border-white/5 font-sans text-sm sm:text-base text-cyan-100 leading-relaxed italic">
          "{{ article.excerpt }}"
        </div>

        <!-- ARTICLE BODY (PARSED MARKDOWN / HTML) -->
        <div
          class="article-content font-sans text-gray-200 text-sm sm:text-base leading-relaxed space-y-4"
          v-html="renderedContent"
        ></div>

        <!-- TAGS -->
        <div v-if="tagsList.length > 0" class="pt-6 border-t border-white/10 flex items-center gap-2 flex-wrap">
          <span class="text-xs font-mono text-gray-400 flex items-center gap-1">
            <Tag class="w-3.5 h-3.5 text-cyan-400" />
            <span>Tags:</span>
          </span>
          <span
            v-for="t in tagsList"
            :key="t"
            class="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-gray-300 font-mono text-xs hover:border-cyan-500/40 transition"
          >
            #{{ t }}
          </span>
        </div>

        <!-- AUTHOR PROFILE FOOTER CARD -->
        <div class="p-6 rounded-2xl border border-white/10 bg-[#0d131f]/90 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            :src="article.author_avatar || defaultAvatar"
            :alt="article.author_name"
            class="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/40 object-cover shrink-0"
          />
          <div class="text-center sm:text-left space-y-1 flex-1">
            <div class="flex items-center justify-center sm:justify-start gap-2">
              <h3 class="font-bold font-orbitron text-base text-white">{{ article.author_name }}</h3>
              <span class="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] uppercase font-bold">
                {{ article.author_role }}
              </span>
            </div>
            <p class="text-xs text-gray-400 leading-relaxed font-sans">
              Pengurus resmi komunitas Audition AyoDance XFIVE yang berwenang menerbitkan warta, jadwal turnamen, dan regulasi komunitas.
            </p>
          </div>
        </div>

        <!-- SHARE BOTTOM BAR -->
        <div class="p-4 rounded-2xl border border-cyan-500/20 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <span class="text-gray-300 flex items-center gap-2">
            <Share2 class="w-4 h-4 text-cyan-400" />
            <span>Bagikan artikel ini ke teman room atau squad kamu:</span>
          </span>

          <div class="flex items-center gap-2 flex-wrap">
            <button
              @click="shareWhatsApp"
              class="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-orbitron text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <i class="fab fa-whatsapp"></i>
              <span>WhatsApp</span>
            </button>
            <button
              @click="shareDiscord"
              class="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-orbitron text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <i class="fab fa-discord"></i>
              <span>Discord</span>
            </button>
            <button
              @click="copyArticleLink"
              class="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-orbitron text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>{{ copiedLink ? 'Tautan Tersalin' : 'Salin Tautan' }}</span>
            </button>
          </div>
        </div>

        <!-- RELATED ARTICLES (3 KARTU) -->
        <div v-if="relatedArticles.length > 0" class="pt-8 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold font-orbitron uppercase tracking-wider text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Artikel Terkait Lainnya</span>
            </h3>
            <RouterLink to="/articles" class="text-xs font-mono text-cyan-400 hover:underline">
              Lihat Semua &rarr;
            </RouterLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <article
              v-for="rel in relatedArticles"
              :key="rel.id"
              class="rounded-2xl border border-white/5 hover:border-cyan-500/40 bg-[#0c121e]/80 p-4 transition group flex flex-col justify-between"
            >
              <RouterLink :to="`/article/${rel.slug}`" class="block aspect-video rounded-xl overflow-hidden bg-black/60 mb-3">
                <img
                  :src="rel.cover_image || defaultCover"
                  :alt="rel.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                  @error="onImageError"
                />
              </RouterLink>

              <div class="space-y-1.5 flex-1">
                <span class="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  {{ rel.category }}
                </span>
                <h4 class="font-bold font-orbitron text-xs text-white group-hover:text-cyan-300 transition line-clamp-2 leading-snug">
                  <RouterLink :to="`/article/${rel.slug}`">
                    {{ rel.title }}
                  </RouterLink>
                </h4>
              </div>

              <div class="pt-2.5 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>{{ formatDate(rel.published_at) }}</span>
                <span>👁️ {{ rel.views }}</span>
              </div>
            </article>
          </div>
        </div>

        <!-- BOTTOM BACK BUTTON -->
        <div class="pt-8 text-center">
          <RouterLink
            to="/articles"
            class="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-orbitron font-bold text-xs uppercase tracking-wider transition inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft class="w-4 h-4 text-cyan-400" />
            <span>Kembali ke Katalog Artikel</span>
          </RouterLink>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAutoSync } from '@/composables/useDataSync';
import {
  Home,
  Calendar,
  Clock,
  Eye,
  Tag,
  Share2,
  Copy,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
} from 'lucide-vue-next';
import { useSeo } from '@/composables/useSeo';
import { useToast } from '@/composables/useToast';

const toast = useToast();

interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  category: string;
  tags: string | null;
  excerpt: string | null;
  content: string;
  author_name: string;
  author_role: string;
  author_avatar: string | null;
  status: string;
  views: number;
  read_time: string;
  published_at: string;
  created_at: string;
}

interface RelatedItem {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  category: string;
  views: number;
  read_time: string;
  published_at: string;
}

const route = useRoute();
const { updateSeo } = useSeo();
const defaultCover = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
const defaultAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=xfive-article';

const article = ref<ArticleDetail | null>(null);
const relatedArticles = ref<RelatedItem[]>([]);
const loading = ref(true);
const error = ref('');
const copiedLink = ref(false);

const tagsList = computed(() => {
  if (!article.value || !article.value.tags) return [];
  return article.value.tags
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
});

// Lightweight & Clean Cyber Markdown-to-HTML parser
const renderedContent = computed(() => {
  if (!article.value || !article.value.content) return '';
  let text = article.value.content;

  // Escape HTML entities to prevent injection
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore blockquote tag
  text = text.replace(/^&gt;\s*(.+)$/gm, '<blockquote class="my-4 p-4 rounded-xl border-l-4 border-cyan-400 bg-cyan-950/20 text-cyan-200 italic font-sans">$1</blockquote>');

  // Headings
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-lg sm:text-xl font-bold font-orbitron text-cyan-300 mt-6 mb-2 tracking-wide uppercase">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-bold font-orbitron text-white mt-8 mb-3 pb-2 border-b border-white/10 tracking-wider uppercase">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-2xl sm:text-3xl font-extrabold font-orbitron text-white mt-8 mb-4 tracking-widest uppercase">$1</h1>');

  // Horizontal rules
  text = text.replace(/^---$/gim, '<hr class="my-6 border-white/10" />');

  // Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-cyan-300 font-bold">$1</strong>');
  text = text.replace(/\*(.*?)\*/gim, '<em class="text-gray-300 italic">$1</em>');

  // Images with rich figure card & caption: ![caption](url)
  text = text.replace(/!\[(.*?)\]\((.*?)\)/gim, (_, caption, url) => {
    const cap = (caption || '').trim();
    const captionHtml = cap
      ? `<figcaption class="p-3 text-center text-xs font-mono text-cyan-200/90 bg-black/80 border-t border-white/5 flex items-center justify-center gap-2"><span class="text-cyan-400">📷</span><span>${cap}</span></figcaption>`
      : '';
    return `<figure class="my-6 rounded-2xl overflow-hidden border border-white/10 bg-black/70 shadow-xl group"><div class="relative overflow-hidden aspect-video bg-black/90 flex items-center justify-center"><img src="${url}" alt="${cap || 'Dokumentasi Artikel'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" /></div>${captionHtml}</figure>`;
  });

  // Links: [text](url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline font-semibold transition">$1</a>');

  // Unordered list items
  text = text.replace(/^\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-1">$1</li>');
  text = text.replace(/^-\s+(.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-1">$1</li>');

  // Isolate block elements with double newlines so headings/figures don't merge with paragraphs
  text = text.replace(/(<\/?(h[1-6]|blockquote|hr|figure|ul|ol|li)[^>]*>)/gi, '\n\n$1\n\n');

  // Paragraphs
  const paragraphs = text.split(/\n{2,}/);
  const parsed = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<hr') ||
        trimmed.startsWith('<figure') ||
        trimmed.startsWith('<li')
      ) {
        return trimmed;
      }
      return `<p class="leading-relaxed text-gray-200 text-sm sm:text-base my-4">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');

  return parsed;
});

const fetchArticleDetail = async () => {
  const slug = route.params.slug as string;
  if (!slug) return;

  loading.value = true;
  error.value = '';
  try {
    const res = await axios.get(`/api/v1/articles/${slug}`);
    if (res.data && res.data.success) {
      article.value = res.data.data;
      relatedArticles.value = res.data.related || [];

      // Update SEO, Meta Tags, Open Graph & Google JSON-LD Schema
      if (article.value) {
        const art = article.value;
        const pageUrl = `https://www.xfivephoto.com/article/${art.slug}`;
        const tagsArr = art.tags ? art.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
        updateSeo({
          title: art.title,
          description: art.excerpt || art.title,
          keywords: tagsArr.length > 0 ? tagsArr.join(', ') : 'ayodance, xfive, artikel, komunitas',
          image: art.cover_image || 'https://www.xfivephoto.com/img/xfive-team2.webp',
          url: pageUrl,
          type: 'article',
          author: art.author_name || 'XFIVE Official',
          publishedTime: art.published_at || art.created_at,
          modifiedTime: art.created_at,
          section: art.category,
          tags: tagsArr,
        });
      }
    } else {
      error.value = res.data?.message || 'Artikel tidak ditemukan.';
    }
  } catch (err: any) {
    console.error('fetchArticleDetail error:', err);
    error.value = err.response?.data?.message || err.message || 'Gagal memuat detail artikel.';
  } finally {
    loading.value = false;
  }
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

const formatDateFull = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getCategoryBadgeClass = (cat?: string) => {
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

const buildShareText = () => {
  const url = window.location.href;
  if (!article.value) return url;

  const art = article.value;
  const title = art.title || 'Warta Komunitas XFIVE';

  // Bersihkan markdown dan ambil sneak peak ringkas
  const rawText = (art.excerpt || art.content || '')
    .replace(/!\[.*?\]\(.*?\)/g, '') // hilangkan sintaks gambar
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // link jadi teks biasa
    .replace(/[#*`>!\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const sneakPeak = rawText.length > 200 ? `${rawText.slice(0, 200)}...` : rawText;

  let banner = '';
  if (art.cover_image) {
    banner = art.cover_image.startsWith('http')
      ? art.cover_image
      : `${window.location.origin}${art.cover_image}`;
  }

  return `*${title}*\n\n${sneakPeak}\n\n🔗 Baca selengkapnya: ${url}`;
};

const copyArticleLink = async () => {
  try {
    const textToCopy = buildShareText();
    await navigator.clipboard.writeText(textToCopy);
    copiedLink.value = true;
    toast.success('Tautan artikel berhasil disalin ke clipboard!', 'Tautan Disalin');
    setTimeout(() => {
      copiedLink.value = false;
    }, 2500);
  } catch {
    toast.info('Tautan artikel: ' + window.location.href, 'Tautan Artikel');
  }
};

const shareWhatsApp = () => {
  const message = buildShareText();
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
};

const shareDiscord = () => {
  copyArticleLink();
};

watch(
  () => route.params.slug,
  () => {
    fetchArticleDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
);

useAutoSync('articles', fetchArticleDetail);

onMounted(() => {
  fetchArticleDetail();
});
</script>

<style scoped>
:deep(.article-content p) {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
:deep(.article-content li) {
  line-height: 1.7;
}
</style>
