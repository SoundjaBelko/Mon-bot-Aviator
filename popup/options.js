document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status');

  // Charger le mode actuel
  chrome.storage.local.get(['strategyMode'], (data) => {
    const mode = data.strategyMode || 'medium'; // Valeur par défaut
    const input = document.querySelector(`input[value="${mode}"]`);
    if (input) input.checked = true;
  });

  // Sauvegarder la sélection
  saveBtn.addEventListener('click', () => {
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    chrome.storage.local.set({ strategyMode: selectedMode }, () => {
      statusEl.textContent = "Stratégie enregistrée avec succès !";
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
    });
  });
});
