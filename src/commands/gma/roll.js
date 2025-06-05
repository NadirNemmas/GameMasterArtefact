const { SlashCommandSubcommandBuilder } = require("discord.js");
const session = require("../../session.js");
const fs = require("fs");
const path = require("path");

const accountsPath = path.join(__dirname, "../../data/accounts.json");

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlève les accents
    .replace(/\s+/g, " ") // Espace unique
    .trim();
}

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("roll")
    .setDescription(
      "Fait un jet de compétence ou de caractéristique ou lance un dé à X faces"
    )
    .addStringOption((option) =>
      option
        .setName("competence")
        .setDescription("Ex: corps ou corps-combat distance")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("d")
        .setDescription("Nombre de faces du dé (ex: 6, 20, 100...)")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("mod")
        .setDescription("Bonus ou malus à appliquer (ex: -3 ou +2)")
        .setRequired(false)
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

    const competence = interaction.options.getString("competence");
    const x = interaction.options.getInteger("x");
    const mod = interaction.options.getInteger("mod") || 0;

    const rawData = fs.readFileSync(accountsPath, "utf8");
    const accounts = JSON.parse(rawData).users;
    const userAccount = accounts.find((u) => u.username === username);

    // 🎲 Jet libre
    if (x) {
      if (x < 1) {
        return interaction.reply({
          content: "❌ Le nombre de faces doit être supérieur à 0.",
          ephemeral: true,
        });
      }

      const result = Math.floor(Math.random() * x) + 1;
      const total = result + mod;

      let outcome = "";
      if (result === 1) {
        outcome = "🎉 **Réussite critique !!!**";
      } else if (result === x) {
        outcome = "💥 **Échec critique !!!**";
      }

      return interaction.reply({
        content: `🎲 Jet 1d${x} : **${result}** ${
          mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : ""
        } → **Total : ${total}**${outcome ? ` → ${outcome}` : ""}`,
        ephemeral: false,
      });
    }

    // 🎯 Jet basé sur la fiche
    if (!competence) {
      return interaction.reply({
        content:
          "❌ Tu dois fournir soit une compétence (`competence:`), soit un nombre de faces (`x:`).",
        ephemeral: true,
      });
    }

    if (!userAccount || !userAccount.characterSheet) {
      return interaction.reply({
        content: "❌ Impossible de trouver votre fiche de personnage.",
        ephemeral: true,
      });
    }

    const sheet = userAccount.characterSheet;
    const input = competence.toLowerCase();
    const parts = input.split("-");
    let valeurAttendue;
    let label = input;

    if (parts.length === 1) {
      const attr = parts[0];
      valeurAttendue =
        sheet[Object.keys(sheet).find((k) => normalize(k) === normalize(attr))];
      label = attr;
    } else if (parts.length === 2) {
      const [domaine, sousComp] = parts;
      const key = Object.keys(sheet).find(
        (k) => normalize(k) === normalize(`${domaine}-sous-comp`)
      );
      const sousCompObj = sheet[key];

      if (sousCompObj) {
        const foundKey = Object.keys(sousCompObj).find(
          (k) => normalize(k) === normalize(sousComp)
        );
        valeurAttendue = sousCompObj[foundKey];
        label = `${domaine}-${foundKey || sousComp}`;
      }
    } else {
      return interaction.reply({
        content:
          "❌ Format invalide. Utilise `corps` ou `corps-combat distance`.",
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
    const total = result + mod;
    const success = total <= valeurAttendue;

    let outcome = "";
    if (result === 1) {
      outcome = "🎉 **Réussite critique !!!**";
    } else if (result === 20) {
      outcome = "💥 **Échec critique !!!**";
    }

    return interaction.reply({
      content: `🎲 Jet de **${label}** : **${result}** ${
        mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : ""
      } → **Total : ${total} / ${valeurAttendue}** → ${
        success ? "✅ Réussi !" : "❌ Échoué !"
      }${outcome ? ` → ${outcome}` : ""}`,
      ephemeral: false,
    });
  },
};
