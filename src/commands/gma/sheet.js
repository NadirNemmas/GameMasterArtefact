const { SlashCommandSubcommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const session = require("../../session.js");

const accountsPath = path.join(__dirname, "../../data/accounts.json");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("sheet")
    .setDescription("Montre la fiches de personnage de l'utilisateur connecté"),

  async execute(interaction) {
    console.log("gma sheet command executed");

    const username = session.getUsername(interaction.user.id);
    if (!username) {
      return interaction.reply({
        content:
          "❌ Vous devez être connecté à un compte avec `/gma login <username>`.",
        ephemeral: true,
      });
    }

    let rawData;
    try {
      rawData = fs.readFileSync(accountsPath, "utf8");
    } catch (err) {
      return interaction.reply({
        content: "❌ Impossible de lire le fichier des comptes.",
        ephemeral: true,
      });
    }

    let accounts;
    try {
      accounts = JSON.parse(rawData).users;
    } catch (err) {
      return interaction.reply({
        content: "❌ Erreur lors de la lecture des données JSON.",
        ephemeral: true,
      });
    }

    const userAccount = accounts.find((u) => u.username === username);
    if (!userAccount) {
      return interaction.reply({
        content: `❌ Compte "${username}" introuvable.`,
        ephemeral: true,
      });
    }

    let characterSheets = userAccount.characterSheet;

    if (!characterSheets) {
      return interaction.reply({
        content: `❌ Aucun personnage trouvé pour l'utilisateur ${username}.`,
        ephemeral: true,
      });
    }
    if (!Array.isArray(characterSheets)) {
      characterSheets = [characterSheets];
    }

    let response = `📜 **Fiche${
      characterSheets.length > 1 ? "s" : ""
    } de personnage pour \`${username}\` :**\n`;

    characterSheets.forEach((sheet) => {
      response += `- Nom : ${sheet.nom}\n`;
      response += `- Race : ${sheet.race}\n`;
      response += `- Classe : ${sheet.classe}\n`;
      response += `- Age : ${sheet.age}\n`;
      response += `- Stat-Corps : ${sheet.corps}\n`;
      if (sheet.stats) {
        Object.entries(sheet.stats).forEach(([stat, value]) => {
          response += `- ${stat} : ${value}\n`;
        });
      }
    });

    return interaction.reply({ content: response, ephemeral: true });
  },
};
