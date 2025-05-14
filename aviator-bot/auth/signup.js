document.getElementById('signup-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Vérification que les champs ne sont pas vides
    if (!username || !password) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    // Récupérer la liste des utilisateurs
    chrome.storage.local.get(['users'], (result) => {
        let users = result.users || [];

        // Vérifier si l'utilisateur existe déjà
        const userExists = users.some(user => user.username === username);
        if (userExists) {
            alert('Nom d\'utilisateur déjà pris.');
            return;
        }

        // Ajouter l'utilisateur à la liste et enregistrer dans chrome.storage.local
        users.push({ username, password });

        chrome.storage.local.set({ users }, () => {
            alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            window.location.href = 'login.html'; // Redirection vers la page de connexion
        });
    });
});
