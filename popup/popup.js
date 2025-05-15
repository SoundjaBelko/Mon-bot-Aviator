// Rediriger si l'utilisateur n'est pas connecté
chrome.storage.local.get(['isLoggedIn'], (data) => {
  if (!data.isLoggedIn) {
    window.location.href = "../auth/login.html";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-bot');
  const balanceEl = document.getElementById('balance');
  const winsEl = document.getElementById('wins');
  const lossesEl = document.getElementById('losses');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const historyList = document.getElementById('history-list');
  const statusIndicator = document.querySelector('.status-indicator');
  const logoutBtn = document.getElementById('logout-btn');
  const goalDefault = 10000;

  let botActive = false;
  let simulationInterval;
  let currentStrategy = 'moderate'; // par défaut

  // Charger les données initiales
  chrome.storage.local.get(['balance', 'wins', 'losses', 'history', 'goal'], (data) => {
    updateUI(data);
  });

  // Charger la stratégie depuis le stockage sync
  chrome.storage.sync.get(['strategy'], (data) => {
    currentStrategy = data.strategy || 'moderate';
  });

  // Mise à jour automatique si changement dans le stockage
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      chrome.storage.local.get(['balance', 'wins', 'losses', 'history', 'goal'], updateUI);
    }
  });

  // Bouton Démarrer/Arrêter le bot
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      botActive = !botActive;
      toggleBtn.textContent = botActive ? 'ARRÊTER LE BOT' : 'DÉMARRER LE BOT';
      toggleBtn.classList.toggle('btn-stop', botActive);
      toggleBtn.classList.toggle('btn-start', !botActive);
      statusIndicator.style.backgroundColor = botActive ? '#00b894' : '#d63031';
      statusIndicator.style.boxShadow = `0 0 5px ${botActive ? '#00b894' : '#d63031'}`;
      botActive ? startBotSimulation() : stopBotSimulation();
    });
  }

  // Ouvrir les options
  const optionsBtn = document.getElementById('options-btn');
  if (optionsBtn) {
    optionsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // Déconnexion
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      chrome.storage.local.set({ isLoggedIn: false, currentUser: null }, () => {
        window.location.href = "../auth/login.html";
      });
    });
  }

  function updateUI(data) {
    const balance = data.balance || 0;
    const wins = data.wins || 0;
    const losses = data.losses || 0;
    const history = data.history || [];
    const goal = data.goal || goalDefault;

    if (balanceEl) balanceEl.textContent = `${balance} FCFA`;
    if (winsEl) winsEl.textContent = `${wins} FCFA`;
    if (lossesEl) lossesEl.textContent = `${losses} FCFA`;

    const progress = (wins / goal) * 100;
    if (progressFill) progressFill.style.width = `${Math.min(progress, 100)}%`;
    if (progressText) progressText.textContent = `Progression objectif: ${Math.min(progress, 100).toFixed(1)}%`;

    updateHistory(history);
  }

  function updateHistory(history) {
    if (!historyList) return;
    historyList.innerHTML = '';
    history.slice(-5).reverse().forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      const date = new Date(item.timestamp).toLocaleTimeString();
      const resultClass = item.win ? 'positive' : 'negative';
      const sign = item.win ? '+' : '-';

      historyItem.innerHTML = `
        <span>${date}</span>
        <span class="${resultClass}">${sign}${item.amount} FCFA</span>
      `;
      historyList.appendChild(historyItem);
    });
  }

  function startBotSimulation() {
    simulationInterval = setInterval(() => {
      chrome.storage.local.get(['balance', 'wins', 'losses', 'history'], (data) => {
        const history = data.history || [];

        let amount, winRate;
        switch (currentStrategy) {
          case 'fast':
            amount = 100 + Math.floor(Math.random() * 100);
            winRate = 0.8;
            break;
          case 'moderate':
            amount = 300 + Math.floor(Math.random() * 200);
            winRate = 0.6;
            break;
          case 'long':
            amount = 500 + Math.floor(Math.random() * 500);
            winRate = 0.4;
            break;
          default:
            amount = 200;
            winRate = 0.5;
        }

        const win = Math.random() < winRate;
        const newBalance = (data.balance || 0) + (win ? amount : -amount);
        const newWins = (data.wins || 0) + (win ? amount : 0);
        const newLosses = (data.losses || 0) + (!win ? amount : 0);

        history.push({
          timestamp: new Date().toISOString(),
          amount: amount,
          win: win
        });

        chrome.storage.local.set({
          balance: newBalance,
          wins: newWins,
          losses: newLosses,
          history: history
        });
      });
    }, 2000);
  }

  function stopBotSimulation() {
    clearInterval(simulationInterval);
  }

  window.addEventListener('beforeunload', stopBotSimulation);
});
