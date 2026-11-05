/* ════════════════════════════════════════════════════════════════
   HITSS Tickets — Background Service Worker (Manifest V3)
   ════════════════════════════════════════════════════════════════ */

// Instalación o actualización de la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log('HITSS Tickets & OCR — Extensión instalada con éxito');
});
