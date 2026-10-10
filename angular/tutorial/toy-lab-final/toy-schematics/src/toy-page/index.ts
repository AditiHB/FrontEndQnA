import { strings } from '@angular-devkit/core';
import { apply, applyTemplates, mergeWith, move, Rule, url } from '@angular-devkit/schematics';

export interface ToyPageOptions {
  name: string;
  path: string;
}

// A schematic is a function that returns a "Rule" (a list of instructions).
// This one says: take the files in ./files, fill in the blanks (names),
// move them to the right folder, and add them to the project.
export function toyPage(options: ToyPageOptions): Rule {
  return mergeWith(
    apply(url('./files'), [
      applyTemplates({ ...strings, ...options }), // fills in <%= name %> and __name__
      move(options.path),
    ]),
  );
}
