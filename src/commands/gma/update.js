const { SlashCommandSubcommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const session = require("../../session.js");

const accountsPath = path.join(__dirname, "../../data/accounts.json");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("update")
    .setDescription(
      "Met à jour une statistique ou une information du personnage"
    )
    .addStringOption((option) =>
      option
        .setName("champ")
        .setDescription("Nom du champ (ex: corps ou corps-combat à distance)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("valeur")
        .setDescription("Nouvelle valeur")
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = session.getUsername(interaction.user.id);
    if (!username) {
      return interaction.reply({
        content: "❌ Vous devez être connecté avec `/gma login`.",
        ephemeral: true,
      });
    }

    const champ = interaction.options.getString("champ").trim().toLowerCase();
    const valeurBrute = interaction.options.getString("valeur").trim();

    let raw = fs.readFileSync(accountsPath, "utf8");
    const accounts = JSON.parse(raw);
    const user = accounts.users.find((u) => u.username === username);

    if (!user || !user.characterSheet) {
      return interaction.reply({
        content: "❌ Fiche de personnage introuvable.",
        ephemeral: true,
      });
    }

    const sheet = user.characterSheet;
    const parts = champ.split("-");
    let champTrouvé = false;

    if (parts.length === 1) {
      // Champ principal (ex: nom, classe, age, corps...)
      const key = parts[0];
      sheet[key] = isNaN(valeurBrute) ? valeurBrute : parseInt(valeurBrute);
      champTrouvé = true;
    } else if (parts.length === 2) {
      // Sous-compétence (ex: corps-combat à distance)
      const [domaine, sous] = parts;
      const sousCompKey = `${domaine}-sous-comp`;

      const targetKey = Object.keys(sheet[sousCompKey] || {}).find(
        (k) => k.toLowerCase() === sous.toLowerCase()
      );

      if (targetKey) {
        sheet[sousCompKey][targetKey] = isNaN(valeurBrute)
          ? valeurBrute
          : parseInt(valeurBrute);
        champTrouvé = true;
      }
    }

    if (!champTrouvé) {
      return interaction.reply({
        content: `❌ Champ ou sous-compétence \`${champ}\` introuvable.`,
        ephemeral: true,
      });
    }

    fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2), "utf8");

    return interaction.reply({
      content: `✅ Le champ \`${champ}\` a été mis à jour avec la valeur **${valeurBrute}**.`,
      ephemeral: false,
    });
  },
};
// Exemple de commandes | Exemple of commands
// /gma update champ:corps valeur:15
// /gma update champ:intellect-magie valeur:12
// /gma update champ:nom valeur:Kaelis
