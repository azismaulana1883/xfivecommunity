export function formatIndoDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-').map(Number);
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      return dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
}

export function formatDob(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str) return null;

  const iso = /^\d{4}-\d{2}-\d{2}/.test(str) ? new Date(str) : null;
  if (iso && !isNaN(iso.getTime())) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const pretty = `${iso.getDate()} ${months[iso.getMonth()]} ${iso.getFullYear()}`;
    const now = new Date();
    let age = now.getFullYear() - iso.getFullYear();
    const m = now.getMonth() - iso.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < iso.getDate())) age--;
    return { pretty, age };
  }

  const parts = str.replace(/\s+/g, ' ').split(' ');
  if (parts.length >= 2) {
    const day = parts[0].replace(/^0+/, '');
    const month = parts.slice(1).join(' ');
    return { pretty: `${day} ${month}`, age: null };
  }
  return { pretty: str, age: null };
}
