/** XP thresholds for display (demo ladder). */
export const LEVEL_ORDER = ['spark', 'blaze', 'nova'];

export function attentionScoreToLevel(score) {
  if (score > 80) return 'nova';
  if (score > 40) return 'blaze';
  return 'spark';
}

export function xpToDisplayTier(xp) {
  if (xp >= 500) return 'nova';
  if (xp >= 150) return 'blaze';
  return 'spark';
}

export function computeQuizXp(baseXp, scorePercent) {
  const mult = scorePercent >= 100 ? 1.25 : scorePercent >= 70 ? 1 : 0.6;
  return Math.round(baseXp * mult);
}

export function badgeDefinitions() {
  return {
    first_roadmap: { name: 'Pathfinder', type: 'milestone', label: 'First roadmap locked in' },
    streak_7: { name: 'Week of Fire', type: 'streak', label: '7-day streak' },
    quiz_perfect: { name: 'Sharp Mind', type: 'quiz', label: '100% on a quiz' },
    level_up: { name: 'Ascension', type: 'progress', label: 'Tier up' },
  };
}
