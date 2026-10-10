import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  // Usage: {{ text | truncate: 40 }}   or   {{ text | truncate: 40 : '...' }}
  transform(value: string | null | undefined, limit = 40, ellipsis = '…'): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit).trimEnd() + ellipsis : value;
  }
}
