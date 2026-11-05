/* ════════════════════════════════════════════════════════════════
   HITSS Tickets — Content Script para Laraigo
   Integración pulcra: Botón flotante, drawer e inserción en chat
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

    // Cerrar al pulsar Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelWrapper.classList.contains('is-open')) {
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

  // 4. Mensajería bidireccional con el Iframe (PostMessage)
  function listenMessagesFromIframe() {
    window.addEventListener('message', (event) => {
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
      }
    });
  }

  // 5. Inserción Inteligente en el Chat de Laraigo
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
        
        // Si ya hay texto, lo agrega o reemplaza
        targetInput.value = currentVal.substring(0, start) + text + currentVal.substring(end);
        targetInput.selectionStart = targetInput.selectionEnd = start + text.length;

        // Disparar eventos para frameworks React / Vue / Angular de Laraigo
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
      // Si no encuentra la caja de texto abierta, copia al portapapeles
      navigator.clipboard.writeText(text).then(() => {
        showInjectedToast('📋 Plantilla copiada al portapapeles (abre un chat para pegar)');
      }).catch(() => {
        showInjectedToast('📋 Plantilla lista');
      });
    }
  }

  // Localizador inteligente de caja de texto activa en Laraigo
  function findLaraigoChatInput() {
    // 1. Elemento actualmente enfocado si es un campo de texto
    const active = document.activeElement;
    if (active && (active.tagName === 'TEXTAREA' || active.isContentEditable)) {
      return active;
    }

    // 2. Selectores habituales de cajas de mensaje en plataformas omnicanal
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

  // 6. Toast flotante en Laraigo
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
