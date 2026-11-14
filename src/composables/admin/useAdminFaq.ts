import { ref } from 'vue';
import { adminApi } from '@/utils/admin/adminApi';
import { notifyDataChanged } from '@/composables/useDataSync';

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order_index?: number;
}

export function useAdminFaq() {
  const faqsList = ref<FaqItem[]>([]);
  const loadingFaqs = ref(false);

  const fetchFaqs = async () => {
    loadingFaqs.value = true;
    try {
      const res = await adminApi.get('/api/v1/faqs');
      if (res.data?.success && Array.isArray(res.data.data)) {
        faqsList.value = res.data.data;
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      loadingFaqs.value = false;
    }
  };

  const saveFaq = async (payload: { id?: number | null; question: string; answer: string; order_index?: number }) => {
    try {
      if (payload.id) {
        const res = await adminApi.put('/api/v1/faqs', {
          id: payload.id,
          question: payload.question.trim(),
          answer: payload.answer.trim(),
          order_index: payload.order_index,
        });
        if (res.data?.success) {
          await fetchFaqs();
          notifyDataChanged('faqs');
          return { success: true };
        }
        return { success: false, message: res.data?.message || 'Gagal memperbarui FAQ.' };
      } else {
        const res = await adminApi.post('/api/v1/faqs', {
          question: payload.question.trim(),
          answer: payload.answer.trim(),
          order_index: payload.order_index,
        });
        if (res.data?.success) {
          await fetchFaqs();
          notifyDataChanged('faqs');
          return { success: true };
        }
        return { success: false, message: res.data?.message || 'Gagal menambahkan FAQ.' };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan FAQ.'
      };
    }
  };

  const deleteFaq = async (id: number) => {
    try {
      const res = await adminApi.delete(`/api/v1/faqs?id=${id}`);
      if (res.data?.success) {
        await fetchFaqs();
        notifyDataChanged('faqs');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Gagal menghapus FAQ.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Terjadi kesalahan saat menghapus FAQ.'
      };
    }
  };

  return {
    faqsList,
    loadingFaqs,
    fetchFaqs,
    saveFaq,
    deleteFaq
  };
}
