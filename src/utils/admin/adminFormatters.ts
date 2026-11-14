export const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
};

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return String(dateStr);
  }
};

export const formatBirthDate = (dob?: string): string => {
  if (!dob || dob === '-') return '-';
  const str = dob.trim();
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const day = parseInt(isoMatch[3], 10);
    const monthIdx = parseInt(isoMatch[2], 10) - 1;
    if (monthIdx >= 0 && monthIdx <= 11) {
      return `${day} ${monthNames[monthIdx]}`;
    }
  }
  return str;
};

export const formatRegDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
};

export const formatRegTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return '-';
  }
};

export const formatRoleLabel = (role?: string): string => {
  const r = (role || '').toLowerCase().trim();
  switch (r) {
    case 'superadmin': return 'Super Admin';
    case 'owner': return 'Owner';
    case 'leader': return 'Leader';
    case 'vice_leader': return 'Vice Leader';
    case 'staff_tester': return 'Staff Tester';
    case 'staff_meet': return 'Staff Meetup';
    case 'admin': return 'Administrator';
    default: return r ? r.toUpperCase() : 'Staff';
  }
};

export const getRoleBadgeClass = (role?: string): string => {
  const r = (role || '').toLowerCase().trim();
  switch (r) {
    case 'superadmin':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.3)]';
    case 'owner':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    case 'leader':
      return 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40 shadow-[0_0_10px_rgba(217,70,239,0.3)]';
    case 'vice_leader':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
    case 'staff_tester':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]';
    case 'staff_meet':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
    default:
      return 'bg-gray-800 text-gray-300 border-gray-700';
  }
};
