// api/sms-image.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sender, message, date, time, format = 'png', quality = 0.9 } = req.query;

    // Validate required parameters
    if (!sender || !message) {
      return res.status(400).json({ 
        error: 'Missing required parameters: sender and message are required' 
      });
    }

    // Generate HTML content for the SMS
    const htmlContent = generateSMSHTML(sender, message, date, time);
    
    // Set response headers based on format
    const contentType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const filename = `sms-${sender.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${format}`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // For Vercel, we'll redirect to the main page with parameters
    // since we can't easily render HTML to image in serverless function
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    
    // Redirect to the main page which will handle the image generation
    res.redirect(302, `${baseUrl}/?${new URLSearchParams(req.query).toString()}`);
    
  } catch (error) {
    console.error('Error generating SMS image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateSMSHTML(sender, message, date = '08/07/2025', time = '14:55') {
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
        
        body {
            margin: 0;
            padding: 20px;
            background: #111;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: "Courier New", Courier, monospace;
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
        
        .screen::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
            background-size: 3px 3px;
            opacity: 0.7;
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
    <div class="phone">
        <div class="bezel">
            <div class="screen">
                <!-- HEADER -->
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
                    <div class="title">${escapeHtml(sender)}</div>
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
                <!-- MESSAGE -->
                <div class="body">
                    <div class="message">${escapeHtml(message)}</div>
                    <div class="meta">
                        <div>Dari:</div>
                        <div class="from">${escapeHtml(sender)}</div>
                        <div class="date">${escapeHtml(date)}<br>${escapeHtml(time)}</div>
                    </div>
                </div>
                <!-- MENU -->
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
