const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const subcommandDir = path.join(__dirname, "gma");
const subcommandFiles = fs
  .readdirSync(subcommandDir)
  .filter((file) => file.endsWith(".js"));

const command = new SlashCommandBuilder()
  .setName("gma")
  .setDescription("Commandes GMA");

const subcommands = new Map();

for (const file of subcommandFiles) {
  const sub = require(path.join(subcommandDir, file));
  if (!sub || !sub.data) {
    console.warn(`⚠️ Le fichier ${file} ne contient pas de propriété "data".`);
    continue;
  }
  command.addSubcommand(sub.data);
  subcommands.set(sub.data.name, sub);
}

module.exports = {
  data: command,
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (subcommands.has(sub)) {
      return subcommands.get(sub).execute(interaction);
    } else {
      await interaction.reply({
        content: "❌ Sous-commande inconnue.",
        ephemeral: true,
      });
    }
  },
};
