import { ref } from 'vue';
import { adminApi } from '@/utils/admin/adminApi';
import { notifyDataChanged } from '@/composables/useDataSync';

export interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  cover_image?: string | null;
  category?: string;
  tags?: string | null;
  excerpt?: string | null;
  content?: string;
  status: 'PUBLISHED' | 'DRAFT';
  views?: number | string;
  author_name?: string;
  author_role?: string;
  created_at?: string;
  updated_at?: string;
}

export function useAdminArticles() {
  const articlesList = ref<ArticleItem[]>([]);
  const loadingArticles = ref(false);

  const fetchArticlesAdmin = async () => {
    loadingArticles.value = true;
    try {
      const res = await adminApi.get('/api/v1/articles?admin=1&limit=200');
      if (res.data?.success && Array.isArray(res.data.data)) {
        articlesList.value = res.data.data;
      }
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      loadingArticles.value = false;
    }
  };

  const fetchArticleDetail = async (slugOrId: string | number) => {
    try {
      const res = await adminApi.get(`/api/v1/articles/${slugOrId}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.error('Error fetching article detail:', err);
    }
    return null;
  };

  const saveArticle = async (payload: {
    id: number | null;
    title: string;
    slug: string;
    cover_image: string | null;
    category: string;
    tags: string | null;
    excerpt: string | null;
    content: string;
    status: 'PUBLISHED' | 'DRAFT';
    author_name?: string;
    author_role?: string;
  }) => {
    try {
      let res;
      if (payload.id) {
        res = await adminApi.put('/api/v1/articles', payload);
      } else {
        res = await adminApi.post('/api/v1/articles', payload);
      }

      if (res.data?.success) {
        await fetchArticlesAdmin();
        notifyDataChanged('articles');
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message || 'Gagal menyimpan artikel.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan artikel.'
      };
    }
  };

  const toggleArticleStatus = async (art: ArticleItem) => {
    const newStatus: 'PUBLISHED' | 'DRAFT' = art.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await adminApi.put('/api/v1/articles', {
        id: art.id,
        title: art.title,
        slug: art.slug,
        cover_image: art.cover_image,
        category: art.category,
        tags: art.tags,
        excerpt: art.excerpt,
        content: art.content || art.excerpt || art.title,
        status: newStatus,
      });
      if (res.data?.success) {
        art.status = newStatus;
        notifyDataChanged('articles');
        return true;
      }
    } catch (err) {
      console.error('Gagal toggle status artikel:', err);
    }
    return false;
  };

  const deleteArticle = async (id: number) => {
    try {
      const res = await adminApi.delete(`/api/v1/articles?id=${id}`);
      if (res.data?.success) {
        await fetchArticlesAdmin();
        notifyDataChanged('articles');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Gagal menghapus artikel.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal menghapus artikel.'
      };
    }
  };

  return {
    articlesList,
    loadingArticles,
    fetchArticlesAdmin,
    fetchArticleDetail,
    saveArticle,
    toggleArticleStatus,
    deleteArticle
  };
}
