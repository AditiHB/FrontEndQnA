import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { LoggerService } from '../../services/logger-service';
import { API_URL } from '../../tokens';

// A practice corner: break things on purpose and watch the safety nets catch them.
@Component({
  imports: [],
  selector: 'app-error-lab',
  styleUrl: './error-lab.css',
  templateUrl: './error-lab.html',
})
export class ErrorLab {
  private http = inject(HttpClient);
  private api = inject(API_URL);
  logger = inject(LoggerService);
  result = signal('');

  // 1. A broken server. The error interceptor shows a pop-up.
  breakServer() {
    this.http.get(`${this.api}/boom`).subscribe({
      error: (e) => this.result.set(`The page heard: HTTP ${e.status}`),
    });
  }

  // 2. A mistake in our own code. Nobody catches it, so the global handler does.
  breakCode() {
    throw new Error('Oops! I broke on purpose.');
  }
}
