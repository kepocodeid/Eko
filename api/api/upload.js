// api/upload.js (Backend API)
export default async function handler(request, response) {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    const { image, url, filename = 'image.png' } = request.body;

    try {
        let imageBuffer;
        
        if (image) {
            // Process from base64
            imageBuffer = Buffer.from(image, 'base64');
        } else if (url) {
            // Download from URL
            const downloadResponse = await fetch(url);
            const arrayBuffer = await downloadResponse.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        } else {
            return response.status(400).json({
                success: false,
                error: 'Parameter image atau url diperlukan'
            });
        }

        // Upload to Uguu CDN
        const cdnUrl = await uploadToUguu(imageBuffer, filename);
        
        return response.status(200).json({
            success: true,
            data: {
                cdnUrl: cdnUrl,
                filename: filename,
                size: imageBuffer.length,
                message: 'Gambar berhasil diupload ke CDN'
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return response.status(500).json({
            success: false,
            error: 'Gagal upload gambar ke CDN',
            details: error.message
        });
    }
}

async function uploadToUguu(imageBuffer, filename) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
    const formData = [];
    
    formData.push(`--${boundary}`);
    formData.push(`Content-Disposition: form-data; name="files[]"; filename="${filename}"`);
    formData.push(`Content-Type: image/png`);
    formData.push('');
    formData.push(imageBuffer.toString('binary'));
    formData.push(`--${boundary}--`);
    
    const body = formData.join('\r\n');
    
    const response = await fetch('https://uguu.se/upload.php', {
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: body
    });
    
    const data = await response.json();
    return data.files[0].url;
}
