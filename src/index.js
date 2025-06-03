const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
  ],
});

client.commands = new Map();
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (!command.data || !command.data.name) {
    console.warn(`Command ${file} is missing data or execute function.`);
    continue;
  }
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(config.token);

  for (const guildId of config.guildIds) {
    try {
      const guild = await client.guilds.fetch(guildId);
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, guildId),
        { body: commands }
      );
      console.log(
        `✅ Commandes déployées sur la guilde ${guildId} : ${guild.name}`
      );
    } catch (error) {
      console.error(
        `❌ Erreur lors du déploiement sur la guilde ${guildId}:`,
        error
      );
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `❌ Erreur en exécutant la commande ${interaction.commandName}:`,
      error
    );
    await interaction.reply({
      content: "❌ Une erreur est survenue pendant l'exécution de la commande.",
      ephemeral: true,
    });
  }
});

client.login(config.token).catch((error) => {
  console.error("❌ Impossible de se connecter :", error);
  process.exit(1);
});
