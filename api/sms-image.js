import html2canvas from 'html2canvas';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sender, message, date, time, format = 'png', quality = 0.9 } = req.query;

    // Validasi parameter required
    if (!sender || !message) {
      return res.status(400).json({ 
        error: 'Parameter sender dan message diperlukan' 
      });
    }

    // Generate HTML content
    const htmlContent = generateHTML(sender, message, date, time);
    
    // Create virtual DOM
    const dom = new JSDOM(htmlContent, {
      resources: 'usable',
      runScripts: 'dangerously'
    });

    const document = dom.window.document;
    await dom.window.customElements.whenDefined;

    // Wait for resources to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the SMS mockup element
    const smsMockup = document.getElementById('sms-mockup');
    
    if (!smsMockup) {
      throw new Error('Element SMS mockup tidak ditemukan');
    }

    // Convert to canvas
    const canvas = await html2canvas(smsMockup, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: 360,
      height: 420
    });

    // Convert to buffer
    let buffer;
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    
    if (format === 'jpeg') {
      buffer = canvas.toBuffer('image/jpeg', { 
        quality: parseFloat(quality) 
      });
    } else {
      buffer = canvas.toBuffer('image/png');
    }

    // Upload to Catxbox CDN
    const cdnUrl = await uploadToCatxbox(buffer, mimeType);

    // Set response headers based on request
    if (req.query.download === 'true') {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="sms-${Date.now()}.${format}"`);
      return res.send(buffer);
    }

    // Return JSON response with CDN URL
    return res.json({
      success: true,
      image_url: cdnUrl,
      cdn: 'catxbox',
      format: format,
      quality: format === 'jpeg' ? parseFloat(quality) : 1.0,
      parameters: {
        sender,
        message,
        date: date || '08/07/2025',
        time: time || '14:55'
      }
    });

  } catch (error) {
    console.error('Error generating SMS image:', error);
    return res.status(500).json({ 
      error: 'Gagal menghasilkan gambar SMS',
      details: error.message 
    });
  }
}

// Function to generate HTML template
function generateHTML(sender, message, date = '08/07/2025', time = '14:55') {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        :root {
            --phone-bg: #0b0b0b;
            --screen-bg: #dbeef0;
            --header-bg: #0f6b5a;
            --text: #0b2430;
            --muted: #6b7680;
            --bottom-bg: #060606;
            --icon-main: #6c5ce7;
            --icon-alt: #00b0ff;
            --icon-line: #ffffff;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: "Courier New", Courier, monospace;
            background: #111;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .phone {
            width: 360px;
            height: 420px;
            background: var(--phone-bg);
            border-radius: 18px;
            padding: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .bezel {
            width: 100%;
            height: 100%;
            background: #000;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .screen {
            width: calc(100% - 18px);
            height: calc(100% - 40px);
            background: var(--screen-bg);
            border-radius: 6px;
            overflow: hidden;
            position: relative;
            border: 3px solid #053f36;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            height: 56px;
            background: var(--header-bg);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 10px;
            font-size: 20px;
        }
        
        .header .left, .header .right {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .title {
            flex: 1;
            text-align: center;
            font-family: "Arial Black", Arial, sans-serif;
            font-size: 22px;
        }
        
        .icon-svg {
            width: 20px;
            height: 20px;
        }
        
        .body {
            padding: 18px 20px;
            color: var(--text);
            font-size: 20px;
            line-height: 1.5;
            flex: 1;
        }
        
        .message {
            font-size: 26px;
            line-height: 1.35;
            color: #263a3d;
            margin-bottom: 18px;
            white-space: pre-line;
        }
        
        .meta {
            margin-top: 8px;
            color: var(--muted);
            font-size: 18px;
            line-height: 1.3;
        }
        
        .meta .from {
            font-weight: 700;
            color: #132728;
            margin-bottom: 6px;
        }
        
        .meta .date {
            font-weight: 700;
            color: #112a2b;
        }
        
        .bottom-bar {
            height: 46px;
            background: var(--bottom-bg);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            color: #bfe0ff;
            font-weight: 700;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class="phone" id="sms-mockup">
        <div class="bezel">
            <div class="screen">
                <div class="header">
                    <div class="left">
                        <svg class="icon-svg" viewBox="0 0 24 24">
                            <rect x="2" y="16" width="2" height="6" fill="var(--icon-main)"/>
                            <rect x="6" y="12" width="2" height="10" fill="var(--icon-main)"/>
                            <rect x="10" y="8" width="2" height="14" fill="var(--icon-alt)"/>
                            <rect x="14" y="4" width="2" height="18" fill="var(--icon-alt)"/>
                        </svg>
                        <svg class="icon-svg" viewBox="0 0 24 24">
                            <rect x="2" y="6" width="20" height="12" stroke="var(--icon-main)" fill="none" stroke-width="2"/>
                            <polyline points="2,6 12,13 22,6" stroke="var(--icon-alt)" stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                    <div class="title" id="sender-name">${escapeHtml(sender)}</div>
                    <div class="right">
                        <svg class="icon-svg" viewBox="0 0 24 24">
                            <circle cx="12" cy="13" r="6" stroke="var(--icon-main)" fill="none" stroke-width="2"/>
                            <line x1="12" y1="13" x2="12" y2="9" stroke="var(--icon-alt)" stroke-width="2"/>
                            <line x1="12" y1="13" x2="15" y2="13" stroke="var(--icon-alt)" stroke-width="2"/>
                        </svg>
                        <svg class="icon-svg" viewBox="0 0 24 24">
                            <rect x="8" y="6" width="8" height="12" stroke="var(--icon-main)" fill="none" stroke-width="2"/>
                            <line x1="2" y1="8" x2="5" y2="10" stroke="var(--icon-alt)" stroke-width="2"/>
                            <line x1="2" y1="14" x2="5" y2="12" stroke="var(--icon-alt)" stroke-width="2"/>
                            <line x1="22" y1="8" x2="19" y2="10" stroke="var(--icon-alt)" stroke-width="2"/>
                            <line x1="22" y1="14" x2="19" y2="12" stroke="var(--icon-alt)" stroke-width="2"/>
                        </svg>
                        <svg class="icon-svg" viewBox="0 0 26 14">
                            <rect x="1" y="3" width="20" height="8" stroke="var(--icon-main)" fill="none" stroke-width="2"/>
                            <rect x="22" y="5" width="3" height="4" fill="var(--icon-main)"/>
                            <rect x="3" y="5" width="14" height="4" fill="var(--icon-alt)"/>
                        </svg>
                    </div>
                </div>
                <div class="body">
                    <div class="message" id="message-content">${escapeHtml(message)}</div>
                    <div class="meta">
                        <div>Dari:</div>
                        <div class="from" id="from-name">${escapeHtml(sender)}</div>
                        <div class="date" id="message-date">${escapeHtml(date)}<br>${escapeHtml(time)}</div>
                    </div>
                </div>
                <div class="bottom-bar">
                    <div class="menu-left">Pilihan</div>
                    <div class="menu-right">Kembali</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Function to upload to Catxbox CDN
async function uploadToCatxbox(buffer, mimeType) {
  try {
    const formData = new FormData();
    const fileType = await fileTypeFromBuffer(buffer);
    const ext = fileType?.ext || 'png';
    const filename = `sms-${Date.now()}.${ext}`;
    
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', buffer, {
      filename: filename,
      contentType: mimeType
    });

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.text();
    return result;
  } catch (error) {
    console.error('Error uploading to Catxbox:', error);
    throw new Error('Gagal mengupload gambar ke CDN');
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
