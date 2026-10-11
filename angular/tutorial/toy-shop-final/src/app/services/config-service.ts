import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

export interface AppConfig {
  shopName: string;
  taxRate: number;
  saleMinutes: number;
}

const DEFAULTS: AppConfig = { shopName: 'Toy Shop', taxRate: 0.08, saleMinutes: 10 };

// Settings that can change WITHOUT building the app again.
// They live in config.json, which the server can swap for each place (test, real shop...).
@Service()
export class ConfigService {
  private http = inject(HttpClient);
  private readonly _config = signal<AppConfig>(DEFAULTS);
  readonly config = this._config.asReadonly();

  // Called once, before the app starts. If the file is missing we keep the defaults.
  load(): Promise<void> {
    return firstValueFrom(
      this.http.get<Partial<AppConfig>>('config.json').pipe(catchError(() => of({}))),
    ).then((fromFile) => this._config.set({ ...DEFAULTS, ...fromFile }));
  }
}
