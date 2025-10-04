/* Simple QR code generator using Google Chart API */

const textInput = document.getElementById('text');
const sizeInput = document.getElementById('size');
const colorInput = document.getElementById('color');
const bgInput = document.getElementById('bg');
const generateBtn = document.getElementById('generate');
const qrDiv = document.getElementById('qr');

function generateQR() {
  const text = encodeURIComponent(textInput.value.trim() || 'Hello World');
  const size = parseInt(sizeInput.value, 10) || 200;
  const color = colorInput.value.replace('#', '');
  const bg = bgInput.value.replace('#', '');

  const url = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${text}&chco=${color}&chf=bg,s,${bg}`;

  qrDiv.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'QR Code';
  qrDiv.appendChild(img);
}

generateBtn.addEventListener('click', generateQR);
// generate at start
window.addEventListener('DOMContentLoaded', generateQR);