<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Link as LinkIcon,
  Minus
} from 'lucide-vue-next';
import { useAdminArticles, type ArticleItem } from '@/composables/admin/useAdminArticles';
import { useAdminAuth } from '@/composables/admin/useAdminAuth';
import { formatDate } from '@/utils/admin/adminFormatters';
import { compressBannerImage, formatFileSize } from '@/utils/imageCompressor';
import { adminApi } from '@/utils/admin/adminApi';

const { currentUser } = useAdminAuth();
const {
  articlesList,
  loadingArticles,
  fetchArticlesAdmin,
  fetchArticleDetail,
  saveArticle,
  toggleArticleStatus,
  deleteArticle,
} = useAdminArticles();

const articleSearch = ref('');
const articleCategoryFilter = ref('all');
const articleStatusFilter = ref('all');
const articleModalOpen = ref(false);
const deleteArticleModalOpen = ref(false);
const articleToDelete = ref<ArticleItem | null>(null);
const isSavingArticle = ref(false);
const isDeletingArticle = ref(false);
const articleFormError = ref('');
const articleEditorTab = ref<'edit' | 'preview'>('edit');
const coverInputMode = ref<'url' | 'upload'>('url');
const isUploadingCover = ref(false);
const coverDragOver = ref(false);
const coverUploadError = ref('');
const coverCompressionStats = ref<{
  original: string;
  compressed: string;
  reduction: number;
} | null>(null);

const articleContentInputRef = ref<HTMLTextAreaElement | null>(null);
const insertImageModalOpen = ref(false);
const savedContentCursorPos = ref<number | null>(null);
const inlineImageMode = ref<'url' | 'upload'>('upload');
const inlineImageUrl = ref('');
const inlineImageCaption = ref('');
const isUploadingInlineImage = ref(false);
const inlineImageDragOver = ref(false);
const inlineImageError = ref('');
const inlineImageCompressionStats = ref<{
  original: string;
  compressed: string;
  reduction: number;
} | null>(null);

const articleForm = reactive({
  id: null as number | null,
  title: '',
  slug: '',
  cover_image: '',
  category: 'Komunitas',
  tags: '',
  excerpt: '',
  content: '',
  status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
});

onMounted(() => {
  if (articlesList.value.length === 0) {
    fetchArticlesAdmin();
  }
});

const filteredArticles = computed(() => {
  let list = articlesList.value;
  if (articleCategoryFilter.value !== 'all') {
    list = list.filter((a) => (a.category || '').toLowerCase() === articleCategoryFilter.value.toLowerCase());
  }
  if (articleStatusFilter.value !== 'all') {
    list = list.filter((a) => a.status === articleStatusFilter.value);
  }
  if (articleSearch.value.trim()) {
    const q = articleSearch.value.toLowerCase().trim();
    list = list.filter(
      (a) =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.slug || '').toLowerCase().includes(q) ||
        (a.author_name || '').toLowerCase().includes(q) ||
        (a.excerpt || '').toLowerCase().includes(q) ||
        (a.tags || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const uniqueArticleCategories = computed(() => {
  const set = new Set<string>();
  articlesList.value.forEach((a) => {
    if (a.category) set.add(a.category);
  });
  return Array.from(set);
});

const articleStats = computed(() => {
  const total = articlesList.value.length;
  const published = articlesList.value.filter((a) => a.status === 'PUBLISHED').length;
  const draft = articlesList.value.filter((a) => a.status === 'DRAFT').length;
  const totalViews = articlesList.value.reduce((acc, a) => acc + (parseInt(String(a.views), 10) || 0), 0);
  return { total, published, draft, totalViews };
});

const openAddArticleModal = () => {
  articleForm.id = null;
  articleForm.title = '';
  articleForm.slug = '';
  articleForm.cover_image = '';
  articleForm.category = 'Komunitas';
  articleForm.tags = '';
  articleForm.excerpt = '';
  articleForm.content = '';
  articleForm.status = 'PUBLISHED';
  articleFormError.value = '';
  articleEditorTab.value = 'edit';
  coverInputMode.value = 'url';
  coverCompressionStats.value = null;
  coverUploadError.value = '';
  articleModalOpen.value = true;
};

const openEditArticleModal = async (art: ArticleItem) => {
  articleForm.id = art.id;
  articleForm.title = art.title || '';
  articleForm.slug = art.slug || '';
  articleForm.cover_image = art.cover_image || '';
  articleForm.category = art.category || 'Komunitas';
  articleForm.tags = art.tags || '';
  articleForm.excerpt = art.excerpt || '';
  articleForm.content = art.content || '';
  articleForm.status = art.status || 'PUBLISHED';
  articleFormError.value = '';
  articleEditorTab.value = 'edit';
  coverInputMode.value = art.cover_image && art.cover_image.startsWith('/uploads/') ? 'upload' : 'url';
  coverCompressionStats.value = null;
  coverUploadError.value = '';
  articleModalOpen.value = true;

  if (!art.content) {
    const detail = await fetchArticleDetail(art.slug || art.id);
    if (detail?.content) {
      articleForm.content = detail.content;
    }
  }
};

const handleCoverFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    await processAndUploadCover(file);
  }
};

const handleCoverDrop = async (e: DragEvent) => {
  coverDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    await processAndUploadCover(file);
  }
};

const processAndUploadCover = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    coverUploadError.value = 'File yang dipilih harus berupa gambar (JPG, PNG, WebP).';
    return;
  }

  isUploadingCover.value = true;
  coverUploadError.value = '';

  try {
    const compressed = await compressBannerImage(file, 1280, 720, 0.8);
    coverCompressionStats.value = {
      original: formatFileSize(compressed.originalSize),
      compressed: formatFileSize(compressed.compressedSize),
      reduction: compressed.reductionPercentage,
    };
    const formData = new FormData();
    formData.append('cover', compressed.file);

    const res = await adminApi.post('/api/v1/articles/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.data?.success && res.data?.url) {
      articleForm.cover_image = res.data.url;
    } else {
      coverUploadError.value = res.data?.message || 'Gagal mengunggah gambar cover.';
    }
  } catch (err: any) {
    console.error('Error compress & upload cover:', err);
    coverUploadError.value =
      err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses gambar cover.';
  } finally {
    isUploadingCover.value = false;
  }
};

