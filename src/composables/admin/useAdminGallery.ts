import { ref } from 'vue';
import { adminApi } from '@/utils/admin/adminApi';
import { notifyDataChanged } from '@/composables/useDataSync';

export interface GalleryPhoto {
  id: number;
  title: string;
  event_date: string;
  region: string;
  location_name?: string | null;
  meetup_id?: number | null;
  meetup_title?: string | null;
  image_url: string;
  description?: string | null;
  uploaded_by?: string | null;
  created_at?: string;
}

export function useAdminGallery() {
  const galleryList = ref<GalleryPhoto[]>([]);
  const loadingGallery = ref(false);

  const fetchGallery = async () => {
    loadingGallery.value = true;
    try {
      const res = await adminApi.get('/api/v1/gallery');
      if (res.data?.success && Array.isArray(res.data.data)) {
        galleryList.value = res.data.data;
      }
    } catch (err) {
      console.error('Error loading gallery photos:', err);
    } finally {
      loadingGallery.value = false;
    }
  };

  const saveGalleryPhoto = async (
    mode: 'create' | 'edit',
    id: number | null,
    payload: {
      title: string;
      event_date: string;
      region: string;
      location_name: string | null;
      meetup_id: number | null;
      image_url: string;
      description: string | null;
    }
  ) => {
    try {
      if (mode === 'create') {
        const res = await adminApi.post('/api/v1/gallery', payload);
        if (res.data?.success) {
          await fetchGallery();
          notifyDataChanged('gallery');
          return { success: true };
        }
        return { success: false, message: res.data?.message || 'Gagal menyimpan foto galeri.' };
      } else {
        const res = await adminApi.put(`/api/v1/gallery/${id}`, payload);
        if (res.data?.success) {
          await fetchGallery();
          notifyDataChanged('gallery');
          return { success: true };
        }
        return { success: false, message: res.data?.message || 'Gagal memperbarui foto galeri.' };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Gagal menyimpan foto galeri.'
      };
    }
  };

  const deleteGalleryPhoto = async (id: number) => {
    try {
      const res = await adminApi.delete(`/api/v1/gallery/${id}`);
      if (res.data?.success) {
        await fetchGallery();
        notifyDataChanged('gallery');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Gagal menghapus foto galeri.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Gagal menghapus foto galeri.'
      };
    }
  };

  return {
    galleryList,
    loadingGallery,
    fetchGallery,
    saveGalleryPhoto,
    deleteGalleryPhoto
  };
}
