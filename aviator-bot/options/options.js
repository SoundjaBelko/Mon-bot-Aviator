document.addEventListener('DOMContentLoaded', () => {
  // Charger les paramètres sauvegardés
  chrome.storage.sync.get([
    'strategy', 'baseBet', 'multiplierTarget',
    'stopWin', 'stopLoss', 'enableLearning', 'learningRate'
  ], (settings) => {
    document.getElementById('strategy').value = settings.strategy || 'moderate';
    document.getElementById('base-bet').value = settings.baseBet || 1.0;
    document.getElementById('multiplier-target').value = settings.multiplierTarget || 2.0;
    document.getElementById('stop-win').value = settings.stopWin || '';
    document.getElementById('stop-loss').value = settings.stopLoss || '';
    document.getElementById('enable-learning').checked = settings.enableLearning !== false;
    document.getElementById('learning-rate').value = settings.learningRate || 50;
    document.getElementById('learning-rate-value').textContent = 
      (settings.learningRate || 50) + '%';
    
    toggleCustomStrategy();
  });
  
  // Gérer l'affichage des options personnalisées
  document.getElementById('strategy').addEventListener('change', toggleCustomStrategy);
  
  function toggleCustomStrategy() {
    const strategy = document.getElementById('strategy').value;
    const customDiv = document.getElementById('custom-strategy');
    customDiv.classList.toggle('hidden', strategy !== 'custom');
  }
  
  // Mettre à jour la valeur du taux d'apprentissage
  document.getElementById('learning-rate').addEventListener('input', (e) => {
    document.getElementById('learning-rate-value').textContent = e.target.value + '%';
  });
  
  // Sauvegarder les paramètres
  document.getElementById('save-btn').addEventListener('click', saveSettings);
  
  function saveSettings() {
    const settings = {
      strategy: document.getElementById('strategy').value,
      baseBet: parseFloat(document.getElementById('base-bet').value),
      multiplierTarget: parseFloat(document.getElementById('multiplier-target').value), // ✔ Correction ici !
      stopWin: document.getElementById('stop-win').value ? 
        parseFloat(document.getElementById('stop-win').value) : null,
      stopLoss: document.getElementById('stop-loss').value ? 
        parseFloat(document.getElementById('stop-loss').value) : null,
      enableLearning: document.getElementById('enable-learning').checked,
      learningRate: parseInt(document.getElementById('learning-rate').value)
    };
    
    chrome.storage.sync.set(settings, () => {
      alert('Paramètres enregistrés avec succès!');
    });
  }
  
  // Réinitialiser les paramètres
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Voulez-vous vraiment réinitialiser tous les paramètres?')) {
      chrome.storage.sync.clear(() => {
        location.reload();
      });
    }
  });
});
