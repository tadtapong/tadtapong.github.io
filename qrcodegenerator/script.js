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

    // Basic validation
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
        correctLevel: QRCode.CorrectLevel.H // High correction level
    });
};

// Function to handle the download
const handleDownload = () => {
    // Find the generated img element
    const imgElement = qrcodeContainer.querySelector('img');

    if (imgElement) {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = imgElement.src;
        link.download = 'qrcode.png';

        // Trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Generate a QR code first before downloading.");
    }
};

// Event Listeners for real-time updates
qrTextInput.addEventListener('input', generateQRCode);
fgColorInput.addEventListener('input', generateQRCode);
bgColorInput.addEventListener('input', generateQRCode);
qrSizeSelect.addEventListener('change', generateQRCode);
downloadBtn.addEventListener('click', handleDownload);

// Initial QR Code generation on page load
generateQRCode();