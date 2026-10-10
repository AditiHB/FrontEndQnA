import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('shows the question we gave it', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Sure?', message: 'Really empty it?', confirmLabel: 'Yes' },
        },
      ],
    });
    const fixture = TestBed.createComponent(ConfirmDialog);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Really empty it?');
  });
});
