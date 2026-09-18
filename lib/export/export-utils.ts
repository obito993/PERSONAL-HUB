import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Packer } from 'docx';
import { ParsedResume } from '@/types';

export async function exportToDocx(resume: ParsedResume, fileName: string = 'Tailored_Resume.docx') {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          // Header: Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: resume.contact.name || 'Candidate Name',
                bold: true,
                size: 32, // 16pt
                font: 'Calibri',
                color: '111827',
              }),
            ],
          }),

          // Contact Subheader
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: [
                  resume.contact.email,
                  resume.contact.phone,
                  resume.contact.location,
                  resume.contact.linkedin,
                  resume.contact.github,
                ]
                  .filter(Boolean)
                  .join(' | '),
                size: 20, // 10pt
                font: 'Calibri',
                color: '4B5563',
              }),
            ],
          }),

          // Professional Summary Header
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D1D5DB' },
            },
            children: [
              new TextRun({
                text: 'PROFESSIONAL SUMMARY',
                bold: true,
                size: 22,
                font: 'Calibri',
                color: 'EA580C',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: resume.summary,
                size: 20,
                font: 'Calibri',
              }),
            ],
          }),

          // Technical & Core Skills
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D1D5DB' },
            },
            children: [
              new TextRun({
                text: 'TECHNICAL SKILLS',
                bold: true,
                size: 22,
                font: 'Calibri',
                color: 'EA580C',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Technical Skills: ',
                bold: true,
                size: 20,
                font: 'Calibri',
              }),
              new TextRun({
                text: resume.skills.technical.join(', '),
                size: 20,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Soft Skills & Methodologies: ',
                bold: true,
                size: 20,
                font: 'Calibri',
              }),
              new TextRun({
                text: resume.skills.soft.join(', '),
                size: 20,
                font: 'Calibri',
              }),
            ],
          }),

          // Professional Experience Header
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D1D5DB' },
            },
            children: [
              new TextRun({
                text: 'PROFESSIONAL EXPERIENCE',
                bold: true,
                size: 22,
                font: 'Calibri',
                color: 'EA580C',
              }),
            ],
          }),

          // Experience Loop
          ...resume.experience.flatMap((exp) => [
            new Paragraph({
              spacing: { before: 150, after: 50 },
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                  size: 21,
                  font: 'Calibri',
                }),
                new TextRun({
                  text: ` — ${exp.company}`,
                  italics: true,
                  size: 21,
                  font: 'Calibri',
                }),
                new TextRun({
                  text: ` (${exp.startDate} – ${exp.endDate})`,
                  size: 19,
                  font: 'Calibri',
                  color: '6B7280',
                }),
              ],
            }),
            ...exp.bullets.map(
              (bullet) =>
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 50 },
                  children: [
                    new TextRun({
                      text: bullet,
                      size: 20,
                      font: 'Calibri',
                    }),
                  ],
                })
            ),
          ]),

          // Education Header
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 250, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D1D5DB' },
            },
            children: [
              new TextRun({
                text: 'EDUCATION',
                bold: true,
                size: 22,
                font: 'Calibri',
                color: 'EA580C',
              }),
            ],
          }),
          ...resume.education.map(
            (edu) =>
              new Paragraph({
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: `${edu.degree} in ${edu.field}`,
                    bold: true,
                    size: 20,
                    font: 'Calibri',
                  }),
                  new TextRun({
                    text: ` | ${edu.institution} (${edu.startDate} – ${edu.endDate})`,
                    size: 20,
                    font: 'Calibri',
                    color: '4B5563',
                  }),
                ],
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;

  // Check client execution
  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function triggerPrintPdf(elementId: string) {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ResumeForge AI - Print</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
      </head>
      <body class="bg-white text-black p-8">
        ${element.innerHTML}
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 500);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
