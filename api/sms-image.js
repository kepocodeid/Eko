const s = {
    tools: {
        async hit(description, url, options, returnType = 'text') {
            try {
                const response = await fetch(url, options);
                if (!response.ok) throw new Error(`${response.status} ${response.statusText}\n${await response.text() || '(response body kosong)'}`);
                if (returnType === 'text') {
                    const data = await response.text();
                    return { data, response };
                } else if (returnType === 'json') {
                    const data = await response.json();
                    return { data, response };
                } else {
                    throw new Error(`invalid returnType param.`);
                }
            } catch (e) {
                throw new Error(`hit ${description} failed. ${e.message}`);
            }
        }
    },

    // Generate HTML untuk preview SMS
    generateSMSHTML(sender = "Pak Eko", message = "Test pesan", date = "08/07/2025", time = "14:55") {
        return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMS - ${sender}</title>
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
            align-items: center;
            justify-content: center;
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
                        <!-- signal -->
                        <svg class="icon-svg" viewBox="0 0 24 24">
                            <rect x="2" y="16" width="2" height="6" fill="var(--icon-main)"/>
                            <rect x="6" y="12" width="2" height="10" fill="var(--icon-main)"/>
                            <rect x="10" y="8" width="2" height="14" fill="var(--icon-alt)"/>
                            <rect x="14" y="4" width="2" height="18" fill="var(--icon-alt)"/>
                        </svg>
                        <!-- sms -->
                        <svg class="icon-svg" viewBox="0 0 24 24">
                            <rect x="2" y="6" width="20" height="12" stroke="var(--icon-main)" fill="none" stroke-width="2"/>
                            <polyline points="2,6 12,13 22,6" stroke="var(--icon-alt)" stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                    <div class="title">${sender}</div>
                    <div class="right">
                        <!-- alarm -->
                        <svg class="icon-svg" viewBox="0 0 24 24">
                            <circle cx="12" cy="13" r="6" stroke="var(--icon-main)" fill="none" stroke-width="2"/>
                            <line x1="12" y1="13" x2="12" y2="9" stroke="var(--icon-alt)" stroke-width="2"/>
                            <line x1="12" y1="13" x2="15" y2="13" stroke="var(--icon-alt)" stroke-width="2"/>
                        </svg>
                        <!-- vibrate -->
                        <svg class="icon-svg" viewBox="0 0 24 24">
                            <rect x="8" y="6" width="8" height="12" stroke="var(--icon-main)" fill="none" stroke-width="2"/>
                            <line x1="2" y1="8" x2="5" y2="10" stroke="var(--icon-alt)" stroke-width="2"/>
                            <line x1="2" y1="14" x2="5" y2="12" stroke="var(--icon-alt)" stroke-width="2"/>
                            <line x1="22" y1="8" x2="19" y2="10" stroke="var(--icon-alt)" stroke-width="2"/>
                            <line x1="22" y1="14" x2="19" y2="12" stroke="var(--icon-alt)" stroke-width="2"/>
                        </svg>
                        <!-- battery -->
                        <svg class="icon-svg" viewBox="0 0 26 14">
                            <rect x="1" y="3" width="20" height="8" stroke="var(--icon-main)" fill="none" stroke-width="2"/>
                            <rect x="22" y="5" width="3" height="4" fill="var(--icon-main)"/>
                            <rect x="3" y="5" width="14" height="4" fill="var(--icon-alt)"/>
                        </svg>
                    </div>
                </div>
                <!-- MESSAGE -->
                <div class="body">
                    <div class="message">${message.replace(/\n/g, '<br>')}</div>
                    <div class="meta">
                        <div>Dari:</div>
                        <div class="from">${sender}</div>
                        <div class="date">${date}<br>${time}</div>
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
</html>`;
    },

    // Generate gambar SMS menggunakan Puppeteer
    async generateSMSImage(sender, message, date, time, format = 'png', quality = 0.9) {
        try {
            const htmlContent = this.generateSMSHTML(sender, message, date, time);
            
            // Gunakan service external untuk render HTML ke image
            const renderUrl = 'https://html2canvas.hertzen.com/demo.html';
            
            // Untuk implementasi real, kita akan menggunakan Canvas di server
            // Tapi karena Vercel tidak support Puppeteer dengan baik, kita gunakan approach lain
            
            const { createCanvas } = await import('canvas');
            const canvas = createCanvas(360, 420);
            const ctx = canvas.getContext('2d');
            
            // Draw SMS interface manual dengan Canvas
            this.drawSMSCcanvas(ctx, 360, 420, sender, message, date, time);
            
            let imageBuffer;
            if (format === 'png') {
                imageBuffer = canvas.toBuffer('image/png');
            } else {
                imageBuffer = canvas.toBuffer('image/jpeg', { quality: parseFloat(quality) });
            }
            
            return {
                success: true,
                image: imageBuffer.toString('base64'),
                format: format,
                size: imageBuffer.length,
                html: htmlContent
            };
            
        } catch (error) {
            throw new Error(`Generate SMS image failed: ${error.message}`);
        }
    },

    // Draw SMS interface menggunakan Canvas
    drawSMSCanvas(ctx, width, height, sender, message, date, time) {
        // Phone background
        ctx.fillStyle = '#0b0b0b';
        ctx.fillRect(0, 0, width, height);
        
        // Screen
        ctx.fillStyle = '#dbeef0';
        ctx.fillRect(10, 10, width - 20, height - 30);
        
        // Header
        ctx.fillStyle = '#0f6b5a';
        ctx.fillRect(10, 10, width - 20, 56);
        
        // Sender text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(sender, width / 2, 40);
        
        // Message
        ctx.fillStyle = '#263a3d';
        ctx.font = '20px Courier New';
        ctx.textAlign = 'left';
        
        const lines = this.wrapText(ctx, message, width - 40);
        let yPos = 90;
        
        for (const line of lines) {
            ctx.fillText(line, 20, yPos);
            yPos += 25;
        }
        
        // Metadata
        ctx.fillStyle = '#6b7680';
        ctx.font = '16px Courier New';
        ctx.fillText('Dari:', 20, yPos + 20);
        
        ctx.fillStyle = '#132728';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText(sender, 20, yPos + 45);
        
        ctx.fillStyle = '#112a2b';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText(`${date} ${time}`, 20, yPos + 70);
        
        // Bottom bar
        ctx.fillStyle = '#060606';
        ctx.fillRect(10, height - 40, width - 20, 30);
        
        ctx.fillStyle = '#bfe0ff';
        ctx.font = 'bold 14px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('Pilihan', 20, height - 20);
        
        ctx.textAlign = 'right';
        ctx.fillText('Kembali', width - 20, height - 20);
    },

    // Helper untuk wrap text
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    },

    // Alternative: Gunakan external HTML to image service
    async generateWithExternalService(htmlContent, format = 'png') {
        try {
            // Gunakan html2canvas via API call (contoh implementasi)
            const response = await this.tools.hit(
                'html to image service',
                'https://api.html2canvas.app/capture',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        html: htmlContent,
                        format: format,
                        width: 360,
                        height: 420
                    })
                },
                'json'
            );
            
            return response.data;
        } catch (error) {
            throw new Error(`External service failed: ${error.message}`);
        }
    }
}

export default async function handler(request, response) {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    // Handle GET requests for image generation
    if (request.method === 'GET') {
        const {
            sender = 'Pak Eko',
            message = 'Test pesan',
            date = '08/07/2025',
            time = '14:55',
            format = 'png',
            quality = 0.9,
            html = 'false',
            retry = 0
        } = request.query;

        // Validate parameters
        if (!message) {
            return response.status(400).json({
                success: false,
                error: 'Parameter message diperlukan'
            });
        }

        // Validate format
        const validFormats = ['png', 'jpeg', 'jpg'];
        const imageFormat = validFormats.includes(format.toLowerCase()) ? format : 'png';

        // Validate quality
        const imageQuality = Math.min(Math.max(parseFloat(quality) || 0.9, 0.1), 1.0);

        try {
            // Jika hanya minta HTML
            if (html.toLowerCase() === 'true') {
                const htmlContent = s.generateSMSHTML(sender, message, date, time);
                
                response.setHeader('Content-Type', 'text/html');
                return response.status(200).send(htmlContent);
            }

            // Generate image
            const result = await s.generateSMSImage(sender, message, date, time, imageFormat, imageQuality);

            if (imageFormat === 'png') {
                response.setHeader('Content-Type', 'image/png');
                response.setHeader('Content-Disposition', `inline; filename="sms-${Date.now()}.png"`);
            } else {
                response.setHeader('Content-Type', 'image/jpeg');
                response.setHeader('Content-Disposition', `inline; filename="sms-${Date.now()}.jpg"`);
            }

            const imageBuffer = Buffer.from(result.image, 'base64');
            return response.status(200).send(imageBuffer);

        } catch (error) {
            console.error('Error generating SMS image:', error);
            
            // Retry logic
            const retryCount = parseInt(retry);
            if (retryCount < 2) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const newQuery = new URLSearchParams(request.query);
                newQuery.set('retry', retryCount + 1);
                
                const newRequest = {
                    ...request,
                    query: Object.fromEntries(newQuery)
                };
                return handler(newRequest, response);
            }
            
            return response.status(500).json({
                success: false,
                error: 'Gagal menghasilkan gambar SMS',
                message: error.message
            });
        }
    }

    // Handle POST requests
    if (request.method === 'POST') {
        const {
            sender = 'Pak Eko',
            message = 'Test pesan',
            date = '08/07/2025',
            time = '14:55',
            format = 'png',
            quality = 0.9,
            retry = 0
        } = request.body;

        if (!message) {
            return response.status(400).json({
                success: false,
                error: 'Parameter message diperlukan'
            });
        }

        try {
            const result = await s.generateSMSImage(sender, message, date, time, format, quality);

            return response.status(200).json({
                success: true,
                data: {
                    sender,
                    message,
                    date,
                    time,
                    format,
                    quality,
                    image: result.image,
                    size: result.size,
                    html: result.html
                }
            });

        } catch (error) {
            console.error('Error generating SMS image:', error);
            
            const retryCount = parseInt(retry);
            if (retryCount < 2) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return handler({
                    ...request,
                    body: { ...request.body, retry: retryCount + 1 }
                }, response);
            }
            
            return response.status(500).json({
                success: false,
                error: 'Gagal menghasilkan gambar SMS',
                message: error.message
            });
        }
    }

    // Method not allowed
    return response.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}
