/* ════════════════════════════════════════════════════════════════
   HITSS Tickets — Módulo Escáner OCR V1.1
   100% Local (Tesseract.js SIMD WebAssembly) + Soporte Nube Opcional
   + Captura y Escaneo Directo de Imágenes de Laraigo / Página Web
   + Autocompletado Inteligente de SOT, MAC, Serial, Modelo y Tecnología
   ════════════════════════════════════════════════════════════════ */

let cropperSimple = null;
let ocrEngineMode = 'local'; // 'local' (predeterminado offline) o 'cloud' (OCR.Space)
let tesseractWorker = null;
let lastDetectedData = null;

// Claves de respaldo para OCR.Space Cloud
const DEFAULT_OCR_KEY = 'K82699721188957';
const BACKUP_OCR_KEY = 'K81133870688957';

document.addEventListener('DOMContentLoaded', () => {
    initOCRSimpleListeners();
    initPageScanBridge();
});

function initOCRSimpleListeners() {
    const fileInput = document.getElementById('fileInputOCR');
    if (fileInput) fileInput.addEventListener('change', handleFileSelectOCR);

    window.addEventListener('resize', () => {
        if (cropperSimple) cropperSimple.resize();
    });

    // Pegado directo global con Ctrl + V
    window.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                const blob = item.getAsFile();
                loadImageBlobOCR(blob);
                if (typeof showToast === 'function') showToast('📸 Imagen pegada lista');
                break;
            }
        }
    });

    // Botón Escanear y Llenar Datos
    const btnScan = document.getElementById('btnExtractTextOCR');
    if (btnScan) btnScan.addEventListener('click', processOCRSimple);

    // Botones de Selector de Motor OCR (Local vs Nube)
    const btnLocal = document.getElementById('btnEngineLocal');
    const btnCloud = document.getElementById('btnEngineCloud');

    if (btnLocal && btnCloud) {
        btnLocal.addEventListener('click', () => {
            ocrEngineMode = 'local';
            btnLocal.classList.add('active');
            btnCloud.classList.remove('active');
            if (typeof showToast === 'function') showToast('💻 Motor local Tesseract activado (Sin Internet)');
        });

        btnCloud.addEventListener('click', () => {
            ocrEngineMode = 'cloud';
            btnCloud.classList.add('active');
            btnLocal.classList.remove('active');
            if (typeof showToast === 'function') showToast('☁️ Motor OCR.Space Nube activado');
        });
    }

    // Botón Escanear Imagen de la Página
    const btnScanPage = document.getElementById('btnScanPageImg');
    if (btnScanPage) {
        btnScanPage.addEventListener('click', requestScanPageImage);
    }

    // Botón Elegir Imagen con Clic
    const btnPickPage = document.getElementById('btnPickPageImg');
    if (btnPickPage) {
        btnPickPage.addEventListener('click', requestPickPageImage);
    }

    // Botón Re-aplicar datos detectados
    const btnReapply = document.getElementById('btnReapplyData');
    if (btnReapply) {
        btnReapply.addEventListener('click', () => {
            if (lastDetectedData) {
                applyParsedDataToTicket(lastDetectedData);
            } else {
                if (typeof showToast === 'function') showToast('⚠️ No hay datos recientes para aplicar');
            }
        });
    }
}

// ════════════════════════════════════════════════════════════════
// COMUNICACIÓN BIDIRECCIONAL CON LA PÁGINA (LARAIGO)
// ════════════════════════════════════════════════════════════════
function initPageScanBridge() {
    // Escuchar cuando content.js envíe una imagen capturada de la página
    window.addEventListener('message', (event) => {
        if (!event.data || typeof event.data !== 'object') return;

        if (event.data.type === 'HITSS_LOAD_OCR_IMAGE') {
            const { dataUrl, autoScan } = event.data;
            if (dataUrl) {
                initCropperOCR(dataUrl);
                if (typeof showToast === 'function') showToast('📸 Imagen cargada desde la página');

                if (autoScan) {
                    setTimeout(() => {
                        processOCRSimple();
                    }, 500);
                }
            }
        }
    });

    // Compatibilidad para modo popup (cuando la extensión no está en iframe)
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((message) => {
            if (message && message.type === 'HITSS_LOAD_OCR_IMAGE' && message.dataUrl) {
                initCropperOCR(message.dataUrl);
                if (message.autoScan) {
                    setTimeout(() => processOCRSimple(), 500);
                }
            }
        });
    }
}

