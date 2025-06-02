const { SlashCommandSubcommandBuilder } = require("discord.js");
const session = require("../../session.js");
const fs = require("fs");
const path = require("path");

const accountsPath = path.join(__dirname, "../../data/accounts.json");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("roll")
    .setDescription("Fait un jet de compétence ou de caractéristique")
    .addStringOption((option) =>
      option
        .setName("competence")
        .setDescription("Ex: corps ou corps-combatDistance")
        .setRequired(true)
    ),

  async execute(interaction) {
    console.log("gma roll command executed");

    const username = session.getUsername(interaction.user.id);
    if (!username) {
      return interaction.reply({
        content:
          "❌ Vous devez être connecté à un compte avec `/gma login <username>`.",
        ephemeral: true,
      });
    }

    const input = interaction.options.getString("competence").toLowerCase();

    const rawData = fs.readFileSync(accountsPath, "utf8");
    const accounts = JSON.parse(rawData).users;
    const userAccount = accounts.find((u) => u.username === username);

    if (!userAccount || !userAccount.characterSheet) {
      return interaction.reply({
        content: "❌ Impossible de trouver votre fiche de personnage.",
        ephemeral: true,
      });
    }

    const sheet = userAccount.characterSheet;
    const parts = input.split("-");
    let valeurAttendue;
    let label = input;

    if (parts.length === 1) {
      const attr = parts[0];
      valeurAttendue = sheet[attr];
      label = attr;
    } else if (parts.length === 2) {
      const [domaine, sousComp] = parts;
      const key = `${domaine}-sous-comp`;
      const sousCompObj = sheet[key];

      if (sousCompObj) {
        const foundKey = Object.keys(sousCompObj).find(
          (k) => k.toLowerCase() === sousComp.toLowerCase()
        );
        valeurAttendue = sousCompObj[foundKey];
        label = `${domaine}-${foundKey || sousComp}`;
      }

      console.log(`la valeurAttendue est : ${valeurAttendue}`);
      console.log(`le label est : ${label}`);
    } else {
      return interaction.reply({
        content:
          "❌ Format invalide. Utilise `corps` ou `corps-combatDistance`.",
        ephemeral: true,
      });
    }

    if (valeurAttendue === undefined) {
      return interaction.reply({
        content: `❌ Compétence ou attribut \`${label}\` introuvable.`,
        ephemeral: true,
      });
    }

    const result = Math.floor(Math.random() * 20) + 1;
    const success = result <= valeurAttendue;

    return interaction.reply({
      content: `🎲 Jet de **${label}** : **${result} / ${valeurAttendue}** → ${
        success ? "✅ Réussi !" : "❌ Échoué !"
      }`,
      ephemeral: false,
    });
  },
};
