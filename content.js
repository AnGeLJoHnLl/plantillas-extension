/* ════════════════════════════════════════════════════════════════
   HITSS Tickets — Content Script para Laraigo
   Integración pulcra: Botón flotante, drawer e inserción en chat
   + Captura y Escaneo Directo de Imágenes de la Página (OCR)
   ════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Evitar inyección múltiple
  if (window.__HITSS_LARAIGO_INJECTED__) return;
  window.__HITSS_LARAIGO_INJECTED__ = true;

  const STORAGE_KEY_POS = 'hitss_fab_pos_y';
  const STORAGE_KEY_OPEN = 'hitss_panel_last_open';

  // Crear elementos en el DOM de Laraigo
  function initHITSSIntegration() {
    createFloatingButton();
    createDrawerPanel();
    createToastElement();
    listenMessagesFromIframe();
    setupKeyboardShortcuts();
  }

  // 1. Botón Flotante Disparador (FAB)
  let fabEl = null;
  function createFloatingButton() {
    fabEl = document.createElement('div');
    fabEl.id = 'hitss-laraigo-fab';
    fabEl.innerHTML = `
      <span class="fab-icon">📋</span>
      <span class="fab-text">Plantillas HITSS</span>
      <span class="fab-badge" title="Activo y sincronizado"></span>
    `;

    // Restaurar posición guardada
    const savedY = localStorage.getItem(STORAGE_KEY_POS);
    if (savedY) {
      fabEl.style.bottom = 'auto';
      fabEl.style.top = `${Math.min(Math.max(20, parseInt(savedY, 10)), window.innerHeight - 60)}px`;
    }

    // Eventos de clic y arrastre (Drag)
    let isDragging = false;
    let startY = 0;
    let initialTop = 0;

    fabEl.addEventListener('mousedown', (e) => {
      isDragging = false;
      startY = e.clientY;
      const rect = fabEl.getBoundingClientRect();
      initialTop = rect.top;

      function onMouseMove(moveEvent) {
        if (Math.abs(moveEvent.clientY - startY) > 4) {
          isDragging = true;
          const newTop = Math.min(Math.max(20, initialTop + (moveEvent.clientY - startY)), window.innerHeight - 60);
          fabEl.style.bottom = 'auto';
          fabEl.style.top = `${newTop}px`;
        }
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (isDragging) {
          localStorage.setItem(STORAGE_KEY_POS, fabEl.offsetTop);
        }
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    fabEl.addEventListener('click', (e) => {
      if (isDragging) return;
      toggleDrawer();
    });

    document.body.appendChild(fabEl);
  }

  // 2. Panel Flotante / Drawer con Iframe
  let panelWrapper = null;
  let panelIframe = null;

  function createDrawerPanel() {
    panelWrapper = document.createElement('div');
    panelWrapper.id = 'hitss-laraigo-panel-wrapper';

    const iframeUrl = chrome.runtime.getURL('index.html?mode=laraigo_dock');

    panelWrapper.innerHTML = `
      <div class="hitss-panel-topbar">
        <div class="hitss-panel-title">
          <span>📋 HITSS Tickets & OCR</span>
          <span class="badge-online">Laraigo Conectado</span>
        </div>
        <div class="hitss-panel-controls">
          <button type="button" class="hitss-panel-btn btn-expand" id="hitssBtnExpand" title="Expandir / Reducir ancho">⛶</button>
          <button type="button" class="hitss-panel-btn btn-close" id="hitssBtnClose" title="Minimizar panel (Esc)">✕</button>
        </div>
      </div>
      <iframe id="hitss-laraigo-iframe" src="${iframeUrl}" allow="clipboard-read; clipboard-write" title="Plantillas HITSS"></iframe>
    `;

    document.body.appendChild(panelWrapper);

    panelIframe = document.getElementById('hitss-laraigo-iframe');

    // Botones de control de la barra superior
    const btnClose = panelWrapper.querySelector('#hitssBtnClose');
    if (btnClose) btnClose.addEventListener('click', closeDrawer);

    const btnExpand = panelWrapper.querySelector('#hitssBtnExpand');
    if (btnExpand) {
      btnExpand.addEventListener('click', () => {
        panelWrapper.classList.toggle('is-expanded');
      });
    }

    // Cerrar al pulsar Escape cuando no esté activo el selector de imágenes
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelWrapper.classList.contains('is-open') && !isPickerActive) {
        closeDrawer();
      }
    });
  }

  function toggleDrawer() {
    if (!panelWrapper) return;
    const isOpen = panelWrapper.classList.toggle('is-open');
    if (isOpen) {
      if (panelIframe && panelIframe.contentWindow) {
        panelIframe.contentWindow.focus();
      }
    }
  }

  function openDrawer() {
    if (panelWrapper) panelWrapper.classList.add('is-open');
  }

  function closeDrawer() {
    if (panelWrapper) panelWrapper.classList.remove('is-open');
  }

  // 3. Atajos de Teclado
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl + Shift + P o Alt + P para alternar
      if ((e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) ||
          (e.altKey && (e.key === 'P' || e.key === 'p'))) {
        e.preventDefault();
        toggleDrawer();
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  // 4. CAPTURA INTELIGENTE DE IMÁGENES DE PÁGINA (OCR SCANNER)
  // ════════════════════════════════════════════════════════════════
  let isPickerActive = false;
  let pickerBanner = null;

  function findActiveOrLargestImage() {
    // 1. Prioridad: Buscar imágenes en modales, previsualizaciones, lightboxes o zoom
    const modalSelectors = [
      '[role="dialog"] img',
      '.modal img',
      '.image-preview img',
      '.preview img',
      '.lightbox img',
      '.viewer img',
      '.ant-modal img',
      '.el-dialog img',
      'div[class*="preview" i] img',
      'div[class*="modal" i] img',
      'div[class*="dialog" i] img',
      'div[class*="lightbox" i] img',
      'div[class*="zoom" i] img',
      'div[class*="overlay" i] img'
    ];

    for (const sel of modalSelectors) {
      const imgs = document.querySelectorAll(sel);
      for (const img of imgs) {
        if (isElementVisible(img) && (img.naturalWidth > 120 || img.offsetWidth > 120)) {
          return img;
        }
      }
    }

    // 2. Buscar la imagen visible más grande en pantalla (excluyendo el iframe de nuestra extensión)
    const allImgs = Array.from(document.querySelectorAll('img'));
    let bestImg = null;
    let maxArea = 0;

    for (const img of allImgs) {
      if (img.closest('#hitss-laraigo-panel-wrapper') || img.closest('#hitss-laraigo-fab')) continue;
      if (!isElementVisible(img)) continue;

      const rect = img.getBoundingClientRect();
      const area = rect.width * rect.height;

      // Descartar avatares e íconos pequeños
      if (area > 20000 && rect.width >= 160 && rect.height >= 100) {
        if (area > maxArea) {
          maxArea = area;
          bestImg = img;
        }
      }
    }

    return bestImg;
  }

  async function imageElementToDataUrl(img) {
    if (!img) return null;

    // Intentar 1: Canvas directo
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 800;
      canvas.height = img.naturalHeight || img.height || 600;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    } catch (canvasErr) {
      console.warn('Canvas directo falló por CORS, intentando fetch de imagen:', canvasErr);
    }

    // Intentar 2: Fetch Blob (útil para URLs remotas de Laraigo o CDN)
    try {
      const res = await fetch(img.src, { mode: 'cors' });
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(img.src);
        reader.readAsDataURL(blob);
      });
    } catch (fetchErr) {
      console.warn('Fetch blob falló, devolviendo src directo:', fetchErr);
      return img.src;
    }
  }

  function startImagePicker() {
    if (isPickerActive) return;
    isPickerActive = true;
    document.body.classList.add('hitss-picker-active');

    if (!pickerBanner) {
      pickerBanner = document.createElement('div');
      pickerBanner.id = 'hitss-picker-banner';
      pickerBanner.innerHTML = `
        <span>🎯 <strong>Modo Selector:</strong> Haz clic en la imagen que deseas escanear</span>
        <button type="button" class="banner-close" title="Cancelar selector (Esc)">✕</button>
      `;
      document.body.appendChild(pickerBanner);

      pickerBanner.querySelector('.banner-close').addEventListener('click', stopImagePicker);
    } else {
      pickerBanner.style.display = 'flex';
    }

    document.addEventListener('mouseover', onPickerMouseOver, true);
    document.addEventListener('mouseout', onPickerMouseOut, true);
    document.addEventListener('click', onPickerClick, true);
    window.addEventListener('keydown', onPickerKeyDown, true);

    showInjectedToast('🎯 Pasa el ratón sobre cualquier imagen y haz clic para escanear');
  }

  function stopImagePicker() {
    isPickerActive = false;
    document.body.classList.remove('hitss-picker-active');

    if (pickerBanner) {
      pickerBanner.style.display = 'none';
    }

    document.querySelectorAll('img.hitss-picker-highlight').forEach(img => {
      img.classList.remove('hitss-picker-highlight');
    });

    document.removeEventListener('mouseover', onPickerMouseOver, true);
    document.removeEventListener('mouseout', onPickerMouseOut, true);
    document.removeEventListener('click', onPickerClick, true);
    window.removeEventListener('keydown', onPickerKeyDown, true);
  }

  function onPickerMouseOver(e) {
    if (!isPickerActive) return;
    const target = e.target;
    if (target && target.tagName === 'IMG' && !target.closest('#hitss-laraigo-panel-wrapper')) {
      target.classList.add('hitss-picker-highlight');
    }
  }

  function onPickerMouseOut(e) {
    const target = e.target;
    if (target && target.tagName === 'IMG') {
      target.classList.remove('hitss-picker-highlight');
    }
  }

  async function onPickerClick(e) {
    if (!isPickerActive) return;
    const target = e.target;

    // Permitir clic en el botón cerrar del banner
    if (target && target.closest('#hitss-picker-banner')) return;

    if (target && target.tagName === 'IMG' && !target.closest('#hitss-laraigo-panel-wrapper')) {
      e.preventDefault();
      e.stopPropagation();

      stopImagePicker();
      showInjectedToast('⏳ Procesando imagen seleccionada...');

      const dataUrl = await imageElementToDataUrl(target);
      sendImageToExtension(dataUrl, true);
      openDrawer();
    }
  }

  function onPickerKeyDown(e) {
    if (e.key === 'Escape' && isPickerActive) {
      e.preventDefault();
      e.stopPropagation();
      stopImagePicker();
      showInjectedToast('Modo selector cancelado');
    }
  }

  function sendImageToExtension(dataUrl, autoScan = true) {
    if (!dataUrl) return;

    if (panelIframe && panelIframe.contentWindow) {
      panelIframe.contentWindow.postMessage({
        type: 'HITSS_LOAD_OCR_IMAGE',
        dataUrl,
        autoScan
      }, '*');
      openDrawer();
    }
  }

  // ════════════════════════════════════════════════════════════════
  // 5. MENSAJERÍA BIDIRECCIONAL CON EL IFRAME
  // ════════════════════════════════════════════════════════════════
  function listenMessagesFromIframe() {
    // Escuchar mensajes internos de la extensión (popup / background)
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!message) return;

        if (message.action === 'TOGGLE_HITSS_DRAWER') {
          toggleDrawer();
          sendResponse({ status: 'ok' });
        } else if (message.action === 'SCAN_ACTIVE_PAGE_IMAGE') {
          const img = findActiveOrLargestImage();
          if (img) {
            imageElementToDataUrl(img).then(dataUrl => {
              sendResponse({ status: 'ok', dataUrl });
            });
            return true; // async sendResponse
          } else {
            sendResponse({ status: 'not_found' });
          }
        }
      });
    }

    // Escuchar mensajes desde el Iframe de la extensión
    window.addEventListener('message', async (event) => {
      if (!event.data || typeof event.data !== 'object') return;

      switch (event.data.type) {
        case 'HITSS_INSERT_CHAT':
          handleInsertIntoChat(event.data.text);
          break;

        case 'HITSS_CLOSE_DRAWER':
          closeDrawer();
          break;

        case 'HITSS_SHOW_TOAST':
          showInjectedToast(event.data.message || 'Acción completada');
          break;

        case 'HITSS_SCAN_PAGE_IMAGE': {
          const img = findActiveOrLargestImage();
          if (img) {
            showInjectedToast('📸 Imagen grande detectada en la página. Cargando...');
            const dataUrl = await imageElementToDataUrl(img);
            sendImageToExtension(dataUrl, true);
          } else {
            showInjectedToast('⚠️ No se detectó imagen abierta grande. Elige la imagen con un clic:');
            startImagePicker();
          }
          break;
        }

        case 'HITSS_START_PICKER':
          startImagePicker();
          break;
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  // 6. INSERCIÓN INTELIGENTE EN EL CHAT DE LARAIGO
  // ════════════════════════════════════════════════════════════════
  function handleInsertIntoChat(text) {
    if (!text) return;

    const targetInput = findLaraigoChatInput();

    if (targetInput) {
      targetInput.focus();

      // Caso 1: Input o Textarea estándar
      if (targetInput.tagName === 'TEXTAREA' || targetInput.tagName === 'INPUT') {
        const start = targetInput.selectionStart || 0;
        const end = targetInput.selectionEnd || 0;
        const currentVal = targetInput.value || '';
        
        targetInput.value = currentVal.substring(0, start) + text + currentVal.substring(end);
        targetInput.selectionStart = targetInput.selectionEnd = start + text.length;

        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
      } 
      // Caso 2: Contenedor contenteditable
      else if (targetInput.isContentEditable) {
        document.execCommand('insertText', false, text);
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      showInjectedToast('✅ ¡Plantilla insertada en el chat de Laraigo!');
    } else {
      navigator.clipboard.writeText(text).then(() => {
        showInjectedToast('📋 Plantilla copiada al portapapeles (abre un chat para pegar)');
      }).catch(() => {
        showInjectedToast('📋 Plantilla lista');
      });
    }
  }

  function findLaraigoChatInput() {
    const active = document.activeElement;
    if (active && (active.tagName === 'TEXTAREA' || active.isContentEditable)) {
      return active;
    }

    const selectors = [
      'textarea[placeholder*="mensaje" i]',
      'textarea[placeholder*="message" i]',
      'textarea[placeholder*="escribe" i]',
      'textarea[placeholder*="responder" i]',
      'textarea[name*="message" i]',
      'div[contenteditable="true"]',
      '.chat-input textarea',
      '.message-composer textarea',
      '.composer-input textarea',
      '#messageInput',
      '#chatTextarea',
      'textarea'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && isElementVisible(el)) {
        return el;
      }
    }

    return null;
  }

  function isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && el.offsetHeight > 0;
  }

  // 7. Toast flotante en Laraigo
  let toastEl = null;
  let toastTimeout = null;

  function createToastElement() {
    toastEl = document.createElement('div');
    toastEl.id = 'hitss-laraigo-toast';
    toastEl.innerHTML = `
      <span class="toast-icon">⚡</span>
      <span class="toast-text"></span>
    `;
    document.body.appendChild(toastEl);
  }

  function showInjectedToast(message) {
    if (!toastEl) return;
    const textSpan = toastEl.querySelector('.toast-text');
    if (textSpan) textSpan.textContent = message;

    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHITSSIntegration);
  } else {
    initHITSSIntegration();
  }
})();