const resetCoverImage = () => {
  articleForm.cover_image = '';
  coverCompressionStats.value = null;
  coverUploadError.value = '';
};

const onArticleTitleChange = () => {
  if (!articleForm.id || !articleForm.slug) {
    articleForm.slug = articleForm.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
};

const handleSaveArticle = async () => {
  if (!articleForm.title.trim()) {
    articleFormError.value = 'Judul artikel wajib diisi.';
    return;
  }
  if (!articleForm.content.trim()) {
    articleFormError.value = 'Isi konten artikel wajib diisi.';
    return;
  }

  isSavingArticle.value = true;
  articleFormError.value = '';

  const payload = {
    id: articleForm.id,
    title: articleForm.title.trim(),
    slug: articleForm.slug.trim(),
    cover_image: articleForm.cover_image.trim() || null,
    category: articleForm.category.trim() || 'Komunitas',
    tags: articleForm.tags.trim() || null,
    excerpt: articleForm.excerpt.trim() || null,
    content: articleForm.content.trim(),
    status: articleForm.status,
    author_name: currentUser.username || 'XFIVE Official',
    author_role:
      currentUser.role === 'superadmin'
        ? 'Owner'
        : currentUser.role === 'vice_leader'
        ? 'Vice Leader'
        : 'Leader',
  };

  const res = await saveArticle(payload);
  if (res.success) {
    articleModalOpen.value = false;
  } else {
    articleFormError.value = res.message || 'Gagal menyimpan artikel.';
  }
  isSavingArticle.value = false;
};

const quickToggleArticleStatus = async (art: ArticleItem) => {
  await toggleArticleStatus(art);
};

const promptDeleteArticle = (art: ArticleItem) => {
  articleToDelete.value = art;
  deleteArticleModalOpen.value = true;
};

const confirmDeleteArticle = async () => {
  if (!articleToDelete.value) return;
  isDeletingArticle.value = true;
  const res = await deleteArticle(articleToDelete.value.id);
  if (res.success) {
    deleteArticleModalOpen.value = false;
    articleToDelete.value = null;
  }
  isDeletingArticle.value = false;
};

const openInsertInlineImageModal = () => {
  const textarea = articleContentInputRef.value;
  if (textarea) {
    savedContentCursorPos.value = textarea.selectionStart;
  } else {
    savedContentCursorPos.value = articleForm.content.length;
  }

  inlineImageUrl.value = '';
  inlineImageCaption.value = '';
  inlineImageError.value = '';
  inlineImageCompressionStats.value = null;
  inlineImageMode.value = 'upload';
  insertImageModalOpen.value = true;
};

const handleInlineImageFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    await processAndUploadInlineImage(file);
  }
};

const handleInlineImageDrop = async (e: DragEvent) => {
  inlineImageDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    await processAndUploadInlineImage(file);
  }
};

const processAndUploadInlineImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    inlineImageError.value = 'File yang dipilih harus berupa gambar (JPG, PNG, WebP).';
    return;
  }

  isUploadingInlineImage.value = true;
  inlineImageError.value = '';

  try {
    const compressed = await compressBannerImage(file, 1280, 720, 0.8);
    inlineImageCompressionStats.value = {
      original: formatFileSize(compressed.originalSize),
      compressed: formatFileSize(compressed.compressedSize),
      reduction: compressed.reductionPercentage,
    };

    const formData = new FormData();
    formData.append('cover', compressed.file);

    const res = await adminApi.post('/api/v1/articles/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.data?.success && res.data?.url) {
      inlineImageUrl.value = res.data.url;
      if (!inlineImageCaption.value) {
        inlineImageCaption.value = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
      }
    } else {
      inlineImageError.value = res.data?.message || 'Gagal mengunggah foto.';
    }
  } catch (err: any) {
    console.error('Error compress & upload inline image:', err);
    inlineImageError.value =
      err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses gambar.';
  } finally {
    isUploadingInlineImage.value = false;
  }
};

