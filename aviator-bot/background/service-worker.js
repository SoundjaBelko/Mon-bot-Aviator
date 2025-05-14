// ===== CONFIGURATION AVANCÉE =====
const CONFIG = {
  checkInterval: 3000, // 3 secondes entre les actions
  maxRetries: 3, // Nombre de tentatives en cas d'échec
  targetUrl: "https://1win.com.ci/aviator"
};

// ===== ÉTAT GLOBAL AMÉLIORÉ =====
const state = {
  status: "inactive",
  tab: null,
  stats: {
    balance: 0,
    wins: 0,
    losses: 0,
    lastBet: null,
    streak: 0
  },
  settings: {
    strategy: "conservative",
    autoCashout: 1.5,
    baseBet: 10
  },
  retryCount: 0
};

// ===== FONCTIONS PRINCIPALES =====
async function executeBotCycle() {
  try {
    // Vérification de l'onglet actif
    if (!await checkActiveTab()) return;
    
    // Injection du code d'action
    await injectBotScript();
    
    // Mise à jour des statistiques
    updateSessionData();
    
    // Réinitialisation du compteur d'essais
    state.retryCount = 0;
    
  } catch (error) {
    console.error("Cycle d'exécution échoué:", error);
    if (++state.retryCount >= CONFIG.maxRetries) {
      handleCriticalError();
    }
  }
}

async function checkActiveTab() {
  if (!state.tab?.id) return false;
  
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
    tabId: state.tab.id
  });
  
  return !!tab && tab.url.includes(CONFIG.targetUrl);
}

async function injectBotScript() {
  try {
    // Première méthode : injection de fichier
    await chrome.scripting.executeScript({
      target: { tabId: state.tab.id },
      files: ['content/aviator-actions.js']
    });
  } catch {
    // Fallback : injection de code direct
    await chrome.scripting.executeScript({
      target: { tabId: state.tab.id },
      func: () => {
        // Logique de base si le fichier est absent
        const placeBet = () => {
          const btn = document.querySelector('.bet-button, [aria-label*="bet"]');
          btn?.click();
        };
        setInterval(placeBet, CONFIG.checkInterval);
      }
    });
  }
}

// ===== GESTION D'ÉTAT =====
async function saveState() {
  await chrome.storage.local.set({ 
    aviatorBotState: state 
  });
  chrome.action.setBadgeText({
    text: state.status === 'active' ? 'ON' : ''
  });
}

async function loadState() {
  const { aviatorBotState } = await chrome.storage.local.get("aviatorBotState");
  if (aviatorBotState) Object.assign(state, aviatorBotState);
}

// ===== GESTION DES ERREURS =====
function handleCriticalError() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/alert.png",
    title: "Erreur Critique",
    message: "Le bot a été arrêté après 3 échecs"
  });
  stopBot();
}

// ===== INTERFACE DE COMMUNICATION =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "START":
      if (state.status === 'inactive') {
        state.tab = sender.tab;
        startBot();
      }
      break;
      
    case "STOP":
      stopBot();
      break;
      
    case "UPDATE_SETTINGS":
      Object.assign(state.settings, request.settings);
      saveState();
      break;
  }
  return true;
});

// ===== LIFECYCLE =====
function startBot() {
  state.status = 'active';
  chrome.alarms.create('botCycle', { delayInMinutes: 0.05 });
  saveState();
}

function stopBot() {
  state.status = 'inactive';
  chrome.alarms.clear('botCycle');
  saveState();
}

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'botCycle' && state.status === 'active') {
    executeBotCycle();
    chrome.alarms.create('botCycle', { delayInMinutes: CONFIG.checkInterval / 60000 });
  }
});

// ===== INITIALISATION =====
chrome.runtime.onInstalled.addListener(loadState);
chrome.runtime.onStartup.addListener(loadState);