/* ──────────────────────────────────────────────
   HITSS Tickets — Módulo Escáner OCR en la Nube (OCR.Space)
   Motor Oficial OCR.Space Cloud API
   ────────────────────────────────────────────── */

let cropperSimple = null;

// Clave principal predeterminada para OCR.Space (Gestionada internamente, oculta)
const DEFAULT_OCR_KEY = 'K82699721188957';
const BACKUP_OCR_KEY = 'K81133870688957';

function getActiveApiKey() {
    return DEFAULT_OCR_KEY;
}

document.addEventListener('DOMContentLoaded', () => {
    initOCRSimpleListeners();
});

function initOCRSimpleListeners() {
    const fileInput = document.getElementById('fileInputOCR');
    if (fileInput) fileInput.addEventListener('change', handleFileSelectOCR);

    // Recalcular dimensiones de Cropper cuando cambia el zoom del navegador
    window.addEventListener('resize', () => {
        if (cropperSimple) {
            cropperSimple.resize();
        }
    });

    // Pegado global Ctrl + V
    window.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                const blob = item.getAsFile();
                loadImageBlobOCR(blob);
                if (typeof showToast === 'function') showToast('¡Imagen cargada!');
                break;
            }
        }
    });

    const btnReset = document.getElementById('btnResetCropOCR');
    if (btnReset) btnReset.addEventListener('click', () => cropperSimple && cropperSimple.reset());

    const btnMove = document.getElementById('btnMoveModeOCR');
    if (btnMove) btnMove.addEventListener('click', setMoveModeOCR);

    const btnCrop = document.getElementById('btnCropModeOCR');
    if (btnCrop) btnCrop.addEventListener('click', setCropModeOCR);

    const btnZoomIn = document.getElementById('btnZoomInOCR');
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => cropperSimple && cropperSimple.zoom(0.15));

    const btnZoomOut = document.getElementById('btnZoomOutOCR');
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => cropperSimple && cropperSimple.zoom(-0.15));

    const btnScan = document.getElementById('btnExtractTextOCR');
    if (btnScan) btnScan.addEventListener('click', processOCRSimple);
}

function setMoveModeOCR() {
    if (cropperSimple) cropperSimple.setDragMode('move');
}

function setCropModeOCR() {
    if (cropperSimple) cropperSimple.setDragMode('crop');
}

function handleFileSelectOCR(e) {
    if (e.target.files && e.target.files[0]) {
        loadImageBlobOCR(e.target.files[0]);
    }
}

function loadImageBlobOCR(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        initCropperOCR(e.target.result);
    };
    reader.readAsDataURL(file);
}

function initCropperOCR(imageSrc) {
    const dropzone = document.getElementById('dropzoneOCR');
    const wrapper = document.getElementById('cropperWrapperOCR');
    const toolbar = document.getElementById('cropperToolbarOCR');
    const img = document.getElementById('imageToCropOCR');

    if (dropzone) dropzone.classList.add('hidden');
    if (wrapper) wrapper.classList.remove('hidden');
    if (toolbar) toolbar.classList.remove('hidden');

    if (cropperSimple) {
        cropperSimple.destroy();
        cropperSimple = null;
    }

    img.src = imageSrc;
    cropperSimple = new Cropper(img, {
        viewMode: 0, // Permite mover la imagen libremente
        dragMode: 'crop', // Clic izquierdo subraya por defecto
        autoCropArea: 0.95,
        responsive: true,
        background: false,
        zoomOnWheel: true,
        toggleDragModeOnDblclick: false,
        ready() {
            const btnScan = document.getElementById('btnExtractTextOCR');
            if (btnScan) btnScan.disabled = false;

            // Configurar desplazamiento fluido con Clic Derecho
            const container = wrapper.querySelector('.cropper-container');
            if (container && !container.dataset.mouseBound) {
                container.dataset.mouseBound = "true";

                let isRightDrag = false;
                let startX = 0;
                let startY = 0;

                container.addEventListener('contextmenu', (e) => e.preventDefault());

                container.addEventListener('mousedown', (e) => {
                    if (!cropperSimple) return;
                    if (e.button === 2) { // Clic Derecho
                        e.preventDefault();
                        e.stopPropagation();
                        isRightDrag = true;
                        startX = e.clientX;
                        startY = e.clientY;
                        container.style.cursor = 'grabbing';
                    }
                });

                window.addEventListener('mousemove', (e) => {
                    if (isRightDrag && cropperSimple) {
                        e.preventDefault();
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;
                        startX = e.clientX;
                        startY = e.clientY;
                        cropperSimple.move(dx, dy);
                    }
                });

                window.addEventListener('mouseup', (e) => {
                    if (isRightDrag) {
                        isRightDrag = false;
                        if (container) container.style.cursor = 'default';
                    }
                });
            }
        }
    });
}

function clearOCRImage() {
    if (cropperSimple) {
        cropperSimple.destroy();
        cropperSimple = null;
    }
    const dropzone = document.getElementById('dropzoneOCR');
    const wrapper = document.getElementById('cropperWrapperOCR');
    const toolbar = document.getElementById('cropperToolbarOCR');
    const img = document.getElementById('imageToCropOCR');
    const output = document.getElementById('ocrOutputSimple');
    const fileInput = document.getElementById('fileInputOCR');

    if (img) img.src = '';
    if (output) output.value = '';
    if (fileInput) fileInput.value = '';

    if (wrapper) wrapper.classList.add('hidden');
    if (toolbar) toolbar.classList.add('hidden');
    if (dropzone) dropzone.classList.remove('hidden');

    if (typeof showToast === 'function') showToast('Imagen eliminada');
}

