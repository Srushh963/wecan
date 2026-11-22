import { describe, it, expect } from 'vitest';
import { triggerFileDownload } from '../lib/pdfExport';

describe('PDF Export Utilities', () => {
  it('triggers download with proper blob/url handling', () => {
    const blob = new Blob(['Test report content'], { type: 'text/plain' });
    expect(() => triggerFileDownload(blob, 'test_report.txt')).not.toThrow();
  });
});
