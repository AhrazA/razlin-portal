export const ASSIGNEES = ["Ahraz", "Malin"] as const;

export const BOTH_ASSIGNEE = "Both";

export const ASSIGNEE_CYCLE: (string | null)[] = [null, ...ASSIGNEES, BOTH_ASSIGNEE];

export function assigneeBadge(assignee: string | null): string {
  if (!assignee) return "❤️";
  if (assignee === BOTH_ASSIGNEE) return "🤝";
  return assignee[0];
}

export const PLAYER_COOKIE = "player_identity";

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export const DIFFICULTY_POINTS: Record<(typeof DIFFICULTIES)[number], number> = {
  EASY: 1,
  MEDIUM: 3,
  HARD: 5,
};
