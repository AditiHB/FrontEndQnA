import { TruncatePipe } from './truncate-pipe';

describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('leaves short text alone', () => {
    expect(pipe.transform('Hello', 10)).toBe('Hello');
  });

  it('cuts long text and adds an ellipsis', () => {
    expect(pipe.transform('A very long sentence about toys', 11)).toBe('A very long…');
  });

  it('handles missing text', () => {
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(null)).toBe('');
  });
});
