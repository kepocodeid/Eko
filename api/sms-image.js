const { createCanvas, registerFont } = require('canvas');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET method.'
    });
  }

  try {
    // Extract parameters from query string
    const {
      sender = 'Pak Eko',
      message = 'Test pesan dari Pak Eko',
      date = new Date().toLocaleDateString('id-ID'),
      time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      format = 'png',
      quality = 0.9
    } = req.query;

    // Validate parameters
    if (!sender || !message) {
      return res.status(400).json({
        success: false,
        error: 'Parameter sender dan message diperlukan'
      });
    }

    // Validate format
    const validFormats = ['png', 'jpeg', 'jpg'];
    const imageFormat = validFormats.includes(format.toLowerCase()) ? format : 'png';

    // Validate quality
    const imageQuality = Math.min(Math.max(parseFloat(quality) || 0.9, 0.1), 1.0);

    // Create canvas
    const canvasWidth = 360;
    const canvasHeight = 420;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw SMS interface
    await drawSMSInterface(ctx, canvasWidth, canvasHeight, sender, message, date, time);

    // Set response headers
    const filename = `sms-${Date.now()}.${imageFormat}`;
    
    if (imageFormat === 'png') {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      const buffer = canvas.toBuffer('image/png');
      res.send(buffer);
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      const buffer = canvas.toBuffer('image/jpeg', { quality: imageQuality });
      res.send(buffer);
    }

  } catch (error) {
    console.error('Error generating SMS image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Function to draw SMS interface
async function drawSMSInterface(ctx, width, height, sender, message, date, time) {
  // Phone background (dark gray)
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, width, height);
  
  // Phone bezel (black)
  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, height - 16);
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, width - 16, height - 16);
  
  // Screen background (light blue)
  const screenX = 15;
  const screenY = 15;
  const screenWidth = width - 30;
  const screenHeight = height - 50;
  
  ctx.fillStyle = '#dbeef0';
  ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
  
  // Screen border
  ctx.strokeStyle = '#053f36';
  ctx.lineWidth = 3;
  ctx.strokeRect(screenX, screenY, screenWidth, screenHeight);
  
  // Header (green)
  const headerHeight = 56;
  ctx.fillStyle = '#0f6b5a';
  ctx.fillRect(screenX, screenY, screenWidth, headerHeight);
  
  // Header icons (left side)
  drawSignalIcon(ctx, screenX + 10, screenY + 18);
  drawSMSIcon(ctx, screenX + 35, screenY + 18);
  
  // Sender name in header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Arial Black", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sender, screenX + screenWidth / 2, screenY + 35);
  
  // Header icons (right side)
  drawAlarmIcon(ctx, screenX + screenWidth - 80, screenY + 18);
  drawVibrateIcon(ctx, screenX + screenWidth - 55, screenY + 18);
  drawBatteryIcon(ctx, screenX + screenWidth - 30, screenY + 18);
  
  // Message area
  const messageX = screenX + 20;
  const messageY = screenY + headerHeight + 20;
  const messageWidth = screenWidth - 40;
  
  ctx.fillStyle = '#263a3d';
  ctx.font = '26px "Courier New", Courier, monospace';
  ctx.textAlign = 'left';
  
  // Split message into lines
  const lines = splitTextIntoLines(ctx, message, messageWidth);
  let currentY = messageY;
  
  for (const line of lines) {
    ctx.fillText(line, messageX, currentY);
    currentY += 35;
  }
  
  // Metadata section
  const metaY = currentY + 20;
  
  ctx.fillStyle = '#6b7680';
  ctx.font = '18px "Courier New", Courier, monospace';
  ctx.fillText('Dari:', messageX, metaY);
  
  ctx.fillStyle = '#132728';
  ctx.font = 'bold 18px "Courier New", Courier, monospace';
  ctx.fillText(sender, messageX, metaY + 25);
  
  ctx.fillStyle = '#112a2b';
  ctx.font = 'bold 18px "Courier New", Courier, monospace';
  ctx.fillText(`${date}`, messageX, metaY + 55);
  ctx.fillText(`${time}`, messageX, metaY + 80);
  
  // Bottom menu bar
  const bottomBarY = screenY + screenHeight - 30;
  ctx.fillStyle = '#060606';
  ctx.fillRect(screenX, bottomBarY, screenWidth, 30);
  
  ctx.fillStyle = '#bfe0ff';
  ctx.font = 'bold 16px "Courier New", Courier, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Pilihan', screenX + 10, bottomBarY + 20);
  
  ctx.textAlign = 'right';
  ctx.fillText('Kembali', screenX + screenWidth - 10, bottomBarY + 20);
}

// Function to split text into lines
function splitTextIntoLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + ' ' + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Icon drawing functions
function drawSignalIcon(ctx, x, y) {
  ctx.fillStyle = '#6c5ce7';
  ctx.fillRect(x, y + 8, 2, 6);
  ctx.fillRect(x + 4, y + 6, 2, 8);
  ctx.fillStyle = '#00b0ff';
  ctx.fillRect(x + 8, y + 4, 2, 10);
  ctx.fillRect(x + 12, y + 2, 2, 12);
}

function drawSMSIcon(ctx, x, y) {
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y + 2, 16, 10);
  
  ctx.strokeStyle = '#00b0ff';
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.lineTo(x + 8, y + 8);
  ctx.lineTo(x + 16, y + 2);
  ctx.stroke();
}

function drawAlarmIcon(ctx, x, y) {
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 8, y + 8, 6, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.strokeStyle = '#00b0ff';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 8);
  ctx.lineTo(x + 8, y + 4);
  ctx.moveTo(x + 8, y + 8);
  ctx.lineTo(x + 11, y + 8);
  ctx.stroke();
}

function drawVibrateIcon(ctx, x, y) {
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, 10, 8);
  
  ctx.strokeStyle = '#00b0ff';
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x + 2, y + 6);
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x + 2, y + 6);
  
  ctx.moveTo(x + 14, y + 4);
  ctx.lineTo(x + 12, y + 6);
  ctx.moveTo(x + 14, y + 8);
  ctx.lineTo(x + 12, y + 6);
  ctx.stroke();
}

function drawBatteryIcon(ctx, x, y) {
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y + 2, 14, 6);
  ctx.fillStyle = '#6c5ce7';
  ctx.fillRect(x + 14, y + 4, 2, 2);
  
  ctx.fillStyle = '#00b0ff';
  ctx.fillRect(x + 2, y + 4, 8, 2);
}
