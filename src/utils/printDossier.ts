/**
 * Isolated iframe printing utility for the Technical Dossier.
 * Prints directly to pure white paper (A4) starting cleanly from Page 1,
 * with zero black background inheritance or blank pages.
 */
export function printDossierIframe(elementId = 'technical-dossier-print-section') {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  // Remove existing print iframe if any
  const existingIframe = document.getElementById('autumn-solara-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'autumn-solara-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const contentHtml = el.innerHTML;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>EXPEDIENTE TÉCNICO DE VALIDACIÓN ANÁLOGA: AUTUMN SOLARA</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 12mm 14mm 12mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          background: #FFFFFF !important;
          background-color: #FFFFFF !important;
          color: #0B0B0B !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 10px;
          line-height: 1.45;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-dossier-header {
          border-bottom: 2px solid #000000;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .print-block {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          margin-bottom: 14px;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          margin-bottom: 4px;
          font-size: 9.5px;
        }
        .print-table th {
          background-color: #F0F0F0 !important;
          color: #000000 !important;
          font-weight: 700;
          text-align: left;
          padding: 5px 7px;
          border: 1px solid #D0D0D0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-table td {
          padding: 4px 7px;
          border: 1px solid #D0D0D0;
          color: #111111;
          background-color: #FFFFFF;
        }
        .print-table tr:nth-child(even) td {
          background-color: #F8F8F8 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-1 { gap: 4px; }
        .gap-1\\.5 { gap: 6px; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 10px; }
        .gap-4 { gap: 14px; }
        .gap-x-6 { column-gap: 20px; }
        .gap-y-1 { row-gap: 4px; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-start { align-items: flex-start; }
        .items-baseline { align-items: baseline; }
        .items-center { align-items: center; }
        .shrink-0 { flex-shrink: 0; }
        .border { border: 1px solid #D0D0D0; }
        .border-b { border-bottom: 1px solid #D0D0D0; }
        .border-b-2 { border-bottom: 2px solid #000000; }
        .border-t { border-top: 1px solid #D0D0D0; }
        .border-neutral-300 { border-color: #D0D0D0; }
        .border-neutral-200 { border-color: #E5E5E5; }
        .bg-neutral-50 { background-color: #F8F8F8; }
        .p-2\\.5 { padding: 8px; }
        .p-3 { padding: 9px; }
        .pb-1 { padding-bottom: 3px; }
        .pb-4 { padding-bottom: 10px; }
        .mb-1 { margin-bottom: 3px; }
        .mb-2 { margin-bottom: 6px; }
        .mb-3 { margin-bottom: 10px; }
        .mb-4 { margin-bottom: 12px; }
        .mb-6 { margin-bottom: 14px; }
        .mt-1 { margin-top: 3px; }
        .space-y-0\\.5 > * + * { margin-top: 2px; }
        .space-y-1 > * + * { margin-top: 3px; }
        .space-y-1\\.5 > * + * { margin-top: 5px; }
        .space-y-2 > * + * { margin-top: 6px; }
        .text-black { color: #000000; }
        .text-neutral-600 { color: #555555; }
        .text-neutral-700 { color: #333333; }
        .text-neutral-800 { color: #222222; }
        .text-neutral-900 { color: #000000; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .font-serif { font-family: Georgia, Cambria, "Times New Roman", Times, serif; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.04em; }
        .tracking-widest { letter-spacing: 0.08em; }
        .text-\\[9px\\] { font-size: 8.5px; }
        .text-\\[10px\\] { font-size: 9.5px; }
        .text-\\[11px\\] { font-size: 10.5px; }
        .text-xs { font-size: 10.5px; }
        .text-sm { font-size: 12px; }
        .text-xl { font-size: 16px; }
        .text-2xl { font-size: 20px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-justify { text-align: justify; }
        .leading-snug { line-height: 1.35; }
        .leading-relaxed { line-height: 1.45; }
        .w-full { width: 100%; }
        .col-span-2 { grid-column: span 2 / span 2; }
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 100);
}
