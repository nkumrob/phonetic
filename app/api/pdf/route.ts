import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { withRateLimit } from '@/lib/middleware/with-rate-limit';
import { getCacheHeaders, cacheConfigs } from '@/lib/utils/cache-headers';


const natoAlphabet = [
  { letter: 'A', code: 'Alpha', pronunciation: 'AL-fah' },
  { letter: 'B', code: 'Bravo', pronunciation: 'BRAH-voh' },
  { letter: 'C', code: 'Charlie', pronunciation: 'CHAR-lee' },
  { letter: 'D', code: 'Delta', pronunciation: 'DELL-tah' },
  { letter: 'E', code: 'Echo', pronunciation: 'ECK-oh' },
  { letter: 'F', code: 'Foxtrot', pronunciation: 'FOKS-trot' },
  { letter: 'G', code: 'Golf', pronunciation: 'GOLF' },
  { letter: 'H', code: 'Hotel', pronunciation: 'hoh-TELL' },
  { letter: 'I', code: 'India', pronunciation: 'IN-dee-ah' },
  { letter: 'J', code: 'Juliet', pronunciation: 'JEW-lee-ett' },
  { letter: 'K', code: 'Kilo', pronunciation: 'KEY-loh' },
  { letter: 'L', code: 'Lima', pronunciation: 'LEE-mah' },
  { letter: 'M', code: 'Mike', pronunciation: 'MIKE' },
  { letter: 'N', code: 'November', pronunciation: 'no-VEM-ber' },
  { letter: 'O', code: 'Oscar', pronunciation: 'OSS-car' },
  { letter: 'P', code: 'Papa', pronunciation: 'PAH-pah' },
  { letter: 'Q', code: 'Quebec', pronunciation: 'keh-BECK' },
  { letter: 'R', code: 'Romeo', pronunciation: 'ROW-me-oh' },
  { letter: 'S', code: 'Sierra', pronunciation: 'see-AIR-rah' },
  { letter: 'T', code: 'Tango', pronunciation: 'TANG-go' },
  { letter: 'U', code: 'Uniform', pronunciation: 'YOO-nee-form' },
  { letter: 'V', code: 'Victor', pronunciation: 'VIK-tor' },
  { letter: 'W', code: 'Whiskey', pronunciation: 'WISS-key' },
  { letter: 'X', code: 'X-ray', pronunciation: 'ECKS-ray' },
  { letter: 'Y', code: 'Yankee', pronunciation: 'YANG-key' },
  { letter: 'Z', code: 'Zulu', pronunciation: 'ZOO-loo' },
];

async function handleGet(request: NextRequest) {
  try {
    // Create a simple HTML structure that browsers will convert to PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>NATO Phonetic Alphabet Reference</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            h1 {
              text-align: center;
              color: #1e40af;
              margin-bottom: 10px;
            }
            .subtitle {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #1e40af;
              color: white;
              font-weight: bold;
              text-align: center;
            }
            td:first-child {
              text-align: center;
              font-weight: bold;
              font-size: 1.2em;
              color: #1e40af;
            }
            td:nth-child(2) {
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #666;
              font-size: 0.9em;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            .logo {
              font-weight: bold;
              color: #1e40af;
            }
            .date {
              color: #666;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">phoneticalphabet.com</div>
            <div class="date">${new Date().toLocaleDateString()}</div>
          </div>
          
          <h1>NATO Phonetic Alphabet</h1>
          <p class="subtitle">International Radiotelephony Spelling Alphabet</p>
          
          <table>
            <thead>
              <tr>
                <th>Letter</th>
                <th>Code Word</th>
                <th>Pronunciation</th>
              </tr>
            </thead>
            <tbody>
              ${natoAlphabet.map(item => `
                <tr>
                  <td>${item.letter}</td>
                  <td>${item.code}</td>
                  <td>${item.pronunciation}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} phoneticalphabet.com - Learn more at phoneticalphabet.com</p>
            <p>This reference guide is for educational purposes</p>
          </div>
        </body>
      </html>
    `;

    const headers = new Headers({
      'Content-Type': 'text/html',
      'Content-Disposition': 'attachment; filename="nato-phonetic-alphabet.html"',
    });
    
    // Add cache headers for static content
    const cacheHeaders = getCacheHeaders(cacheConfigs.static);
    cacheHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
    
    return new NextResponse(html, { headers });
  } catch (error) {
    logger.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

// Export rate-limited handler
export const GET = withRateLimit(handleGet, {
  max: 20, // 20 PDF downloads per window
  windowMs: 60 * 60 * 1000, // 1 hour window
});