// @ts-ignore
import html2pdf from 'html2pdf.js';

/**
 * Standard trigger to download files directly to the device's default Downloads folder.
 */
export function triggerFileDownload(blobOrDataUrl: Blob | string, filename: string) {
  const link = document.createElement('a');
  if (typeof blobOrDataUrl === 'string') {
    link.href = blobOrDataUrl;
  } else {
    link.href = URL.createObjectURL(blobOrDataUrl);
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof blobOrDataUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
}

/**
 * Generates an executive-grade styled PDF document and triggers one-tap download.
 */
export async function downloadStyledPDF(htmlContent: string, filename: string) {
  const container = document.createElement('div');
  container.className = 'pdf-render-container';
  container.innerHTML = `
    <div style="
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 36px 44px;
      line-height: 1.6;
      font-size: 13px;
      max-width: 800px;
      margin: 0 auto;
    ">
      <!-- Header -->
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">WECAN</div>
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">AI Assessment & Evaluation Report</div>
        </div>
        <div style="text-align: right; font-size: 10px; color: #94a3b8; font-weight: 500;">
          <div>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          <div>Confidential Career Document</div>
        </div>
      </div>

      <!-- Main Body -->
      <div style="margin-bottom: 30px;">
        ${htmlContent}
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
        <span>WeCan Career Readiness Platform</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const opt: any = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    await html2pdf().from(container).set(opt).save();
  } finally {
    document.body.removeChild(container);
  }
}
