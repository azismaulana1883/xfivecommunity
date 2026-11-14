/**
 * Helper to resolve media URLs (e.g. /uploads/...) with VITE_API_URL if hosted separately.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (url.startsWith('/uploads') && apiBase) {
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return url;
}

export default resolveMediaUrl;
