document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Form elements
    const senderInput = document.getElementById('sender');
    const messageInput = document.getElementById('message');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const formatSelect = document.getElementById('format');
    const qualityInput = document.getElementById('quality');
    
    // Preview elements
    const previewSender = document.getElementById('preview-sender');
    const previewSenderMeta = document.getElementById('preview-sender-meta');
    const previewMessage = document.getElementById('preview-message');
    const previewDatetime = document.getElementById('preview-datetime');
    
    // API elements
    const apiUrlElement = document.getElementById('api-url');
    const testResultElement = document.getElementById('test-result');
    
    // Image elements
    const generatedImage = document.getElementById('generated-image');
    const statusMessage = document.getElementById('status-message');
    
    // Buttons
    const updatePreviewBtn = document.getElementById('update-preview');
    const resetValuesBtn = document.getElementById('reset-values');
    const generateApiBtn = document.getElementById('generate-api');
    const copyUrlBtn = document.getElementById('copy-url');
    const testApiBtn = document.getElementById('test-api');
    const generateImageBtn = document.getElementById('generate-image');
    const downloadImageBtn = document.getElementById('download-image');
    
    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Update preview function
    function updatePreview() {
        previewSender.textContent = senderInput.value;
        previewSenderMeta.textContent = senderInput.value;
        previewMessage.textContent = messageInput.value;
        previewDatetime.innerHTML = `${dateInput.value}<br>${timeInput.value}`;
        
        showStatus('Pratinjau diperbarui!', 'success');
    }
    
    // Reset to default values
    function resetToDefault() {
        senderInput.value = 'Pak Eko';
        messageInput.value = 'Kita ga enakan, orang seenaknya';
        dateInput.value = '08/07/2025';
        timeInput.value = '14:55';
        formatSelect.value = 'png';
        qualityInput.value = '0.9';
        
        updatePreview();
        showStatus('Nilai direset ke default!', 'success');
    }
    
    // Generate API URL
    function generateApiUrl() {
        const baseUrl = window.location.origin + '/api/sms-image';
        const params = new URLSearchParams({
            sender: senderInput.value,
            message: messageInput.value,
            date: dateInput.value,
            time: timeInput.value,
            format: formatSelect.value,
            quality: qualityInput.value
        });
        
        const apiUrl = `${baseUrl}?${params.toString()}`;
        apiUrlElement.textContent = apiUrl;
        
        showStatus('URL API berhasil digenerate!', 'success');
        return apiUrl;
    }
    
    // Copy URL to clipboard
    function copyUrlToClipboard() {
        const apiUrl = apiUrlElement.textContent;
        if (apiUrl === 'URL akan muncul di sini...') {
            showStatus('Generate URL terlebih dahulu!', 'error');
            return;
        }
        
        navigator.clipboard.writeText(apiUrl).then(() => {
            showStatus('URL berhasil disalin ke clipboard!', 'success');
        }).catch(err => {
            showStatus('Gagal menyalin URL: ' + err, 'error');
        });
    }
    
    // Test API
    async function testApi() {
        const apiUrl = generateApiUrl();
        
        try {
            showStatus('Menguji API...', 'info');
            
            const response = await fetch(apiUrl);
            
            if (response.ok) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                
                testResultElement.innerHTML = `
                    <div style="color: #27ae60; margin: 10px 0;">
                        ✅ API berhasil diakses! Status: ${response.status}
                    </div>
                    <img src="${imageUrl}" style="max-width: 200px; border: 2px solid #27ae60; border-radius: 5px;" alt="Test result">
                `;
                
                showStatus('API test berhasil!', 'success');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            testResultElement.innerHTML = `
                <div style="color: #e74c3c; margin: 10px 0;">
                    ❌ Gagal mengakses API: ${error.message}
                </div>
            `;
            showStatus('API test gagal!', 'error');
        }
    }
    
    // Generate image using html2canvas
    function generateImage() {
        const smsPreview = document.getElementById('sms-preview');
        
        showStatus('Membuat gambar...', 'info');
        
        html2canvas(smsPreview, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
        }).then(canvas => {
            const format = formatSelect.value;
            const quality = parseFloat(qualityInput.value);
            
            const imageData = canvas.toDataURL(`image/${format}`, quality);
            generatedImage.src = imageData;
            
            // Enable download button
            downloadImageBtn.disabled = false;
            downloadImageBtn.onclick = () => downloadImage(imageData, format);
            
            showStatus('Gambar berhasil dibuat!', 'success');
        }).catch(error => {
            console.error('Error generating image:', error);
            showStatus('Gagal membuat gambar: ' + error.message, 'error');
        });
    }
    
    // Download image
    function downloadImage(imageData, format) {
        const link = document.createElement('a');
        link.download = `sms-${senderInput.value.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${format}`;
        link.href = imageData;
        link.click();
        
        showStatus('Gambar berhasil diunduh!', 'success');
    }
    
    // Show status message
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 3000);
    }
    
    // Event listeners
    updatePreviewBtn.addEventListener('click', updatePreview);
    resetValuesBtn.addEventListener('click', resetToDefault);
    generateApiBtn.addEventListener('click', generateApiUrl);
    copyUrlBtn.addEventListener('click', copyUrlToClipboard);
    testApiBtn.addEventListener('click', testApi);
    generateImageBtn.addEventListener('click', generateImage);
    
    // Auto-update preview when inputs change
    [senderInput, messageInput, dateInput, timeInput].forEach(input => {
        input.addEventListener('input', updatePreview);
    });
    
    // Disable quality input when format is PNG
    formatSelect.addEventListener('change', function() {
        qualityInput.disabled = this.value === 'png';
    });
    
    // Initialize
    updatePreview();
    qualityInput.disabled = formatSelect.value === 'png';
});
