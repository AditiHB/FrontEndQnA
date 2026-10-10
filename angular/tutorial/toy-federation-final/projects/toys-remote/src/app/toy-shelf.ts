import { Component } from '@angular/core';

// This component lives in the REMOTE app. The shell borrows it while running.
@Component({
  selector: 'toys-toy-shelf',
  template: `
    <section>
      <h2>🧸 Toy shelf</h2>
      <p>I live in a different app, and I was loaded while the shell was already running!</p>
      <ul>
        @for (toy of toys; track toy) {
          <li>{{ toy }}</li>
        }
      </ul>
    </section>
  `,
})
export class ToyShelf {
  toys = ['🏎️ Racing Car', '🚂 Toy Train', '🧸 Teddy Bear'];
}
