import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportOptions {
  /** Human-readable title printed in the PDF header */
  title: string
  /** File name without extension */
  filename: string
  /** Orientation — 'landscape' for wide dashboards, 'portrait' for tables */
  orientation?: 'landscape' | 'portrait'
}

const BG_COLOR = '#070a0f'
const HEADER_H_MM = 10 // mm reserved for header strip at top of every page

/**
 * Captures `element` with html2canvas and renders a multi-page PDF.
 * The image is scaled to fit page width and split across A4 pages.
 */
export async function exportToPdf(
  element: HTMLElement,
  opts: ExportOptions,
): Promise<void> {
  const { title, filename, orientation = 'landscape' } = opts

  // ── 1. Capture element ──────────────────────────────────────────────────
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: BG_COLOR,
    useCORS: true,
    logging: false,
    // Prevent scanline pseudo-element from showing
    ignoreElements: (el) => {
      // ignore ::before pseudo elements that create the scanline overlay
      return false
    },
  })

  const imgData = canvas.toDataURL('image/png')

  // ── 2. Compute dimensions ───────────────────────────────────────────────
  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  // Content area height per page (below header strip)
  const contentH = pageH - HEADER_H_MM

  // Scale image width to fill page width
  const imgRatio     = canvas.height / canvas.width
  const scaledImgW   = pageW
  const scaledImgH   = scaledImgW * imgRatio   // total image height in mm

  const totalPages = Math.ceil(scaledImgH / contentH)

  // ── 3. Render pages ─────────────────────────────────────────────────────
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage()

    // Header strip
    pdf.setFillColor(20, 28, 40) // card color #141c28
    pdf.rect(0, 0, pageW, HEADER_H_MM, 'F')

    // Header text
    pdf.setTextColor(13, 217, 196) // teal
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('P-SKE Construction Intelligence', 4, 6.5)

    pdf.setTextColor(148, 163, 184) // text-2
    pdf.setFont('helvetica', 'normal')
    pdf.text(title, pageW / 2, 6.5, { align: 'center' })
    pdf.text(`${dateStr}  ·  Page ${page + 1} / ${totalPages}`, pageW - 4, 6.5, { align: 'right' })

    // Thin accent line
    pdf.setDrawColor(13, 217, 196)
    pdf.setLineWidth(0.3)
    pdf.line(0, HEADER_H_MM, pageW, HEADER_H_MM)

    // Image — shift up by (page * contentH) to show the correct slice
    const yPos = HEADER_H_MM - page * contentH
    pdf.addImage(imgData, 'PNG', 0, yPos, scaledImgW, scaledImgH)
  }

  pdf.save(`${filename}.pdf`)
}
