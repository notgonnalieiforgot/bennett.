import { STROOP_COLORS, STROOP_TOTAL, type StroopColor, type StroopQuestion } from '@bennett/shared';

export interface StroopGame {
  index: number;
  questions: StroopQuestion[];
}

const HEX: Record<StroopColor, string> = {
  red:    '#E5484D',
  blue:   '#3E63DD',
  green:  '#46A758',
  orange: '#F76808',
  purple: '#8E4EC6',
  yellow: '#FFC53D',
};

export function colorHex(c: StroopColor): string {
  return HEX[c];
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function makeQuestion(prev?: StroopQuestion): StroopQuestion {
  let word = pick(STROOP_COLORS);
  let ink = pick(STROOP_COLORS);
  while (ink === word) ink = pick(STROOP_COLORS);
  if (prev && prev.word === word && prev.inkColor === ink) {
    word = STROOP_COLORS.find((c) => c !== word) ?? word;
  }
  const distractors = STROOP_COLORS.filter((c) => c !== ink)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [ink, ...distractors].sort(() => Math.random() - 0.5);
  return { word, inkColor: ink, options };
}

export function newGame(): StroopGame {
  return {
    index: 0,
    questions: Array.from({ length: STROOP_TOTAL }, () => makeQuestion()),
  };
}

export function answer(game: StroopGame, choice: StroopColor): { game: StroopGame; correct: boolean } {
  const cur = game.questions[game.index];
  if (!cur) return { game, correct: false };
  const correct = choice === cur.inkColor;
  if (correct) {
    return { game: { ...game, index: game.index + 1 }, correct: true };
  }
  // Wrong → reset only the current question (per spec)
  const replaced = game.questions.slice();
  replaced[game.index] = makeQuestion(cur);
  return { game: { ...game, questions: replaced }, correct: false };
}

export const isComplete = (g: StroopGame): boolean => g.index >= STROOP_TOTAL;
export const progress  = (g: StroopGame): number => g.index / STROOP_TOTAL;
