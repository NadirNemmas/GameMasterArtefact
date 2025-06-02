const { SlashCommandSubcommandBuilder } = require("discord.js");
const session = require("../../session.js");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("logout")
    .setDescription("Déconnecte l'utilisateur actuellement connecté"),

  async execute(interaction) {
    console.log("gma logout command executed");

    const username = session.getUsername(interaction.user.id);

    if (!username) {
      return interaction.reply({
        content: "❌ Aucun utilisateur connecté pour cette session.",
        ephemeral: true,
      });
    }

    session.logout(interaction.user.id);

    return interaction.reply({
      content: `🔓 Déconnexion réussie. Au revoir, ${username}.`,
      ephemeral: true,
    });
  },
};
