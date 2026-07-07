export const ASSIGNEES = ["Ahraz", "Malin"] as const;

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export const DIFFICULTY_POINTS: Record<(typeof DIFFICULTIES)[number], number> = {
  EASY: 1,
  MEDIUM: 3,
  HARD: 5,
};
