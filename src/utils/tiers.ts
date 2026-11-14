export interface TierItem {
  level: number;
  name: string;
  minExp: number;
  badge: string;
  icon: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  glowColor: string;
  description: string;
}

export const TIERS: TierItem[] = [
  {
    level: 1,
    name: 'Bronze',
    minExp: 10,
    badge: '🥉 Bronze',
    icon: 'fas fa-shield-halved',
    color: '#cd7f32',
    borderColor: 'border-amber-600/50',
    bgGradient: 'from-amber-950/40 via-amber-900/20 to-black/60',
    glowColor: 'rgba(205, 127, 50, 0.5)',
    description: 'Level awal komunitas XFIVE. Akses reward Bronze.',
  },
  {
    level: 2,
    name: 'Silver',
    minExp: 21,
    badge: '🥈 Silver',
    icon: 'fas fa-shield',
    color: '#c0c0c0',
    borderColor: 'border-slate-400/50',
    bgGradient: 'from-slate-800/40 via-slate-700/20 to-black/60',
    glowColor: 'rgba(192, 192, 192, 0.5)',
    description: 'Member aktif berkontribusi. Akses reward Silver.',
  },
  {
    level: 3,
    name: 'Gold',
    minExp: 50,
    badge: '🥇 Gold',
    icon: 'fas fa-award',
    color: '#ffd700',
    borderColor: 'border-yellow-400/50',
    bgGradient: 'from-yellow-950/40 via-yellow-900/20 to-black/60',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    description: 'Dedikasi tinggi & loyal. Akses reward Gold bernilai tinggi.',
  },
  {
    level: 4,
    name: 'Platinum',
    minExp: 115,
    badge: '💠 Platinum',
    icon: 'fas fa-gem',
    color: '#00e5ff',
    borderColor: 'border-cyan-400/50',
    bgGradient: 'from-cyan-950/40 via-cyan-900/20 to-black/60',
    glowColor: 'rgba(0, 229, 255, 0.5)',
    description: 'Tingkatan elit XFIVE. Akses reward Platinum langka.',
  },
  {
    level: 5,
    name: 'Diamond',
    minExp: 200,
    badge: '💎 Diamond',
    icon: 'fas fa-crown',
    color: '#3b82f6',
    borderColor: 'border-blue-500/50',
    bgGradient: 'from-blue-950/40 via-blue-900/20 to-black/60',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    description: 'Veteran sejati komunitas. Akses reward Diamond spektakuler.',
  },
  {
    level: 6,
    name: 'XFIVE Legend',
    minExp: 3000,
    badge: '👑 XFIVE Legend',
    icon: 'fas fa-fire-flame-curved',
    color: '#ec4899',
    borderColor: 'border-pink-500/60',
    bgGradient: 'from-purple-950/50 via-pink-950/30 to-black/70',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    description: 'Puncak kehormatan tertinggi XFIVE. Akses reward Mythic Legend.',
  },
];

export interface MemberTierStatus {
  currentTier: TierItem | null;
  nextTier: TierItem | null;
  totalExp: number;
  isGachaUnlocked: boolean;
  remainingExpToUnlock: number;
  remainingExpToNext: number;
  progressPercentage: number;
  unlockedLevels: number[];
}

export function getTierByLevel(level: number): TierItem | undefined {
  return TIERS.find((t) => t.level === level);
}

export function calculateMemberTier(exp: number = 0): MemberTierStatus {
  const safeExp = Math.max(0, Number(exp) || 0);
  const isGachaUnlocked = safeExp >= 10;
  const remainingExpToUnlock = Math.max(0, 10 - safeExp);

  // Find current highest unlocked tier
  let currentTier: TierItem | null = null;
  const unlockedLevels: number[] = [];

  for (const tier of TIERS) {
    if (safeExp >= tier.minExp) {
      currentTier = tier;
      unlockedLevels.push(tier.level);
    }
  }

  // Find next tier
  let nextTier: TierItem | null = null;
  if (!currentTier) {
    nextTier = TIERS[0]; // Next is Bronze
  } else {
    const nextIdx = TIERS.findIndex((t) => t.level === currentTier!.level) + 1;
    if (nextIdx < TIERS.length) {
      nextTier = TIERS[nextIdx];
    }
  }

  let progressPercentage = 0;
  let remainingExpToNext = 0;

  if (nextTier) {
    const prevExp = currentTier ? currentTier.minExp : 0;
    const range = nextTier.minExp - prevExp;
    const progress = safeExp - prevExp;
    progressPercentage = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    remainingExpToNext = Math.max(0, nextTier.minExp - safeExp);
  } else {
    // Already max level
    progressPercentage = 100;
    remainingExpToNext = 0;
  }

  return {
    currentTier,
    nextTier,
    totalExp: safeExp,
    isGachaUnlocked,
    remainingExpToUnlock,
    remainingExpToNext,
    progressPercentage,
    unlockedLevels,
  };
}