async function queryOCRSpaceAPI(dataUrl, apiKey, engine = '1') {
    const formData = new FormData();
    formData.append('base64Image', dataUrl);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', engine);
    formData.append('scale', 'true');
    formData.append('apikey', apiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    try {
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
            headers: { 'apikey': apiKey },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 503) {
                throw new Error('503: Servidor de OCR.Space temporalmente saturado.');
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();

        if (json.IsErroredOnProcessing) {
            const errMsg = (json.ErrorMessage && json.ErrorMessage.length > 0) ? json.ErrorMessage[0] : '';
            throw new Error(errMsg || 'Error en procesamiento de OCR.Space');
        }

        return (json.ParsedResults && json.ParsedResults.length > 0) ? (json.ParsedResults[0].ParsedText || '') : '';
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

async function processCloudOCRSimple(croppedCanvas) {
    const maxDim = 1200;
    let finalCanvas = croppedCanvas;
    if (croppedCanvas.width > maxDim || croppedCanvas.height > maxDim) {
        const scale = maxDim / Math.max(croppedCanvas.width, croppedCanvas.height);
        const resized = document.createElement('canvas');
        resized.width = Math.round(croppedCanvas.width * scale);
        resized.height = Math.round(croppedCanvas.height * scale);
        const ctx = resized.getContext('2d');
        ctx.drawImage(croppedCanvas, 0, 0, resized.width, resized.height);
        finalCanvas = resized;
    }

    const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.85);

    // Lista de claves a intentar internamente
    const primaryKey = getActiveApiKey();
    const keysToTry = [primaryKey];
    if (primaryKey !== BACKUP_OCR_KEY) {
        keysToTry.push(BACKUP_OCR_KEY);
    }

    let lastError = null;

    for (const key of keysToTry) {
        try {
            const text = await queryOCRSpaceAPI(dataUrl, key, '1');
            return text;
        } catch (err) {
            console.warn(`Intento con clave ${key} falló:`, err.message);
            lastError = err;
            // Si el servidor está saturado (503), no insistir innecesariamente
            if (err.message.includes('503')) {
                break;
            }
        }
    }

    throw lastError || new Error('No se pudo completar el escaneo con OCR.Space.');
}

async function processOCRSimple() {
    if (!cropperSimple) return;
    
    let croppedCanvas = cropperSimple.getCroppedCanvas();
    if (!croppedCanvas) {
        cropperSimple.crop();
        croppedCanvas = cropperSimple.getCroppedCanvas();
    }
    
    if (!croppedCanvas) {
        alert('No se pudo obtener el recuadro de la imagen.');
        return;
    }

    const btnScan = document.getElementById('btnExtractTextOCR');
    const output = document.getElementById('ocrOutputSimple');

    if (btnScan) {
        btnScan.disabled = true;
        btnScan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Escaneando en OCR.Space...';
    }

    try {
        const rawText = await processCloudOCRSimple(croppedCanvas);
        const cleanedText = (rawText || '').trim();

        if (output) output.value = cleanedText;

        if (cleanedText.length > 0) {
            if (typeof showToast === 'function') showToast('¡Texto escaneado con OCR.Space!');
        } else {
            alert('No se detectó texto en el recorte. Asegúrate de subrayar la zona deseada con el ratón.');
        }

    } catch (err) {
        console.error('Error en escáner OCR.Space:', err);
        const msg = err.message || '';

        if (msg.includes('503') || msg.includes('saturado') || msg.includes('overloaded')) {
            alert(
                '⚠️ Servidores de OCR.Space temporalmente saturados (Error 503).\n\n' +
                'Los servidores compartidos de OCR.Space están recibiendo un volumen alto de tráfico en este momento.\n\n' +
                'Es una condición temporal de la nube de OCR.Space. Por favor reintenta en un par de minutos cuando baje la congestión del servicio.'
            );
        } else if (msg.includes('abort') || msg.includes('timeout')) {
            alert('⏱️ La conexión con OCR.Space tardó demasiado. Por favor verifica tu red y reintenta en unos instantes.');
        } else {
            alert('Error en escáner OCR.Space: ' + msg);
        }
    } finally {
        if (btnScan) {
            btnScan.disabled = false;
            btnScan.innerHTML = '<i class="fa-solid fa-bolt"></i> Escanear Recorte';
        }
    }
}

function copyOCRResultText() {
    const output = document.getElementById('ocrOutputSimple');
    if (!output || !output.value) {
        alert('No hay texto escaneado para copiar.');
        return;
    }

    const text = output.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showToast === 'function') showToast('¡Texto escaneado copiado!');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            if (typeof showToast === 'function') showToast('¡Texto escaneado copiado!');
        });
    } else {
        output.select();
        document.execCommand('copy');
        if (typeof showToast === 'function') showToast('¡Texto escaneado copiado!');
    }
}
