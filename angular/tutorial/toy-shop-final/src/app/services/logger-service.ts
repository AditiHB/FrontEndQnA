import { Service, signal } from '@angular/core';

export interface LoggedError {
  when: string;
  message: string;
  context?: string;
}

// Writes problems down. Here we write on the console and in a list we can look at.
// In a real shop you would also send them to a service like Sentry or Datadog,
// so the grown-ups are told when something breaks for a customer.
@Service()
export class LoggerService {
  private readonly _errors = signal<LoggedError[]>([]);
  readonly errors = this._errors.asReadonly();

  error(problem: unknown, context?: string) {
    const message = problem instanceof Error ? problem.message : String(problem);
    console.error(context ? `[${context}]` : '[error]', problem);
    this._errors.update((list) => [
      { when: new Date().toISOString(), message, context },
      ...list.slice(0, 19), // keep only the latest 20
    ]);
  }
}
