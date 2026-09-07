pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

let pdfBytesBuffer = null;
let pdfPageHeight = 0;
let pdfPageWidth = 0;
let scaleRatio = 1;
let cutPositionsY = [];

const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('pdf-canvas');
const overlay = document.getElementById('overlay');
const btnProcess = document.getElementById('btn-process');
const btnReset = document.getElementById('btn-reset');
const instructionBar = document.getElementById('instruction-bar');

// 1. Cargar y visualizar el PDF
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== 'application/pdf') return;

  pdfBytesBuffer = await file.arrayBuffer();
  
  const pdfDoc = await pdfjsLib.getDocument({ data: pdfBytesBuffer }).promise;
  const page = await pdfDoc.getPage(1);

  const viewportUnscaled = page.getViewport({ scale: 1.0 });
  pdfPageWidth = viewportUnscaled.width;
  pdfPageHeight = viewportUnscaled.height;

  const renderWidth = Math.min(600, window.innerWidth - 40);
  scaleRatio = renderWidth / pdfPageWidth;
  const viewport = page.getViewport({ scale: scaleRatio });

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  overlay.style.width = `${viewport.width}px`;
  overlay.style.height = `${viewport.height}px`;

  const renderContext = {
    canvasContext: canvas.getContext('2d'),
    viewport: viewport
  };
  
  await page.render(renderContext).promise;
  
  resetCuts();
  btnProcess.disabled = false;
  btnReset.disabled = false;
  instructionBar.innerText = 'Haz clic en la tirilla sobre las zonas en blanco para definir los puntos de corte.';
});

// 2. Capturar clics para agregar líneas
overlay.addEventListener('click', (e) => {
  const rect = overlay.getBoundingClientRect();
  const clickYScreen = e.clientY - rect.top;
  const clickYPdf = clickYScreen / scaleRatio;

  if (!cutPositionsY.includes(clickYPdf)) {
    cutPositionsY.push(clickYPdf);
    cutPositionsY.sort((a, b) => a - b);
    renderCutLines();
  }
});

function renderCutLines() {
  overlay.innerHTML = '';
  cutPositionsY.forEach(yPdf => {
    const yScreen = yPdf * scaleRatio;
    const line = document.createElement('div');
    line.className = 'cut-line';
    line.style.top = `${yScreen}px`;
    overlay.appendChild(line);
  });
}

function resetCuts() {
  cutPositionsY = [];
  overlay.innerHTML = '';
}

btnReset.addEventListener('click', resetCuts);

// 3. Procesar cortes usando CropBox (Solución exacta)
btnProcess.addEventListener('click', async () => {
  if (!pdfBytesBuffer) return;

  const { PDFDocument, PageSizes } = PDFLib;
  const originalPdf = await PDFDocument.load(pdfBytesBuffer);
  const newPdf = await PDFDocument.create();

  // Definir todos los cortes desde la parte superior (0) hasta el final (pdfPageHeight)
  const cuts = [0, ...cutPositionsY, pdfPageHeight];

  for (let i = 0; i < cuts.length - 1; i++) {
    const yTop = cuts[i];
    const yBottom = cuts[i + 1];
    const segmentHeight = yBottom - yTop;

    if (segmentHeight <= 5) continue; // Ignorar clics accidentales pegados

    // Copiar la página original para este segmento específico
    const [copiedPage] = await newPdf.copyPages(originalPdf, [0]);

    // OJO: En PDF el eje Y empieza ABAJO, por eso invertimos la coordenada
    const lowerLeftY = pdfPageHeight - yBottom;
    const upperRightY = pdfPageHeight - yTop;

    // Aplicar el recorte físico a la página individual
    copiedPage.setCropBox(0, lowerLeftY, pdfPageWidth, segmentHeight);
    copiedPage.setMediaBox(0, lowerLeftY, pdfPageWidth, segmentHeight);

    // Agregar la página recortada al nuevo documento
    newPdf.addPage(copiedPage);
  }

  // Descargar el PDF procesado
  const pdfBytesFinal = await newPdf.save();
  const blob = new Blob([pdfBytesFinal], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tirilla_dividida.pdf';
  link.click();
});