// bot/bot.js
function startBot() {
  console.log("✅ Bot Aviator est actif...");

  setInterval(() => {
    const heure = new Date().toLocaleTimeString();
    console.log(`🕒 [${heure}] Je suis toujours en ligne...`);
    // Ici tu mettras plus tard : analyse, décision, mise, etc.
  }, 10000); // toutes les 10 secondes
}

module.exports = startBot;
