// DOM Elements
const qrTextInput = document.getElementById('qrText');
const fgColorInput = document.getElementById('fgColor');
const bgColorInput = document.getElementById('bgColor');
const qrSizeSelect = document.getElementById('qrSize');
const downloadBtn = document.getElementById('downloadBtn');
const qrcodeContainer = document.getElementById('qrcode');

let qrCode;

// Function to generate the QR Code
const generateQRCode = () => {
    // Clear the previous QR Code
    qrcodeContainer.innerHTML = '';

    // Get values from the inputs
    const text = qrTextInput.value;
    const size = parseInt(qrSizeSelect.value);
    const fgColor = fgColorInput.value;
    const bgColor = bgColorInput.value;

    if (!text) {
        alert("Please enter some text or a URL.");
        return;
    }

    // Create a new QRCode instance
    qrCode = new QRCode(qrcodeContainer, {
        text: text,
        width: size,
        height: size,
        colorDark: fgColor,
        colorLight: bgColor,
        correctLevel: QRCode.CorrectLevel.H
    });
};

// --- IMPROVED DOWNLOAD FUNCTION ---
const handleDownload = async () => {
    // The QR library may render either an <img> or a <canvas> inside #qrcode.
    const imgElement = qrcodeContainer.querySelector('img');
    const canvasElement = qrcodeContainer.querySelector('canvas');

    if (!imgElement && !canvasElement) {
        alert('Generate a QR code first before downloading.');
        return;
    }

    // Border (padding) around the QR code in pixels
    const borderSize = 20;

    // Helper to export a provided image-like source into a new PNG with background
    const exportToPng = (sourceWidth, sourceHeight, drawCallback) => {
        const newWidth = sourceWidth + borderSize * 2;
        const newHeight = sourceHeight + borderSize * 2;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = newWidth;
        outCanvas.height = newHeight;
        const outCtx = outCanvas.getContext('2d');

        // Fill background explicitly so transparent pixels don't appear black in some viewers
        outCtx.fillStyle = bgColorInput.value || '#FFFFFF';
        outCtx.fillRect(0, 0, newWidth, newHeight);

        // Let caller draw the QR content at (borderSize, borderSize)
        drawCallback(outCtx, borderSize, borderSize, sourceWidth, sourceHeight);

        return outCanvas.toDataURL('image/png');
    };

    let dataUrl;

    if (canvasElement) {
        // If the library produced a canvas, draw it onto our output
        const srcW = canvasElement.width;
        const srcH = canvasElement.height;
        dataUrl = exportToPng(srcW, srcH, (ctx, x, y) => {
            ctx.drawImage(canvasElement, x, y, srcW, srcH);
        });
    } else {
        // If we have an <img>, ensure it's loaded and then draw it at the right size.
        await new Promise((resolve, reject) => {
            if (imgElement.complete && imgElement.naturalWidth !== 0) return resolve();
            imgElement.addEventListener('load', resolve);
            imgElement.addEventListener('error', () => reject(new Error('Failed to load QR image')));
        });

        // Some browsers may scale the displayed image via CSS. Use naturalWidth/naturalHeight.
        const srcW = imgElement.naturalWidth || parseInt(qrSizeSelect.value);
        const srcH = imgElement.naturalHeight || parseInt(qrSizeSelect.value);

        dataUrl = exportToPng(srcW, srcH, (ctx, x, y, w, h) => {
            // Draw the image at its natural pixel size to preserve clarity
            ctx.drawImage(imgElement, x, y, w, h);
        });
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Event Listeners for real-time updates
qrTextInput.addEventListener('input', generateQRCode);
fgColorInput.addEventListener('input', generateQRCode);
bgColorInput.addEventListener('input', generateQRCode);
qrSizeSelect.addEventListener('change', generateQRCode);
downloadBtn.addEventListener('click', handleDownload);

// Initial QR Code generation on page load
generateQRCode();