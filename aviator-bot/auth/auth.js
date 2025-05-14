// INSCRIPTION
document.getElementById('register-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  
  // Récupération des valeurs des champs
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value.trim();

  // Vérification des longueurs minimales des champs
  if (username.length < 3 || password.length < 3) {
    document.getElementById('register-error').textContent = "Minimum 3 caractères requis.";
    return;
  }

  // Vérification de l'existence de l'utilisateur dans le stockage
  chrome.storage.local.get(['users'], (result) => {
    let users = result.users || [];
    const userExists = users.some(user => user.username === username);

    if (userExists) {
      document.getElementById('register-error').textContent = "Nom d'utilisateur déjà utilisé.";
      return;
    }

    // Ajout du nouvel utilisateur
    users.push({ username, password });

    // Sauvegarde des données dans le stockage local
    chrome.storage.local.set({ users, isLoggedIn: true, currentUser: username }, () => {
      window.location.href = '../popup/index.html';  // Redirection vers la page du tableau de bord
    });
  });
});

// CONNEXION
document.getElementById('login-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  
  // Récupération des valeurs des champs
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Vérification que les champs ne sont pas vides
  if (username.length < 3 || password.length < 3) {
    document.getElementById('login-error').textContent = "Les champs ne peuvent pas être vides.";
    return;
  }

  // Recherche de l'utilisateur dans le stockage
  chrome.storage.local.get(['users'], (result) => {
    const users = result.users || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // Connexion réussie, sauvegarde des informations de session
      chrome.storage.local.set({ isLoggedIn: true, currentUser: username }, () => {
        window.location.href = '../popup/index.html';  // Redirection vers le tableau de bord
      });
    } else {
      // Affichage d'un message d'erreur si l'utilisateur ou mot de passe est incorrect
      document.getElementById('login-error').textContent = "Nom d'utilisateur ou mot de passe incorrect.";
    }
  });
});
