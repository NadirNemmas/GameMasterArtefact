const { SlashCommandSubcommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const session = require("../../session.js");

const accountsPath = path.join(__dirname, "../../data/accounts.json");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("clear")
    .setDescription("Efface tous les messages du salon actuel (MJ seulement)"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = session.getUsername(userId);

    if (!username) {
      return interaction.reply({
        content: "❌ Vous devez être connecté avec `/gma login`.",
        ephemeral: true,
      });
    }

    const rawData = fs.readFileSync(accountsPath, "utf8");
    const accounts = JSON.parse(rawData).users;
    const account = accounts.find((u) => u.username === username);

    if (!account?.isAdmin) {
      return interaction.reply({
        content: "❌ Seuls les MJ peuvent utiliser cette commande.",
        ephemeral: true,
      });
    }

    try {
      // ✅ Répond immédiatement pour éviter l’erreur
      await interaction.reply({
        content: "🧹 Suppression des messages en cours...",
        ephemeral: true,
      });

      const channel = interaction.channel;
      let messages;

      do {
        messages = await channel.messages.fetch({ limit: 100 });
        if (messages.size === 0) break;

        await channel.bulkDelete(messages, true);
      } while (messages.size >= 2);

      // ✅ Envoie un message de suivi (facultatif)
      await interaction.followUp({
        content: "✅ Tous les messages récents ont été supprimés.",
        ephemeral: true,
      });
    } catch (error) {
      console.error("❌ Erreur lors du clear :", error);
      await interaction.followUp({
        content: "❌ Une erreur est survenue lors de la suppression.",
        ephemeral: true,
      });
    }
  },
};
