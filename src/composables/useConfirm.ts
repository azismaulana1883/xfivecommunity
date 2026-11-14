import { ref } from 'vue';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isPrompt?: boolean;
  promptLabel?: string;
  promptPlaceholder?: string;
  promptDefaultValue?: string;
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  inputValue: string;
  resolve: (value: any) => void;
}

const state = ref<ConfirmState>({
  isOpen: false,
  title: 'Konfirmasi Tindakan',
  message: '',
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  variant: 'danger',
  isPrompt: false,
  promptLabel: '',
  promptPlaceholder: '',
  promptDefaultValue: '',
  inputValue: '',
  resolve: () => {},
});

export function useConfirm() {
  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    const opts = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        title: opts.title || 'KONFIRMASI TINDAKAN',
        message: opts.message,
        confirmText: opts.confirmText || 'Ya, Lanjutkan',
        cancelText: opts.cancelText || 'Batal',
        variant: opts.variant || 'danger',
        isPrompt: false,
        promptLabel: '',
        promptPlaceholder: '',
        promptDefaultValue: '',
        inputValue: '',
        resolve: (val: boolean) => {
          state.value.isOpen = false;
          resolve(val);
        },
      };
    });
  };

  const prompt = (options: ConfirmOptions | string): Promise<string | null> => {
    const opts = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        title: opts.title || 'INPUT KETERANGAN',
        message: opts.message,
        confirmText: opts.confirmText || 'Simpan',
        cancelText: opts.cancelText || 'Batal',
        variant: opts.variant || 'info',
        isPrompt: true,
        promptLabel: opts.promptLabel || '',
        promptPlaceholder: opts.promptPlaceholder || 'Ketik di sini...',
        promptDefaultValue: opts.promptDefaultValue || '',
        inputValue: opts.promptDefaultValue || '',
        resolve: (val: string | null) => {
          state.value.isOpen = false;
          resolve(val);
        },
      };
    });
  };

  const handleConfirm = () => {
    if (state.value.isPrompt) {
      state.value.resolve(state.value.inputValue);
    } else {
      state.value.resolve(true);
    }
  };

  const handleCancel = () => {
    if (state.value.isPrompt) {
      state.value.resolve(null);
    } else {
      state.value.resolve(false);
    }
  };

  return {
    state,
    confirm,
    prompt,
    handleConfirm,
    handleCancel,
  };
}
