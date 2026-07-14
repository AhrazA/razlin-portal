import { sql } from "@/lib/db";
import { type Chore } from "@/lib/calendar";
import { ASSIGNEES, BOTH_ASSIGNEE, DIFFICULTY_POINTS } from "@/lib/constants";

export async function getChoreScores(): Promise<Record<string, number>> {
  const doneOccurrences = await sql<{ assignee: string | null; difficulty: Chore["difficulty"] }[]>`
    select co.assignee, c.difficulty
    from chore_occurrences co
    join chores c on c.id = co.chore_id
    where co.status = 'DONE'
  `;

  const scores: Record<string, number> = {};
  for (const occurrence of doneOccurrences) {
    if (!occurrence.assignee) continue;
    const credited =
      occurrence.assignee === BOTH_ASSIGNEE ? [...ASSIGNEES] : [occurrence.assignee];
    for (const name of credited) {
      scores[name] = (scores[name] ?? 0) + DIFFICULTY_POINTS[occurrence.difficulty];
    }
  }
  return scores;
}
