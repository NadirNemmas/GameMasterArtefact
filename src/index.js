const { Client, GatewayIntentBits } = require("discord.js");
const { token } = require("../config.json");
const fs = require("node:fs");

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
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (!command.data || !command.data.name) {
    console.warn(`Command ${file} is missing data or execute function.`);
    continue;
  }
  client.commands.set(command.data.name, command);
}
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(token).catch((error) => {
  console.error("Failed to login:", error);
  process.exit(1); // Exit the process if login fails
});
