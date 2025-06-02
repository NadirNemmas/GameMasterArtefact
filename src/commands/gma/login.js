const { SlashCommandSubcommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { login } = require("../../session.js");

const accountsPath = path.join(__dirname, "../../data/accounts.json");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("login")
    .setDescription("Connexion au compte")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Nom d'utilisateur")
        .setRequired(true)
    ),

  async execute(interaction) {
    console.log("gma login command executed");
    const username = interaction.options.getString("username");

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

    await interaction.reply({
      content: `🔐 Veuillez entrer votre mot de passe dans ce salon.`,
      ephemeral: true,
    });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
      max: 1,
      time: 60_000,
    });

    collector.on("collect", async (message) => {
      const isMatch = await bcrypt.compare(
        message.content,
        userAccount.passwordHash
      );
      if (isMatch) {
        login(interaction.user.id, username);
        await message.reply(`✅ Bienvenue, ${username}. Vous êtes connecté.`);
      } else {
        await message.reply(`❌ Mot de passe incorrect.`);
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.followUp({
          content: "⏳ Temps écoulé. Connexion annulée.",
          ephemeral: true,
        });
      }
    });
  },
};
