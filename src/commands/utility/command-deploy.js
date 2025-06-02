const { REST, Routes } = require("discord.js");
const path = require("path");
const { token, clientId, guildId } = require(path.join(
  __dirname,
  "../../../config.json"
));
const fs = require("fs");

const commands = [];

function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith(".js")) {
      const command = require(fullPath);
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }
}

loadCommands(path.join(__dirname, ".."));

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("⏳ Déploiement des commandes slash...");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log("✅ Commandes enregistrées !");
  } catch (error) {
    console.error("❌ Erreur :", error);
  }
})();
