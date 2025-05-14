// ===== CONFIGURATION =====
const BET_INTERVAL = 3000; // Temps entre deux paris (3 sec)
const MAX_RETRIES = 5;     // Nombre de tentatives max pour trouver le bouton
const BET_AMOUNT = 100;    // Montant par défaut (modifiable)

let currentStrategy = "medium"; // Valeur par défaut, sera chargée depuis les options
let currentBet = BET_AMOUNT;
let lastBetWon = null;

// ===== COMMUNICATION AVEC L'EXTENSION =====
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PING") {
    sendResponse(true);
    return true;
  }

  if (msg.type === "STOP") {
    stopBot();
    sendResponse(true);
  }
});

// ===== LE BOT =====
const bot = {
  interval: null,
  retryCount: 0,

  start() {
    console.log("[BOT] Démarrage...");
    this.interval = setInterval(() => this.placeBet(), BET_INTERVAL);
  },

  stop() {
    clearInterval(this.interval);
    console.log("[BOT] Arrêté");
  },

  placeBet() {
    try {
      const betButton = this.findBetButton();
      const inputField = this.findBetInput();

      if (betButton && inputField) {
        inputField.value = currentBet;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        betButton.click();
        this.retryCount = 0;
        console.log(`[✅ PARI] ${currentBet} FCFA à ${new Date().toLocaleTimeString()}`);

        this.analyseResult();
      } else {
        this.handleMissingButton();
      }
    } catch (error) {
      console.error("[❌ ERREUR]", error);
    }
  },

  analyseResult() {
    // Simule un retour du résultat après un délai (à adapter selon 1win)
    setTimeout(() => {
      const result = Math.random() > 0.5 ? "win" : "lose"; // Simulé aléatoire
      lastBetWon = result === "win";
      console.log(`[📊 RÉSULTAT] ${result.toUpperCase()}`);
      this.adjustStrategy();
    }, 2000);
  },

  adjustStrategy() {
    if (!lastBetWon) {
      if (currentStrategy === "short") currentBet *= 1.2;
      else if (currentStrategy === "medium") currentBet *= 2;
      else if (currentStrategy === "long") currentBet *= 3;
      console.log(`[⚙️ STRATÉGIE] Nouvelle mise : ${currentBet} FCFA`);
    } else {
      currentBet = BET_AMOUNT;
    }
  },

  findBetButton() {
    const selectors = [
      '[data-test="bet-button"]',
      'button[class*="bet"]',
      '.bet-controls button:last-child'
    ];

    for (const selector of selectors) {
      const btn = document.querySelector(selector);
      if (btn) return btn;
    }

    const allButtons = document.querySelectorAll("button");
    for (const btn of allButtons) {
      if (btn.textContent.includes("Parier")) {
        return btn;
      }
    }

    return null;
  },

  findBetInput() {
    return document.querySelector('input[type="number"], input[class*="amount"]');
  },

  handleMissingButton() {
    this.retryCount++;
    if (this.retryCount >= MAX_RETRIES) {
      console.warn("[⚠️ AVERTISSEMENT] Bouton introuvable après", MAX_RETRIES, "tentatives");
      this.retryCount = 0;
      chrome.runtime.sendMessage({ type: "RELOAD" });
    }
  }
};

// ===== ATTENDRE QUE LE JEU APPARAISSE AVANT DE DÉMARRER =====
function attendreLeJeuEtLancerBot() {
  chrome.storage.sync.get(["mode_jeu"], (data) => {
    if (data.mode_jeu) {
      currentStrategy = data.mode_jeu;
      console.log(`[MODE] Stratégie : ${currentStrategy}`);
    }

    const observer = new MutationObserver(() => {
      const jeu = document.querySelector('.CasinoGame_game_JenRc');
      if (jeu) {
        console.log("[🎯 JEU DÉTECTÉ] Démarrage du bot...");
        observer.disconnect();
        bot.start();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const jeuImmediat = document.querySelector('.CasinoGame_game_JenRc');
    if (jeuImmediat) {
      console.log("[🎯 JEU IMMÉDIAT] Démarrage du bot...");
      bot.start();
    }
  });
}

// ===== LANCEMENT =====
attendreLeJeuEtLancerBot();

function stopBot() {
  bot.stop();
}