const confirmInsertInlineImage = () => {
  if (!inlineImageUrl.value.trim()) {
    inlineImageError.value = 'URL gambar atau foto wajib diisi / diunggah.';
    return;
  }

  const caption = inlineImageCaption.value.trim();
  const url = inlineImageUrl.value.trim();
  const imageMarkdown = `\n\n![${caption}](${url})\n\n`;

  const pos = savedContentCursorPos.value ?? articleForm.content.length;
  const current = articleForm.content;
  articleForm.content = current.substring(0, pos) + imageMarkdown + current.substring(pos);

  insertImageModalOpen.value = false;

  nextTick(() => {
    const textarea = articleContentInputRef.value;
    if (textarea) {
      textarea.focus();
      const newPos = pos + imageMarkdown.length;
      textarea.setSelectionRange(newPos, newPos);
    }
  });
};

const insertMarkdown = (syntax: string) => {
  if (syntax === 'image') {
    openInsertInlineImageModal();
    return;
  }

  const textarea = articleContentInputRef.value;
  if (!textarea) {
    if (syntax === 'bold') articleForm.content += '**Teks Tebal**';
    else if (syntax === 'italic') articleForm.content += '*Teks Miring*';
    else if (syntax === 'h2') articleForm.content += '\n\n## Sub-Judul Bagian\n\n';
    else if (syntax === 'h3') articleForm.content += '\n\n### Poin Pembahasan\n\n';
    else if (syntax === 'quote') articleForm.content += '\n\n> Kutipan penting\n\n';
    else if (syntax === 'list') articleForm.content += '\n- Poin pertama\n';
    else if (syntax === 'link') articleForm.content += ' [Nama Tautan](https://example.com) ';
    else if (syntax === 'hr') articleForm.content += '\n\n---\n\n';
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const original = articleForm.content;
  const selectedText = original.substring(start, end);

  let replacement = '';
  let cursorOffset = 0;

  switch (syntax) {
    case 'bold':
      if (selectedText) {
        replacement = `**${selectedText}**`;
        cursorOffset = replacement.length;
      } else {
        replacement = '**Teks Tebal**';
        cursorOffset = 12;
      }
      break;

    case 'italic':
      if (selectedText) {
        replacement = `*${selectedText}*`;
        cursorOffset = replacement.length;
      } else {
        replacement = '*Teks Miring*';
        cursorOffset = 13;
      }
      break;

    case 'h2': {
      const prefix = start > 0 && original[start - 1] !== '\n' ? '\n\n' : '';
      const headingText = selectedText || 'Sub-Judul Bagian';
      replacement = `${prefix}## ${headingText}\n\n`;
      cursorOffset = replacement.length;
      break;
    }

    case 'h3': {
      const prefix = start > 0 && original[start - 1] !== '\n' ? '\n\n' : '';
      const headingText = selectedText || 'Poin Pembahasan';
      replacement = `${prefix}### ${headingText}\n\n`;
      cursorOffset = replacement.length;
      break;
    }

    case 'quote': {
      const prefix = start > 0 && original[start - 1] !== '\n' ? '\n\n' : '';
      const quoteText = selectedText || 'Kutipan penting atau pengumuman';
      replacement = `${prefix}> ${quoteText}\n\n`;
      cursorOffset = replacement.length;
      break;
    }

    case 'list': {
      const prefix = start > 0 && original[start - 1] !== '\n' ? '\n' : '';
      if (selectedText) {
        const lines = selectedText.split('\n');
        replacement = prefix + lines.map((l) => (l.startsWith('- ') ? l : `- ${l}`)).join('\n') + '\n';
      } else {
        replacement = `${prefix}- Poin pembahasan baru\n`;
      }
      cursorOffset = replacement.length;
      break;
    }

    case 'link':
      if (selectedText) {
        replacement = `[${selectedText}](https://example.com)`;
      } else {
        replacement = `[Nama Tautan](https://example.com)`;
      }
      cursorOffset = replacement.length;
      break;

    case 'hr': {
      const prefix = start > 0 && original[start - 1] !== '\n' ? '\n\n' : '';
      replacement = `${prefix}---\n\n`;
      cursorOffset = replacement.length;
      break;
    }
  }

  articleForm.content = original.substring(0, start) + replacement + original.substring(end);

  nextTick(() => {
    textarea.focus();
    const newPos = start + cursorOffset;
    textarea.setSelectionRange(newPos, newPos);
  });
};

const previewRenderedContent = computed(() => {
  if (!articleForm.content) return '<p class="text-gray-500 italic text-sm">Belum ada konten ditulis...</p>';
  let text = articleForm.content;
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-sm sm:text-base font-bold font-orbitron text-cyan-300 mt-5 mb-2 uppercase tracking-wide">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-base sm:text-lg font-bold font-orbitron text-white mt-6 mb-2.5 pb-1 border-b border-white/10 uppercase tracking-wider">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-lg sm:text-xl font-extrabold font-orbitron text-white mt-7 mb-3 uppercase tracking-widest">$1</h1>');
  text = text.replace(/^&gt;\s*(.+)$/gm, '<blockquote class="my-3.5 p-3 rounded-xl border-l-4 border-cyan-400 bg-cyan-950/20 text-cyan-200 italic font-sans text-xs sm:text-sm">$1</blockquote>');
  text = text.replace(/^---$/gim, '<hr class="my-5 border-white/10" />');
  text = text.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-cyan-300 font-bold">$1</strong>');
  text = text.replace(/\*(.*?)\*/gim, '<em class="text-gray-300 italic">$1</em>');
  text = text.replace(/!\[(.*?)\]\((.*?)\)/gim, (_, caption, url) => {
    const cap = (caption || '').trim();
    const captionHtml = cap
      ? `<figcaption class="p-2 text-center text-[11px] font-mono text-cyan-200/90 bg-black/80 border-t border-white/5 flex items-center justify-center gap-1.5"><span class="text-cyan-400">📷</span><span>${cap}</span></figcaption>`
      : '';
    return `<figure class="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/70 shadow-lg"><div class="relative overflow-hidden aspect-video bg-black/90 flex items-center justify-center"><img src="${url}" alt="${cap || 'Ilustrasi Artikel'}" class="w-full h-full object-cover" loading="lazy" /></div>${captionHtml}</figure>`;
  });
  text = text.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline font-semibold">$1</a>');
  text = text.replace(/^\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-0.5 text-xs sm:text-sm">$1</li>');
  text = text.replace(/^-\s+(.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-0.5 text-xs sm:text-sm">$1</li>');
  text = text.replace(/(<\/?(h[1-6]|blockquote|hr|figure|ul|ol|li)[^>]*>)/gi, '\n\n$1\n\n');

  const paragraphs = text.split(/\n{2,}/);
  return paragraphs
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
      return `<p class="leading-relaxed text-gray-200 text-xs sm:text-sm my-2">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Top Header & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border border-cyan-500/20 bg-[#0d121c]/90 backdrop-blur-md">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookOpen class="w-5 h-5" />
          </div>
          <h2 class="text-base sm:text-lg font-bold font-orbitron text-white tracking-wide">
            XFIVE Articles &amp; Media Management
          </h2>
        </div>
        <p class="text-xs text-gray-400 font-mono">
          Warta resmi, pengumuman turnamen, tips gameplay, dan dokumentasi komunitas AyoDance XFIVE.
        </p>
      </div>

      <button
        @click="openAddArticleModal"
        class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(0,255,255,0.3)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
      >
        <Plus class="w-4 h-4" />
        <span>Tulis Artikel Baru</span>
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="p-4 rounded-xl border border-cyan-500/20 bg-[#0d121c]/60">
        <div class="text-[10px] font-mono uppercase tracking-wider text-gray-400">Total Artikel</div>
        <div class="text-xl sm:text-2xl font-bold font-orbitron text-cyan-400 mt-1">
          {{ articleStats.total }}
        </div>
      </div>

      <div class="p-4 rounded-xl border border-emerald-500/20 bg-[#0d121c]/60">
        <div class="text-[10px] font-mono uppercase tracking-wider text-gray-400">Terbit (Published)</div>
        <div class="text-xl sm:text-2xl font-bold font-orbitron text-emerald-400 mt-1">
          {{ articleStats.published }}
        </div>
      </div>

      <div class="p-4 rounded-xl border border-amber-500/20 bg-[#0d121c]/60">
        <div class="text-[10px] font-mono uppercase tracking-wider text-gray-400">Draft / Konsep</div>
        <div class="text-xl sm:text-2xl font-bold font-orbitron text-amber-400 mt-1">
          {{ articleStats.draft }}
        </div>
      </div>

      <div class="p-4 rounded-xl border border-purple-500/20 bg-[#0d121c]/60">
        <div class="text-[10px] font-mono uppercase tracking-wider text-gray-400">Total Pembaca (Views)</div>
        <div class="text-xl sm:text-2xl font-bold font-orbitron text-purple-400 mt-1">
          {{ articleStats.totalViews.toLocaleString('id-ID') }}
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="p-4 rounded-2xl border border-white/10 bg-[#0d121c]/80 flex flex-col md:flex-row items-stretch md:items-center gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="articleSearch"
          type="text"
          placeholder="Cari artikel judul / slug / ringkasan / tags..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono transition"
        />
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <select
          v-model="articleCategoryFilter"
          class="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          <option v-for="cat in uniqueArticleCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <select
          v-model="articleStatusFilter"
          class="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="PUBLISHED">Terbit (PUBLISHED)</option>
          <option value="DRAFT">Konsep (DRAFT)</option>
        </select>

        <button
          @click="fetchArticlesAdmin"
          class="p-2 rounded-xl border border-white/10 hover:border-cyan-400 text-gray-400 hover:text-white transition cursor-pointer"
          title="Refresh Daftar Artikel"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loadingArticles }" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loadingArticles" class="p-12 text-center text-gray-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
      <RefreshCw class="w-6 h-6 animate-spin text-cyan-400" />
      <span>Memuat data warta &amp; artikel XFIVE...</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredArticles.length === 0"
      class="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-[#0d121c]/40 flex flex-col items-center justify-center gap-3"
    >
      <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
        <BookOpen class="w-6 h-6" />
      </div>
      <h3 class="font-bold font-orbitron text-sm text-white">Tidak Ada Artikel Ditemukan</h3>
      <p class="text-xs text-gray-400 max-w-md font-mono">
        Belum ada artikel yang sesuai kriteria pencarian atau belum dibuat sama sekali.
      </p>
      <button
        @click="openAddArticleModal"
        class="mt-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-xs font-orbitron font-bold hover:bg-cyan-500/20 transition cursor-pointer"
      >
        + Tulis Artikel Baru
      </button>
    </div>

    <!-- Articles List -->
    <div v-else class="space-y-4">
      <!-- Mobile Cards View (< lg) -->
      <div class="grid grid-cols-1 gap-3.5 lg:hidden">
        <div
          v-for="art in filteredArticles"
          :key="art.id"
          class="p-4 rounded-2xl border border-white/10 bg-[#0d121c]/80 space-y-3"
        >
          <div class="flex items-start gap-3">
            <div class="w-20 h-14 rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0">
              <img
                :src="art.cover_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'"
                :alt="art.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase">
                  {{ art.category }}
                </span>
                <button
                  @click="quickToggleArticleStatus(art)"
                  :class="art.status === 'PUBLISHED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'"
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer"
                  title="Klik untuk ubah status"
                >
                  {{ art.status }}
                </button>
              </div>
              <h4 class="font-bold font-orbitron text-xs text-white line-clamp-2 leading-snug">
                {{ art.title }}
              </h4>
            </div>
          </div>

          <p v-if="art.excerpt" class="text-[11px] text-gray-400 font-sans line-clamp-2 leading-relaxed">
            {{ art.excerpt }}
          </p>

          <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
            <span>{{ art.author_name }}</span>
            <span>{{ formatDate(art.created_at) }}</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <a
              :href="`/article/${art.slug}`"
              target="_blank"
              class="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-cyan-400 text-gray-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition"
            >
              <ExternalLink class="w-3 h-3 text-cyan-400" />
              <span>Lihat</span>
            </a>
            <button
              @click="openEditArticleModal(art)"
              class="px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-mono flex items-center gap-1 transition cursor-pointer"
            >
              <Edit class="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              @click="promptDeleteArticle(art)"
              class="px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-mono flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 class="w-3 h-3" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Table View (>= lg) -->
      <div class="hidden lg:block overflow-x-auto rounded-2xl border border-white/10 bg-[#0d121c]/80">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-black/50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-white/10">
            <tr>
              <th class="py-3.5 px-4 font-orbitron">Artikel &amp; Cover</th>
              <th class="py-3.5 px-4 font-orbitron">Kategori</th>
              <th class="py-3.5 px-4 font-orbitron">Penulis</th>
              <th class="py-3.5 px-4 font-orbitron">Status</th>
              <th class="py-3.5 px-4 font-orbitron">Statistik</th>
              <th class="py-3.5 px-4 font-orbitron">Tanggal</th>
              <th class="py-3.5 px-4 font-orbitron text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="art in filteredArticles"
              :key="art.id"
              class="hover:bg-white/[0.02] transition"
            >
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-16 h-11 rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0">
                    <img
                      :src="art.cover_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'"
                      :alt="art.title"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div class="min-w-0 max-w-sm space-y-0.5">
                    <h4 class="font-bold font-orbitron text-xs text-white truncate" :title="art.title">
                      {{ art.title }}
                    </h4>
                    <p class="text-[10px] text-cyan-400/80 truncate">/article/{{ art.slug }}</p>
                    <p v-if="art.excerpt" class="text-[10px] text-gray-400 truncate">{{ art.excerpt }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase">
                  {{ art.category }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <div class="space-y-0.5">
                  <div class="font-bold text-white text-xs">{{ art.author_name }}</div>
                  <span class="text-[10px] text-gray-400 uppercase">{{ art.author_role }}</span>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <button
                  @click="quickToggleArticleStatus(art)"
                  :class="art.status === 'PUBLISHED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer"
                  title="Klik untuk ubah cepat PUBLISHED / DRAFT"
                >
                  {{ art.status }}
                </button>
              </td>
              <td class="py-3.5 px-4">
                <div class="space-y-0.5 text-[11px]">
                  <div class="text-gray-300 flex items-center gap-1">
                    <Eye class="w-3 h-3 text-cyan-400" />
                    <span>{{ art.views }} views</span>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 text-gray-400 text-[11px]">
                {{ formatDate(art.created_at) }}
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <a
                    :href="`/article/${art.slug}`"
                    target="_blank"
                    class="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400 text-gray-400 hover:text-white transition"
                    title="Lihat Pratinjau Publik"
                  >
                    <ExternalLink class="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                  <button
                    @click="openEditArticleModal(art)"
                    class="p-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition cursor-pointer"
                    title="Edit Artikel"
                  >
                    <Edit class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="promptDeleteArticle(art)"
                    class="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                    title="Hapus Artikel"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Write / Edit Article -->
    <div
      v-if="articleModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      @click.self="articleModalOpen = false"
    >
      <div class="rounded-2xl border border-cyan-500/40 bg-[#0d121c] p-4 sm:p-6 w-full max-w-4xl shadow-[0_0_50px_rgba(0,255,255,0.15)] max-h-[94vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-4 shrink-0">
          <div class="flex items-center gap-2.5 text-cyan-400 font-orbitron font-bold text-sm sm:text-base">
            <BookOpen class="w-5 h-5 text-cyan-400" />
            <span>{{ articleForm.id ? 'EDIT ARTIKEL WARTA' : 'TULIS ARTIKEL BARU' }}</span>
          </div>
          <button @click="articleModalOpen = false" class="text-gray-400 hover:text-white cursor-pointer text-sm sm:text-base">✕</button>
        </div>

        <form @submit.prevent="handleSaveArticle" class="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          <!-- Row 1: Title & Slug -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Judul Artikel *</label>
              <input
                v-model="articleForm.title"
                @input="onArticleTitleChange"
                type="text"
                required
                placeholder="Contoh: Keseruan Turnamen AyoDance XFIVE Cup Season 3"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              />
            </div>
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">URL Slug *</label>
              <input
                v-model="articleForm.slug"
                type="text"
                required
                placeholder="turnamen-ayodance-xfive-cup-season-3"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-cyan-300 font-mono text-xs outline-none transition"
              />
            </div>
          </div>

          <!-- Row 2: Category & Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Kategori *</label>
              <input
                v-model="articleForm.category"
                type="text"
                required
                placeholder="Komunitas, Turnamen, Tutorial, Warta..."
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              />
            </div>
            <div>
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Status Publikasi</label>
              <select
                v-model="articleForm.status"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              >
                <option value="PUBLISHED">PUBLISHED (Tampil di Warta Publik)</option>
                <option value="DRAFT">DRAFT (Konsep / Disimpan Sementara)</option>
              </select>
            </div>
          </div>

          <!-- Cover Image Section -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider font-bold">Foto Cover Utama</label>
              <div class="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/5">
                <button
                  type="button"
                  @click="coverInputMode = 'url'"
                  :class="coverInputMode === 'url' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                  class="px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer"
                >
                  URL Link
                </button>
                <button
                  type="button"
                  @click="coverInputMode = 'upload'"
                  :class="coverInputMode === 'upload' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                  class="px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles class="w-3 h-3" />
                  <span>Upload WebP (~70KB)</span>
                </button>
              </div>
            </div>

            <div v-if="coverInputMode === 'url'" class="space-y-1.5">
              <input
                v-model="articleForm.cover_image"
                type="url"
                placeholder="https://images.unsplash.com/... atau URL gambar"
                class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
              />
            </div>

            <div v-else class="space-y-2">
              <div
                v-if="!articleForm.cover_image"
                @dragover.prevent="coverDragOver = true"
                @dragleave.prevent="coverDragOver = false"
                @drop.prevent="handleCoverDrop"
                :class="coverDragOver ? 'border-cyan-400 bg-cyan-950/20' : 'border-gray-800 bg-black/40'"
                class="border-2 border-dashed hover:border-cyan-500/60 rounded-xl p-4 text-center transition cursor-pointer relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  @change="handleCoverFileSelect"
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div v-if="isUploadingCover" class="space-y-2 py-2">
                  <RefreshCw class="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <p class="text-xs font-mono text-cyan-300">Mengompresi ke WebP &amp; mengunggah...</p>
                </div>
                <div v-else class="space-y-1 py-1">
                  <Upload class="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <p class="text-xs font-orbitron text-gray-200">Tarik &amp; lepas banner cover atau <span class="text-cyan-400 underline">Pilih File</span></p>
                  <p class="text-[10px] font-mono text-gray-500">Otomatis di-convert ke WebP 16:9 ultra-ringan (~70KB).</p>
                </div>
              </div>

              <div
                v-if="coverCompressionStats"
                class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono"
              >
                <div class="flex items-center gap-2 text-cyan-300">
                  <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kompresi: {{ coverCompressionStats.original }} &rarr; <strong class="text-white">{{ coverCompressionStats.compressed }}</strong></span>
                </div>
                <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Hemat {{ coverCompressionStats.reduction }}%
                </span>
              </div>

              <div v-if="coverUploadError" class="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono flex items-center gap-2">
                <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ coverUploadError }}</span>
              </div>
            </div>

            <div v-if="articleForm.cover_image" class="relative mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/60 aspect-video max-h-48 group">
              <img :src="articleForm.cover_image" alt="Cover Preview" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  @click="resetCoverImage"
                  class="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-orbitron font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>Ganti Cover</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Excerpt & Tags -->
          <div>
            <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Ringkasan / Excerpt Singkat</label>
            <textarea
              v-model="articleForm.excerpt"
              rows="2"
              placeholder="Deskripsi ringkas yang muncul pada preview kartu warta..."
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Tags (Pisahkan dengan koma)</label>
            <input
              v-model="articleForm.tags"
              type="text"
              placeholder="ayodance, turnamen, gath, komunitas, tips"
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
            />
          </div>

          <!-- Dual Tab Content Editor -->
          <div class="space-y-2 border-t border-white/10 pt-3">
            <div class="flex items-center justify-between">
              <label class="block font-orbitron text-gray-300 uppercase tracking-wider font-bold">Konten Artikel (Markdown) *</label>
              <div class="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/5">
                <button
                  type="button"
                  @click="articleEditorTab = 'edit'"
                  :class="articleEditorTab === 'edit' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                  class="px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer"
                >
                  Tulis (Markdown)
                </button>
                <button
                  type="button"
                  @click="articleEditorTab = 'preview'"
                  :class="articleEditorTab === 'preview' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                  class="px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer"
                >
                  Pratinjau Hasil
                </button>
              </div>
            </div>

            <!-- Markdown Toolbar (visible on edit tab) -->
            <div v-if="articleEditorTab === 'edit'" class="flex items-center gap-1 flex-wrap p-2 rounded-xl bg-black/60 border border-white/5">
              <button type="button" @click="insertMarkdown('bold')" class="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition" title="Tebal">
                <Bold class="w-3.5 h-3.5" />
              </button>
              <button type="button" @click="insertMarkdown('italic')" class="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition" title="Miring">
                <Italic class="w-3.5 h-3.5" />
              </button>
              <span class="w-px h-4 bg-white/10 mx-1"></span>
              <button type="button" @click="insertMarkdown('h2')" class="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition" title="Sub-Judul H2">
                <Heading2 class="w-3.5 h-3.5" />
              </button>
              <button type="button" @click="insertMarkdown('h3')" class="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition" title="Poin H3">
                <Heading3 class="w-3.5 h-3.5" />
              </button>
              <span class="w-px h-4 bg-white/10 mx-1"></span>
              <button type="button" @click="insertMarkdown('quote')" class="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition" title="Kutipan">
                <Quote class="w-3.5 h-3.5" />
              </button>
              <button type="button" @click="insertMarkdown('list')" class="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition" title="Daftar List">
                <List class="w-3.5 h-3.5" />
              </button>
              <button type="button" @click="insertMarkdown('link')" class="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition" title="Tautan Link">
                <LinkIcon class="w-3.5 h-3.5" />
              </button>
              <button type="button" @click="insertMarkdown('hr')" class="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition" title="Garis Pemisah">
                <Minus class="w-3.5 h-3.5" />
              </button>
              <span class="w-px h-4 bg-white/10 mx-1"></span>
              <button
                type="button"
                @click="insertMarkdown('image')"
                class="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                title="Sisipkan Foto / Ilustrasi ke Paragraf"
              >
                <ImageIcon class="w-3.5 h-3.5" />
                <span>+ Sisipkan Foto Inline</span>
              </button>
            </div>

            <!-- Content Input Area -->
            <textarea
              v-show="articleEditorTab === 'edit'"
              ref="articleContentInputRef"
              v-model="articleForm.content"
              rows="12"
              placeholder="Tuliskan isi warta atau artikel lengkap di sini dengan format Markdown..."
              class="w-full p-3 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition leading-relaxed"
            ></textarea>

            <!-- Content Live Preview Area -->
            <div
              v-show="articleEditorTab === 'preview'"
              v-html="previewRenderedContent"
              class="p-4 rounded-xl bg-black/60 border border-gray-800 min-h-[250px] max-h-[450px] overflow-y-auto font-sans"
            ></div>
          </div>

          <div v-if="articleFormError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>{{ articleFormError }}</span>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-white/10 shrink-0">
            <button
              type="button"
              @click="articleModalOpen = false"
              class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSavingArticle || isUploadingCover"
              class="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              <RefreshCw v-if="isSavingArticle" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSavingArticle ? 'Menyimpan...' : (articleForm.id ? 'Perbarui Artikel' : 'Terbitkan Artikel') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Confirm Delete Article -->
    <div
      v-if="deleteArticleModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div class="rounded-2xl border border-red-500/40 bg-[#0d121c] p-4 sm:p-6 w-full max-w-md shadow-2xl">
        <h3 class="font-bold font-orbitron text-sm sm:text-base text-white mb-2">Hapus Artikel Warta?</h3>
        <p class="text-xs text-gray-300 mb-2">Apakah Anda yakin ingin menghapus artikel warta berikut secara permanen?</p>
        <div v-if="articleToDelete" class="p-3 rounded-xl bg-black/60 border border-white/10 mb-4 font-mono text-xs">
          <div class="text-cyan-400 font-bold mb-1">{{ articleToDelete.title }}</div>
          <div class="text-gray-500 text-[10px]">/article/{{ articleToDelete.slug }}</div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            @click="deleteArticleModalOpen = false"
            class="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="button"
            @click="confirmDeleteArticle"
            :disabled="isDeletingArticle"
            class="w-full sm:w-auto px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-orbitron font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw v-if="isDeletingArticle" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isDeletingArticle ? 'Menghapus...' : 'Ya, Hapus Artikel' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Insert Inline Image -->
    <div
      v-if="insertImageModalOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      @click.self="insertImageModalOpen = false"
    >
      <div class="rounded-2xl border border-cyan-500/40 bg-[#0d121c] p-4 sm:p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,255,255,0.2)]">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div class="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-sm">
            <ImageIcon class="w-4 h-4" />
            <span>SISIPKAN FOTO KE PARAGRAF ARTIKEL</span>
          </div>
          <button @click="insertImageModalOpen = false" class="text-gray-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <div class="space-y-4 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-orbitron text-gray-300 font-bold uppercase tracking-wider">Sumber Foto</span>
            <div class="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/5">
              <button
                type="button"
                @click="inlineImageMode = 'upload'"
                :class="inlineImageMode === 'upload' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                class="px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles class="w-3 h-3" />
                <span>Upload Auto-WebP</span>
              </button>
              <button
                type="button"
                @click="inlineImageMode = 'url'"
                :class="inlineImageMode === 'url' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'"
                class="px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer"
              >
                URL Gambar
              </button>
            </div>
          </div>

          <div v-if="inlineImageMode === 'upload'" class="space-y-2">
            <div
              v-if="!inlineImageUrl"
              @dragover.prevent="inlineImageDragOver = true"
              @dragleave.prevent="inlineImageDragOver = false"
              @drop.prevent="handleInlineImageDrop"
              :class="inlineImageDragOver ? 'border-cyan-400 bg-cyan-950/20' : 'border-gray-800 bg-black/40'"
              class="border-2 border-dashed hover:border-cyan-500/60 rounded-xl p-4 text-center transition cursor-pointer relative"
            >
              <input
                type="file"
                accept="image/*"
                @change="handleInlineImageFileSelect"
                class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div v-if="isUploadingInlineImage" class="space-y-2 py-2">
                <RefreshCw class="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                <p class="text-xs font-mono text-cyan-300">Mengompresi ke WebP 16:9 &amp; mengunggah...</p>
              </div>
              <div v-else class="space-y-1 py-1">
                <Upload class="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                <p class="text-xs font-orbitron text-gray-200">Tarik &amp; lepas foto atau <span class="text-cyan-400 underline">Pilih File</span></p>
                <p class="text-[10px] font-mono text-gray-500">Otomatis di-convert ke WebP 16:9 ultra-ringan (~70KB).</p>
              </div>
            </div>

            <div
              v-if="inlineImageCompressionStats"
              class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono"
            >
              <div class="flex items-center gap-2 text-cyan-300">
                <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
                <span>Kompresi: {{ inlineImageCompressionStats.original }} &rarr; <strong class="text-white">{{ inlineImageCompressionStats.compressed }}</strong></span>
              </div>
              <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Hemat {{ inlineImageCompressionStats.reduction }}%
              </span>
            </div>
          </div>

          <div v-else>
            <input
              v-model="inlineImageUrl"
              type="url"
              placeholder="https://images.unsplash.com/... atau URL foto"
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
            />
          </div>

          <div>
            <label class="block font-orbitron text-gray-300 uppercase tracking-wider mb-1 font-bold">Keterangan Foto (Caption)</label>
            <input
              v-model="inlineImageCaption"
              type="text"
              placeholder="Contoh: Suasana turnamen semifinal babak penyisihan"
              class="w-full p-2.5 rounded-xl bg-black/60 border border-gray-800 focus:border-cyan-400 text-white font-mono text-xs outline-none transition"
            />
          </div>

          <div v-if="inlineImageUrl" class="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 aspect-video max-h-40">
            <img :src="inlineImageUrl" alt="Inline Image Preview" class="w-full h-full object-cover" />
          </div>

          <div v-if="inlineImageError" class="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono flex items-center gap-2">
            <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ inlineImageError }}</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              @click="insertImageModalOpen = false"
              class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-orbitron transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              @click="confirmInsertInlineImage"
              :disabled="!inlineImageUrl.trim() || isUploadingInlineImage"
              class="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-orbitron font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Sisipkan ke Artikel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
