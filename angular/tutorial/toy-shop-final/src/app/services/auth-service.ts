import { HttpClient, HttpContext } from '@angular/common/http';
import { computed, effect, inject, Service, signal } from '@angular/core';
import { tap } from 'rxjs';
import { SKIP_ERROR_TOAST } from '../interceptors/error-interceptor';
import { User } from '../models/user';
import { API_URL } from '../tokens';
import { StorageService } from './storage-service';

const SESSION_KEY = 'toyshop-user';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private api = inject(API_URL);
  private storage = inject(StorageService);

  private readonly _user = signal<User | null>(this.load());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly token = computed(() => this._user()?.token ?? null);

  constructor() {
    // Remember who is logged in while this browser tab stays open.
    effect(() => {
      const user = this._user();
      if (user) this.storage.set(SESSION_KEY, JSON.stringify(user), 'session');
      else this.storage.remove(SESSION_KEY, 'session');
    });
  }

  login(email: string, password: string) {
    return this.http
      .post<User>(
        `${this.api}/login`,
        { email, password },
        { context: new HttpContext().set(SKIP_ERROR_TOAST, true) }, // the login page explains it
      )
      .pipe(tap((user) => this._user.set(user)));
  }

  logout() {
    this._user.set(null);
  }

  private load(): User | null {
    try {
      return JSON.parse(this.storage.get(SESSION_KEY, 'session') ?? 'null');
    } catch {
      return null;
    }
  }
}
