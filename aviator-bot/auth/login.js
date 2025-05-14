document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('login-btn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorMsg = document.getElementById('error-msg');

  loginBtn.addEventListener('click', function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Vérifie que les champs ne sont pas vides
    if (!username || !password) {
      errorMsg.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    // Vérification des identifiants dans chrome.storage
    chrome.storage.local.get(['users'], (result) => {
      const users = result.users || [];
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        // Si l'utilisateur existe et que les identifiants sont valides
        chrome.storage.local.set({
          isLoggedIn: true,
          currentUser: username
        }, () => {
          window.location.href = "../popup/index.html";
        });
      } else {
        // Si les identifiants sont incorrects
        errorMsg.textContent = "Identifiants incorrects.";
      }
    });
  });
});
