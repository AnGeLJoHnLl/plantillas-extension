/* ════════════════════════════════════════════════════════════════
   HITSS Tickets — Background Service Worker (Manifest V3)
   ════════════════════════════════════════════════════════════════ */

// Al hacer clic en el ícono de la extensión en la barra de herramientas de Chrome
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;

  // Si estamos en Laraigo, alternar el drawer integrado
  if (tab.url && (tab.url.includes('laraigo.com') || tab.url.includes('claro.laraigo.com'))) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_HITSS_DRAWER' });
    } catch (err) {
      // Si el content script no estaba listo, abrir en pestaña independiente
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    }
  } else {
    // Si estamos en cualquier otra página, abrir la herramienta en una pestaña nueva
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
});

// Soporte opcional para Chrome SidePanel API si el navegador lo permite
if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === 'function') {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
}