function requestScanPageImage() {
    // Si estamos dentro del iframe en Laraigo
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'HITSS_SCAN_PAGE_IMAGE' }, '*');
    } else if (chrome && chrome.tabs && chrome.tabs.query) {
        // Si estamos en popup de extensión
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'SCAN_ACTIVE_PAGE_IMAGE' }, (res) => {
                    if (res && res.status === 'ok' && res.dataUrl) {
                        initCropperOCR(res.dataUrl);
                        setTimeout(() => processOCRSimple(), 500);
                    } else {
                        alert('No se detectó imagen abierta grande en la pestaña activa.');
                    }
                });
            }
        });
    }
}

function requestPickPageImage() {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'HITSS_START_PICKER' }, '*');
    } else if (chrome && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'START_IMAGE_PICKER' });
            }
        });
    }
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
        viewMode: 0,
        dragMode: 'crop',
        autoCropArea: 0.96,
        responsive: true,
        background: false,
        zoomOnWheel: true,
        toggleDragModeOnDblclick: false,
        ready() {
            const btnScan = document.getElementById('btnExtractTextOCR');
            if (btnScan) btnScan.disabled = false;

            // Desplazamiento fluido con Clic Derecho
            const container = wrapper.querySelector('.cropper-container');
            if (container && !container.dataset.mouseBound) {
                container.dataset.mouseBound = "true";

                let isRightDrag = false;
                let startX = 0;
                let startY = 0;

                container.addEventListener('contextmenu', (e) => e.preventDefault());

                container.addEventListener('mousedown', (e) => {
                    if (!cropperSimple) return;
                    if (e.button === 2) {
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

                window.addEventListener('mouseup', () => {
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
    const detectedCard = document.getElementById('ocrDetectedCard');
    const progressWrap = document.getElementById('ocrProgressWrap');

    if (img) img.src = '';
    if (output) output.value = '';
    if (fileInput) fileInput.value = '';

    if (wrapper) wrapper.classList.add('hidden');
    if (toolbar) toolbar.classList.add('hidden');
    if (detectedCard) detectedCard.classList.add('hidden');
    if (progressWrap) progressWrap.classList.add('hidden');
    if (dropzone) dropzone.classList.remove('hidden');

    if (typeof showToast === 'function') showToast('Imagen eliminada');
}

// ════════════════════════════════════════════════════════════════
// MOTOR LOCAL TESSERACT.JS (100% OFFLINE, CERO INTERNET)
// ════════════════════════════════════════════════════════════════
function updateOCRProgress(percent, label) {
    const wrap = document.getElementById('ocrProgressWrap');
    const bar = document.getElementById('ocrProgressBar');
    const pct = document.getElementById('ocrProgressPct');
    const txt = document.getElementById('ocrProgressText');

    if (wrap) wrap.classList.remove('hidden');
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    if (pct) pct.textContent = `${percent}%`;
    if (txt && label) txt.textContent = label;
}

function hideOCRProgress() {
    const wrap = document.getElementById('ocrProgressWrap');
    if (wrap) wrap.classList.add('hidden');
}

async function getTesseractWorker() {
    if (tesseractWorker) return tesseractWorker;

    updateOCRProgress(15, 'Cargando motor local Tesseract.js...');

    if (typeof Tesseract === 'undefined') {
        throw new Error('Tesseract.js no está disponible en la página.');
    }

    const workerPath = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('lib/worker.min.js')
        : 'lib/worker.min.js';

    const corePath = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('lib/tesseract-core-simd.wasm.js')
        : 'lib/tesseract-core-simd.wasm.js';

    const langPath = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('lib/')
        : 'lib/';

    const worker = await Tesseract.createWorker({
        workerPath,
        corePath,
        langPath,
        logger: (m) => {
            if (m.status === 'recognizing text') {
                const p = Math.round((m.progress || 0) * 100);
                updateOCRProgress(p, `Reconociendo caracteres (${p}%)...`);
            } else if (m.status === 'loading language traineddata') {
                updateOCRProgress(40, 'Cargando modelos español e inglés...');
            } else if (m.status === 'initializing api') {
                updateOCRProgress(70, 'Optimizando motor OCR...');
            }
        }
    });

    await worker.loadLanguage('spa+eng');
    await worker.initialize('spa+eng');

    tesseractWorker = worker;
    return tesseractWorker;
}

// Preprocesamiento de imagen en canvas para maximizar precisión
function preprocessCanvasForOCR(sourceCanvas) {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;

    // Escalar imágenes pequeñas para mejor lectura de números y MACs
    const scale = (w < 1200 && h < 1200) ? Math.min(2.0, 1400 / Math.max(w, h)) : 1.0;
    const targetW = Math.round(w * scale);
    const targetH = Math.round(h * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

    // Conversión a escala de grises y estiramiento de contraste
    try {
        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            let enhanced = (gray - 128) * 1.3 + 128;
            if (enhanced < 0) enhanced = 0;
            if (enhanced > 255) enhanced = 255;
            d[i] = enhanced;
            d[i + 1] = enhanced;
            d[i + 2] = enhanced;
        }
        ctx.putImageData(imgData, 0, 0);
    } catch (e) {
        console.warn('Filtro de contraste ignorado por seguridad:', e);
    }

    return canvas;
}

async function processLocalOCR(croppedCanvas) {
    updateOCRProgress(10, 'Iniciando reconocimiento local...');
    const processedCanvas = preprocessCanvasForOCR(croppedCanvas);
    const worker = await getTesseractWorker();

    updateOCRProgress(30, 'Extrayendo texto localmente...');
    const res = await worker.recognize(processedCanvas);

    updateOCRProgress(100, '¡Escaneo completado!');
    setTimeout(hideOCRProgress, 1200);

    return (res && res.data && res.data.text) ? res.data.text : '';
}

// ════════════════════════════════════════════════════════════════
// MOTOR OPCIONAL EN NUBE (OCR.SPACE)
// ════════════════════════════════════════════════════════════════
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
    const keysToTry = [DEFAULT_OCR_KEY, BACKUP_OCR_KEY];
    let lastError = null;

    for (const key of keysToTry) {
        try {
            return await queryOCRSpaceAPI(dataUrl, key, '1');
        } catch (err) {
            console.warn(`Intento de nube con clave ${key} falló:`, err.message);
            lastError = err;
            if (err.message.includes('503')) break;
        }
    }

    throw lastError || new Error('No se pudo completar el escaneo en la nube.');
}

// ════════════════════════════════════════════════════════════════
// PARSER INTELIGENTE DE HARDWARE Y DATOS DE TICKET
// ════════════════════════════════════════════════════════════════
function parseHardwareAndTicketData(rawText) {
    if (!rawText) return null;
    const text = rawText.toUpperCase();
    const result = {
        sot: null,
        mac: null,
        serial: null,
        model: null,
        tech: null
    };

    // 1. Detectar Número de SOT (8 a 10 dígitos)
    // Patrón con prefijos habituales: SOT:, OT:, ORDEN:, NRO SOT:
    const sotPrefixMatch = text.match(/(?:SOT|OT|ORDEN|NRO\.?\s*SOT|N[UÚ]MERO)[:\s#]*([0-9]{7,10})\b/);
    if (sotPrefixMatch) {
        result.sot = sotPrefixMatch[1];
    } else {
        // Standalone número de 8 dígitos típico en Claro (ej. 10293847 o 10xxxxxx)
        const sotStandMatch = text.match(/\b(10[0-9]{6,8})\b/) || text.match(/\b([0-9]{8})\b/);
        if (sotStandMatch) {
            result.sot = sotStandMatch[1];
        }
    }

    // 2. Detectar MAC Address (Formato XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX o 12 hex seguidos)
    const formattedMacMatch = text.match(/\b([0-9A-F]{2}[:-][0-9A-F]{2}[:-][0-9A-F]{2}[:-][0-9A-F]{2}[:-][0-9A-F]{2}[:-][0-9A-F]{2})\b/);
    if (formattedMacMatch) {
        result.mac = formattedMacMatch[1].replace(/[-]/g, ':');
    } else {
        // Cisco dot notation: xxxx.xxxx.xxxx
        const ciscoMacMatch = text.match(/\b([0-9A-F]{4}\.[0-9A-F]{4}\.[0-9A-F]{4})\b/);
        if (ciscoMacMatch) {
            const hex = ciscoMacMatch[1].replace(/\./g, '');
            result.mac = hex.match(/.{1,2}/g).join(':');
        } else {
            // Raw 12 hex seguidos con etiqueta previa (MAC:, CMAC:, WAN MAC:, etc.)
            const rawLabelMacMatch = text.match(/(?:MAC|CMAC|WAN|LAN|ID)[:\s-]*([0-9A-F]{12})\b/);
            if (rawLabelMacMatch) {
                result.mac = rawLabelMacMatch[1].match(/.{1,2}/g).join(':');
            } else {
                // Standalone 12 hex que contenga al menos una letra A-F para no confundirlo con fechas o números
                const rawStandaloneMac = text.match(/\b([0-9A-F]{12})\b/);
                if (rawStandaloneMac && /[A-F]/.test(rawStandaloneMac[1])) {
                    result.mac = rawStandaloneMac[1].match(/.{1,2}/g).join(':');
                }
            }
        }
    }

    // 3. Detectar Serial / GPON SN (HWTC, 48575443, ZTEG, ZXV10, ALCL, FHTT, etc.)
    const gponMatch = text.match(/\b((?:HWTC|48575443|ZTEG|ZXV10|ALCL|FHTT|MSTC|CMDC)[0-9A-Z]{6,14})\b/);
    if (gponMatch) {
        result.serial = gponMatch[1];
    } else {
        // Serial etiquetado: S/N: xxxxx o SN: xxxxx
        const snLabelMatch = text.match(/(?:S\/N|SN|SERIAL)[:\s#]*([0-9A-Z]{8,18})\b/);
        if (snLabelMatch) {
            result.serial = snLabelMatch[1];
        }
    }

    // 4. Detectar Modelo de Equipo (Routers / ONTs / Decos)
    const knownModels = [
        // Huawei
        'HG8145V5', 'HG8245W5', 'HG8245H', 'EG8145V5', 'HG8247H', 'HG8245Q2',
        // ZTE
        'F6600P', 'F670L', 'F680', 'F660', 'B866V2', 'ZXHN F6600P',
        // Sagemcom
        'FAST5670', 'FAST5657', 'FAST3890',
        // Technicolor
        'CGA2121', 'DPC3928', 'TC7110', 'DPC3925',
        // Arris
        'TG2482', 'TG862', 'TG1652', 'CM8200', 'DG2470',
        // Decos
        'IP952', 'DV8235', 'SEI800', 'SEI830', 'KAON', 'ZXV10'
    ];

    for (const m of knownModels) {
        const regex = new RegExp('\\b' + m.replace(/\s+/g, '\\s*') + '\\b', 'i');
        if (regex.test(text)) {
            result.model = m;
            break;
        }
    }

    // 5. Detectar Tecnología (FTTH vs HFC)
    if (result.model) {
        const ftthModels = ['HG8145V5', 'HG8245W5', 'HG8245H', 'EG8145V5', 'HG8247H', 'F6600P', 'F670L', 'F680', 'F660', 'FAST5670', 'FAST5657'];
        const hfcModels = ['CGA2121', 'DPC3928', 'TC7110', 'TG2482', 'TG862', 'TG1652', 'CM8200'];

        if (ftthModels.includes(result.model)) {
            result.tech = 'ftth';
        } else if (hfcModels.includes(result.model)) {
            result.tech = 'hfc';
        }
    }

    if (!result.tech) {
        if (/FTTH|GPON|FIBRA|PON|OLT/.test(text)) {
            result.tech = 'ftth';
        } else if (/HFC|DOCSIS|CMTS|CMAC|COAXIAL|MTA/.test(text)) {
            result.tech = 'hfc';
        }
    }

    return result;
}

// ════════════════════════════════════════════════════════════════
// AUTOCOMPLETADO AUTOMÁTICO EN LA SOT Y PLANTILLA
// ════════════════════════════════════════════════════════════════
function applyParsedDataToTicket(data) {
    if (!data) return;
    lastDetectedData = data;
    const appliedList = [];

    // 1. Aplicar Número de SOT
    if (data.sot) {
        const sotInput = document.getElementById('seccionNumero');
        if (sotInput) {
            sotInput.value = data.sot;
            if (typeof window.actualizarNumero === 'function') {
                window.actualizarNumero(data.sot);
            }
            sotInput.dispatchEvent(new Event('input', { bubbles: true }));
            appliedList.push(`SOT: ${data.sot}`);
        }
    }

    // 2. Aplicar MAC Address
    if (data.mac) {
        const macInput = document.getElementById('macInput');
        if (macInput) {
            const rawClean = data.mac.replace(/[^A-Fa-f0-9]/g, '').slice(0, 12).toUpperCase();
            macInput.value = rawClean;
            if (typeof window.convertirMAC === 'function') {
                window.convertirMAC();
            }
            macInput.dispatchEvent(new Event('input', { bubbles: true }));
            appliedList.push(`MAC: ${data.mac}`);
        }
    }

    // 3. Aplicar Tecnología (FTTH / HFC)
    if (data.tech) {
        if (typeof window.setTech === 'function') {
            window.setTech(data.tech, true);
            appliedList.push(`Tec: ${data.tech.toUpperCase()}`);
        }
    }

    // 4. Aplicar Modelo de Equipo
    if (data.model) {
        const selModel = document.getElementById('modeloEquipo');
        if (selModel) {
            let matched = false;
            for (let i = 0; i < selModel.options.length; i++) {
                const optVal = selModel.options[i].value.toUpperCase();
                if (optVal && (optVal.includes(data.model) || data.model.includes(optVal))) {
                    selModel.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                selModel.value = '__manual__';
                const manIn = document.getElementById('modeloManual');
                if (manIn) {
                    manIn.value = data.model;
                    manIn.style.display = 'block';
                }
            }
            selModel.dispatchEvent(new Event('change', { bubbles: true }));
            appliedList.push(`Mod: ${data.model}`);
        }
    }

    // 5. Aplicar Serial si existe campo de serial deco o GPON
    if (data.serial) {
        const decoEl = document.getElementById('serieDeco');
        if (decoEl) {
            decoEl.value = data.serial;
            decoEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        appliedList.push(`SN: ${data.serial}`);
    }

    // 6. Recalcular y guardar la plantilla actual
    if (typeof window.guardarFormActual === 'function') {
        window.guardarFormActual();
    }
    if (typeof window.generarPlantilla === 'function') {
        window.generarPlantilla();
    }

    // 7. Mostrar chips de datos detectados
    renderDetectedChips(data);

    if (appliedList.length > 0) {
        if (typeof showToast === 'function') {
            showToast(`✨ ¡${appliedList.length} datos aplicados a la SOT!`);
        }
    }
}

function renderDetectedChips(data) {
    const card = document.getElementById('ocrDetectedCard');
    const grid = document.getElementById('ocrChipsGrid');
    if (!card || !grid) return;

    grid.innerHTML = '';
    let count = 0;

    const addChip = (label, value) => {
        if (!value) return;
        count++;
        const chip = document.createElement('div');
        chip.className = 'ocr-chip';
        chip.innerHTML = `<span class="ocr-chip-lbl">${label}:</span> <span class="ocr-chip-val">${value}</span>`;
        grid.appendChild(chip);
    };

    addChip('SOT', data.sot);
    addChip('MAC', data.mac);
    addChip('SN', data.serial);
    addChip('Modelo', data.model);
    addChip('Tecnología', data.tech ? data.tech.toUpperCase() : null);

    if (count > 0) {
        card.classList.remove('hidden');
    } else {
        card.classList.add('hidden');
    }
}

// ════════════════════════════════════════════════════════════════
// EJECUCIÓN PRINCIPAL DEL ESCANEO OCR
// ════════════════════════════════════════════════════════════════
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
        btnScan.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Escaneando (${ocrEngineMode === 'local' ? 'Local' : 'Nube'})...`;
    }

    try {
        let rawText = '';

        if (ocrEngineMode === 'local') {
            rawText = await processLocalOCR(croppedCanvas);
        } else {
            rawText = await processCloudOCRSimple(croppedCanvas);
        }

        const cleanedText = (rawText || '').trim();

        if (output) output.value = cleanedText;

        if (cleanedText.length > 0) {
            // Analizar parámetros automáticamente
            const parsed = parseHardwareAndTicketData(cleanedText);
            if (parsed && (parsed.sot || parsed.mac || parsed.serial || parsed.model || parsed.tech)) {
                applyParsedDataToTicket(parsed);
            } else {
                if (typeof showToast === 'function') showToast('¡Texto escaneado! Copia lo que necesites.');
            }
        } else {
            alert('No se detectó texto en el recorte. Asegúrate de subrayar la zona deseada con el ratón.');
        }

    } catch (err) {
        console.error('Error en escáner OCR:', err);
        hideOCRProgress();

        // Si el motor local falla por cualquier razón, sugerir o conmutar automáticamente a la nube
        if (ocrEngineMode === 'local') {
            console.warn('Fallo motor local, intentando con nube OCR.Space como respaldo...');
            try {
                if (btnScan) btnScan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reintentando en nube...';
                const cloudText = await processCloudOCRSimple(croppedCanvas);
                const cleaned = (cloudText || '').trim();
                if (output) output.value = cleaned;
                const parsed = parseHardwareAndTicketData(cleaned);
                if (parsed) applyParsedDataToTicket(parsed);
                if (typeof showToast === 'function') showToast('¡Texto escaneado con motor de respaldo!');
                return;
            } catch (cloudErr) {
                console.error('Respaldo en nube también falló:', cloudErr);
            }
        }

        const msg = err.message || '';
        if (msg.includes('503')) {
            alert('⚠️ Servidores de OCR.Space saturados (503). Por favor usa el botón "Local (Sin Internet)".');
        } else {
            alert('Error en escáner: ' + msg);
        }
    } finally {
        if (btnScan) {
            btnScan.disabled = false;
            btnScan.innerHTML = '<i class="fa-solid fa-bolt"></i> Escanear y Llenar Datos';
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
