import { Category } from './product';

// $localize marks a piece of text in TypeScript for translation.
// The part between colons, like :@@cat.cars:, is the message's permanent name (its id).
export const CATEGORY_LABELS: Record<'all' | Category, string> = {
  all: $localize`:@@cat.all:All`,
  cars: $localize`:@@cat.cars:Cars`,
  soft: $localize`:@@cat.soft:Soft toys`,
  puzzles: $localize`:@@cat.puzzles:Puzzles`,
  games: $localize`:@@cat.games:Games`,
};
