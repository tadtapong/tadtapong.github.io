// DOM Elements (cached)
const qrTextInput = document.getElementById('qrText');
const fgColorInput = document.getElementById('fgColor');
const bgColorInput = document.getElementById('bgColor');
const qrSizeSelect = document.getElementById('qrSize');
const downloadBtn = document.getElementById('downloadBtn');
const qrcodeContainer = document.getElementById('qrcode');

let qrCodeInstance = null;
let lastConfig = { text: '', size: null, fg: '', bg: '' };

// Small debounce utility
const debounce = (fn, wait = 250) => {
    let t = null;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
};

// Validate text - simple check to avoid empty QR codes
const isValidText = (s) => typeof s === 'string' && s.trim().length > 0;

// Build configuration from DOM
const readConfig = () => ({
    text: qrTextInput.value || '',
    size: parseInt(qrSizeSelect.value, 10) || 256,
    fg: fgColorInput.value || '#000000',
    bg: bgColorInput.value || '#FFFFFF'
});

// Create or update the QR code
const renderQRCode = () => {
    const cfg = readConfig();

    if (!isValidText(cfg.text)) {
        qrcodeContainer.innerHTML = '<p style="color:#888">Enter text or URL to generate QR code</p>';
        qrCodeInstance = null;
        lastConfig = cfg;
        downloadBtn.disabled = true;
        return;
    }

    downloadBtn.disabled = false;

    // If an instance exists and only the text changed, use makeCode (faster)
    const onlyTextChanged = qrCodeInstance && lastConfig.size === cfg.size && lastConfig.fg === cfg.fg && lastConfig.bg === cfg.bg;

    if (qrCodeInstance && onlyTextChanged) {
        try {
            // QRCode.js exposes makeCode which updates the code quickly
            if (typeof qrCodeInstance.makeCode === 'function') {
                qrCodeInstance.makeCode(cfg.text);
            } else {
                // Fallback: recreate
                qrcodeContainer.innerHTML = '';
                qrCodeInstance = new QRCode(qrcodeContainer, {
                    text: cfg.text,
                    width: cfg.size,
                    height: cfg.size,
                    colorDark: cfg.fg,
                    colorLight: cfg.bg,
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        } catch (e) {
            console.error('QR update failed, recreating', e);
            qrcodeContainer.innerHTML = '';
            qrCodeInstance = null;
            renderQRCode();
            return;
        }
    } else {
        // Recreate QR with new options
        qrcodeContainer.innerHTML = '';
        qrCodeInstance = new QRCode(qrcodeContainer, {
            text: cfg.text,
            width: cfg.size,
            height: cfg.size,
            colorDark: cfg.fg,
            colorLight: cfg.bg,
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    lastConfig = cfg;
};

// Debounced renderer for input events
const debouncedRender = debounce(renderQRCode, 200);

// Robust download: handle both canvas and img outputs, add padding and background
const handleDownload = async () => {
    const img = qrcodeContainer.querySelector('img');
    const canvas = qrcodeContainer.querySelector('canvas');

    if (!img && !canvas) {
        alert('Please generate a QR code first.');
        return;
    }

    // Padding around QR in pixels
    const padding = 20;
    const bg = (bgColorInput.value || '#FFFFFF');

    const exportCanvas = (w, h, draw) => {
        const out = document.createElement('canvas');
        out.width = w + padding * 2;
        out.height = h + padding * 2;
        const ctx = out.getContext('2d');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, out.width, out.height);
        draw(ctx, padding, padding, w, h);
        return out.toDataURL('image/png');
    };

    let dataUrl;
    if (canvas) {
        dataUrl = exportCanvas(canvas.width, canvas.height, (ctx, x, y, w, h) => {
            ctx.drawImage(canvas, x, y, w, h);
        });
    } else {
        await new Promise((resolve, reject) => {
            if (img.complete && img.naturalWidth !== 0) return resolve();
            img.addEventListener('load', resolve);
            img.addEventListener('error', () => reject(new Error('Image failed to load')));
        });

        const w = img.naturalWidth || lastConfig.size || 256;
        const h = img.naturalHeight || lastConfig.size || 256;
        dataUrl = exportCanvas(w, h, (ctx, x, y) => ctx.drawImage(img, x, y, w, h));
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Event wiring
qrTextInput.addEventListener('input', debouncedRender);
fgColorInput.addEventListener('input', renderQRCode);
bgColorInput.addEventListener('input', renderQRCode);
qrSizeSelect.addEventListener('change', renderQRCode);
downloadBtn.addEventListener('click', handleDownload);

// Initialize
renderQRCode();