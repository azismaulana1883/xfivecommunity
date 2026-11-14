import { onMounted, onUnmounted } from 'vue';

export type SyncEntity =
  | 'members'
  | 'blacklist'
  | 'meetups'
  | 'gallery'
  | 'articles'
  | 'faqs'
  | 'staff'
  | 'registrations';

export interface SyncMessage {
  type: 'DATA_MUTATED';
  entity: SyncEntity;
  timestamp: number;
  payload?: any;
}

export interface AutoSyncOptions {
  pollIntervalMs?: number;
  focusRevalidate?: boolean;
}

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel('xfive_sync_bus');
  } catch (err) {
    channel = null;
  }
}

export function notifyDataChanged(entity: SyncEntity, payload?: any) {
  const message: SyncMessage = {
    type: 'DATA_MUTATED',
    entity,
    timestamp: Date.now(),
    payload,
  };

  if (channel) {
    channel.postMessage(message);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('xfive_last_sync_entity', `${entity}:${Date.now()}`);
    } catch {}
  }
}

export function useAutoSync(
  entity: SyncEntity,
  refetchFn: () => void | Promise<void>,
  options: AutoSyncOptions = {}
) {
  const { pollIntervalMs = 30000, focusRevalidate = true } = options;
  let pollTimer: any = null;
  let lastRefetchTime = Date.now();

  const triggerRefetch = () => {
    lastRefetchTime = Date.now();
    try {
      refetchFn();
    } catch (err) {
      console.error(`Auto-sync error for entity [${entity}]:`, err);
    }
  };

  const onBroadcastMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'DATA_MUTATED' && event.data.entity === entity) {
      triggerRefetch();
    }
  };

  const onStorageChange = (e: StorageEvent) => {
    if (e.key === 'xfive_last_sync_entity' && e.newValue) {
      const [changedEntity] = e.newValue.split(':');
      if (changedEntity === entity) {
        triggerRefetch();
      }
    }
  };

  const onVisibilityOrFocusChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      const elapsed = Date.now() - lastRefetchTime;
      if (elapsed > 12000) {
        triggerRefetch();
      }
    }
  };

  onMounted(() => {
    if (channel) {
      channel.addEventListener('message', onBroadcastMessage);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorageChange);

      if (focusRevalidate) {
        window.addEventListener('focus', onVisibilityOrFocusChange);
        document.addEventListener('visibilitychange', onVisibilityOrFocusChange);
      }

      if (pollIntervalMs > 0) {
        pollTimer = setInterval(() => {
          if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
            triggerRefetch();
          }
        }, pollIntervalMs);
      }
    }
  });

  onUnmounted(() => {
    if (channel) {
      channel.removeEventListener('message', onBroadcastMessage);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorageChange);
      if (focusRevalidate) {
        window.removeEventListener('focus', onVisibilityOrFocusChange);
        document.removeEventListener('visibilitychange', onVisibilityOrFocusChange);
      }
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }
  });

  return {
    notifyChanged: () => notifyDataChanged(entity),
  };
}
