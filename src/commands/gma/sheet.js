const { SlashCommandSubcommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const session = require("../../session.js");

const accountsPath = path.join(__dirname, "../../data/accounts.json");

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "");
}

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("sheet")
    .setDescription("Affiche une fiche de personnage")
    .addStringOption((option) =>
      option
        .setName("stat")
        .setDescription("Afficher une statistique ou sous-compétence précise")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("stats")
        .setDescription(
          "Afficher plusieurs statistiques séparées par des virgules"
        )
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("Voir la fiche d’un autre joueur (MJ seulement)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Ex: nom_utilisateur:stat ou juste stat")
        .setRequired(false)
    ),

  async execute(interaction) {
    const requesterId = interaction.user.id;
    const sessionUsername = session.getUsername(requesterId);

    if (!sessionUsername) {
      return interaction.reply({
        content: "❌ Vous devez être connecté avec `/gma login`.",
        ephemeral: true,
      });
    }

    const raw = fs.readFileSync(accountsPath, "utf8");
    const accounts = JSON.parse(raw).users;

    const viewerAccount = accounts.find((u) => u.username === sessionUsername);
    const isAdmin = viewerAccount?.isAdmin === true;

    const stat = interaction.options.getString("stat");
    const statsList = interaction.options.getString("stats");
    const query = interaction.options.getString("query");
    let targetUsername =
      interaction.options.getString("user") || sessionUsername;
    let statFromQuery = null;

    if (query) {
      const parts = query.split(":");
      if (parts.length === 2) {
        targetUsername = parts[0];
        statFromQuery = parts[1];
      } else {
        statFromQuery = parts[0];
      }
    }

    if (targetUsername !== sessionUsername && !isAdmin) {
      return interaction.reply({
        content:
          "❌ Seuls les MJ peuvent consulter la fiche d'un autre joueur.",
        ephemeral: true,
      });
    }

    const target = accounts.find((u) => u.username === targetUsername);

    if (!target || !target.characterSheet) {
      return interaction.reply({
        content: `❌ Fiche pour \`${targetUsername}\` introuvable.`,
        ephemeral: true,
      });
    }

    const sheet = target.characterSheet;
    const allStats = ["corps", "intellect", "agilité", "sociale"];

    function resolveStat(statQuery) {
      const normStat = normalize(statQuery);
      for (const domaine of allStats) {
        const sous = sheet[`${domaine}-sous-comp`] || {};
        for (const [key, val] of Object.entries(sous)) {
          if (normalize(key) === normStat) {
            return `- ${key} (${domaine}) : ${val}`;
          }
        }
        if (normalize(domaine) === normStat && sheet[domaine] !== undefined) {
          return `- ${domaine} : ${sheet[domaine]}`;
        }
      }
      return null;
    }

    if (stat || statFromQuery) {
      const queryStat = statFromQuery || stat;
      const result = resolveStat(queryStat);
      return interaction.reply({
        content: result || `❌ Statistique \`${queryStat}\` non trouvée.`,
        ephemeral: !result,
      });
    }

    if (statsList) {
      const queries = statsList.split(",").map((s) => normalize(s.trim()));
      const found = [];

      for (const query of queries) {
        const result = resolveStat(query);
        found.push(result || `❌ ${query} : non trouvée`);
      }

      return interaction.reply({
        content: found.join("\n"),
        ephemeral: false,
      });
    }

    // Fiche complète
    let response = `📜 **Fiche de \`${targetUsername}\`**\n`;
    for (const domaine of allStats) {
      response += `\n**${domaine.toUpperCase()}** : ${sheet[domaine]}\n`;
      const sous = sheet[`${domaine}-sous-comp`] || {};
      for (const [key, val] of Object.entries(sous)) {
        response += `  • ${key} : ${val}\n`;
      }
    }

    return interaction.reply({
      content: response,
      ephemeral: false,
    });
  },
};
