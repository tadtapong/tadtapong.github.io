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

// --- MODIFIED DOWNLOAD FUNCTION ---
const handleDownload = () => {
    const imgElement = qrcodeContainer.querySelector('img');

    if (!imgElement) {
        alert("Generate a QR code first before downloading.");
        return;
    }

    // Define the border size (padding)
    const borderSize = 20; // 20 pixels of padding on each side
    const originalSize = parseInt(qrSizeSelect.value);
    const newSize = originalSize + borderSize * 2;

    // Create a new canvas
    const canvas = document.createElement('canvas');
    canvas.width = newSize;
    canvas.height = newSize;
    const ctx = canvas.getContext('2d');

    // 1. Fill the canvas with the background color (this creates the border)
    ctx.fillStyle = bgColorInput.value;
    ctx.fillRect(0, 0, newSize, newSize);

    // 2. Draw the QR code image onto the center of the canvas
    ctx.drawImage(imgElement, borderSize, borderSize);

    // 3. Create a download link from the new canvas data
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png'); // Get data URL from the canvas
    link.download = 'qrcode.png';

    // Trigger the download
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