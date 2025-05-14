// Observer les changements dans le jeu Aviator
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      // Détecter les éléments du jeu
      const gameElements = document.querySelectorAll('.aviator-game-element');
      if (gameElements.length) {
        handleGameElements(gameElements);
      }
    }
  });
});

function handleGameElements(elements) {
  // Extraire les données du jeu
  const gameData = extractGameData(elements);
  
  // Envoyer les données au background
  chrome.runtime.sendMessage({
    type: 'GAME_DATA_UPDATE',
    data: gameData
  });
}

function extractGameData(elements) {
  // TODO: Implémenter l'extraction spécifique au jeu
  return {
    roundId: Date.now(),
    multiplier: parseFloat(document.querySelector('.multiplier').innerText),
    timestamp: new Date().toISOString()
  };
}

// Démarrer l'observation
observer.observe(document.body, {
  childList: true,
  subtree: true
});