export const defaultMeetupBanner = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';

export function getBannerImage(m) {
  if (m && m.banner_image && typeof m.banner_image === 'string' && m.banner_image.trim()) {
    return m.banner_image.trim();
  }
  return defaultMeetupBanner;
}

export function getGoogleMapsUrl(m) {
  if (m?.maps_url && String(m.maps_url).trim()) {
    return String(m.maps_url).trim();
  }
  return `https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}`;
}

export function getRegionBadgeClass(region) {
  const r = String(region || '').trim().toUpperCase();
  switch (r) {
    case 'TANGERANG':
      return 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300';
    case 'JAKARTA':
      return 'bg-blue-950/60 border-blue-500/40 text-blue-300';
    case 'BEKASI':
      return 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300';
    case 'DEPOK':
      return 'bg-purple-950/60 border-purple-500/40 text-purple-300';
    case 'BOGOR':
    case 'BOGOR-DEPOK':
      return 'bg-fuchsia-950/60 border-fuchsia-500/40 text-fuchsia-300';
    case 'BANDUNG':
      return 'bg-rose-950/60 border-rose-500/40 text-rose-300';
    case 'SERANG-CILEGON':
      return 'bg-teal-950/60 border-teal-500/40 text-teal-300';
    case 'SEMARANG':
      return 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300';
    case 'SURABAYA':
      return 'bg-violet-950/60 border-violet-500/40 text-violet-300';
    case 'YOGYAKARTA':
      return 'bg-amber-950/60 border-amber-500/40 text-amber-300';
    case 'NASIONAL':
      return 'bg-amber-950/60 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    default:
      return 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300';
  }
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]';
    case 'COMPLETED':
      return 'bg-gray-800 border border-gray-700 text-gray-400';
    case 'UPCOMING':
      return 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300';
    default:
      return 'bg-red-950/80 border border-red-500/40 text-red-300';
  }
}
