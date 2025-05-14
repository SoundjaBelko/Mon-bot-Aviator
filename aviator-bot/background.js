// ===== CONFIGURATION =====
const CHECK_INTERVAL = 5000; // Vérification toutes les 5 secondes
const TARGET_URL = "https://1win.com.ci/aviator*";

// ===== ÉTAT GLOBAL =====
let activeTabId = null;
let retryCount = 0;
const MAX_RETRIES = 3;

// ===== DÉTECTION INTELLIGENTE =====
chrome.webNavigation.onCompleted.addListener(detectTab, {
  url: [{urlMatches: TARGET_URL}]
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) activeTabId = null;
});

// ===== CŒUR DU SYSTÈME =====
function detectTab(details) {
  if (details.url.includes('aviator')) {
    activeTabId = details.tabId;
    injectBot().catch(handleError);
  }
}

async function injectBot() {
  try {
    await chrome.scripting.executeScript({
      target: {tabId: activeTabId},
      files: ['content/bot-core.js']
    });
    retryCount = 0;
    console.log("[SUCCÈS] Bot injecté dans l'onglet", activeTabId);
  } catch (error) {
    throw new Error(`Échec injection: ${error.message}`);
  }
}

// ===== SYSTÈME DE RECONNEXION =====
function startHealthCheck() {
  setInterval(async () => {
    if (!activeTabId) return;
    
    try {
      await chrome.tabs.sendMessage(activeTabId, {type: "PING"});
      retryCount = 0;
    } catch (error) {
      if (++retryCount >= MAX_RETRIES) {
        await recoverConnection();
      }
    }
  }, CHECK_INTERVAL);
}

async function recoverConnection() {
  console.log("[RÉPARATION] Tentative de récupération...");
  const tabs = await chrome.tabs.query({url: TARGET_URL});
  
  if (tabs.length > 0) {
    activeTabId = tabs[0].id;
    await injectBot();
  } else {
    console.warn("[AVERTISSEMENT] Onglet 1win introuvable");
    activeTabId = null;
  }
}

// Gestion des erreurs globales
function handleError(error) {
  console.error("[ERREUR]", error.message);
  // Ajoute un processus de notification ou un autre type de gestion d'erreur si nécessaire
}
