import { ref } from 'vue';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration: number;
}

const toasts = ref<ToastItem[]>([]);

export function useToast() {
  const add = (
    type: ToastItem['type'],
    message: string,
    title?: string,
    duration = 4000
  ) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    
    // Default titles based on type
    let defaultTitle = 'Pemberitahuan';
    if (type === 'success') defaultTitle = 'Berhasil';
    if (type === 'error') defaultTitle = 'Akses Ditolak / Gagal';
    if (type === 'warning') defaultTitle = 'Peringatan';
    if (type === 'info') defaultTitle = 'Informasi';

    const item: ToastItem = {
      id,
      type,
      title: title || defaultTitle,
      message,
      duration,
    };

    toasts.value.push(item);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  };

  const remove = (id: string) => {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx !== -1) {
      toasts.value.splice(idx, 1);
    }
  };

  const success = (message: string, title?: string, duration?: number) =>
    add('success', message, title, duration);

  const error = (message: string, title?: string, duration?: number) =>
    add('error', message, title, duration);

  const warning = (message: string, title?: string, duration?: number) =>
    add('warning', message, title, duration);

  const info = (message: string, title?: string, duration?: number) =>
    add('info', message, title, duration);

  return {
    toasts,
    add,
    remove,
    success,
    error,
    warning,
    info,
  };
}
