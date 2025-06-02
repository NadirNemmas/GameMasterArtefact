const { SlashCommandSubcommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const accountsPath = path.join(__dirname, "../../data/accounts.json");

const questions = [
  { key: "username", question: "🧑 Quel est ton **nom d'utilisateur** ?" },
  { key: "password", question: "🔒 Choisis un **mot de passe**." },
  { key: "nom", question: "📛 Quel est le **nom de ton personnage** ?" },
  { key: "race", question: "👤 Quelle est sa **race** ?" },
  { key: "classe", question: "⚔️ Quelle est sa **classe** ?" },
  { key: "age", question: "📅 Quel est son **âge** ?" },
  { key: "corps", question: "💪 Valeur de **corps** ?" },
  { key: "intellect", question: "🧠 Valeur d’**intellect** ?" },
  { key: "agilité", question: "🏃 Valeur d’**agilité** ?" },
  { key: "sociale", question: "🗣️ Valeur de **sociale** ?" },
];

const sousCompetenceQuestions = [
  // Corps
  {
    key: "corps-sous-comp::intimidation",
    question: "🔹 Valeur pour **corps – Intimidation** ?",
  },
  {
    key: "corps-sous-comp::sang froid",
    question: "🔹 Valeur pour **corps – Sang froid** ?",
  },
  {
    key: "corps-sous-comp::resistance",
    question: "🔹 Valeur pour **corps – Resistance** ?",
  },
  {
    key: "corps-sous-comp::robustesse",
    question: "🔹 Valeur pour **corps – Robustesse** ?",
  },
  {
    key: "corps-sous-comp::mêlée lourde",
    question: "🔹 Valeur pour **corps – Mêlée lourde** ?",
  },
  {
    key: "corps-sous-comp::combat main nues",
    question: "🔹 Valeur pour **corps – Combat main nues** ?",
  },
  {
    key: "corps-sous-comp::réflexe",
    question: "🔹 Valeur pour **corps – Réflexe** ?",
  },
  {
    key: "corps-sous-comp::combat à distance",
    question: "🔹 Valeur pour **corps – Combat à distance** ?",
  },

  // Intellect
  {
    key: "intellect-sous-comp::intuition",
    question: "🔹 Valeur pour **intellect – Intuition** ?",
  },
  {
    key: "intellect-sous-comp::stratégie",
    question: "🔹 Valeur pour **intellect – Stratégie** ?",
  },
  {
    key: "intellect-sous-comp::navigation",
    question: "🔹 Valeur pour **intellect – Navigation** ?",
  },
  {
    key: "intellect-sous-comp::perception",
    question: "🔹 Valeur pour **intellect – Perception** ?",
  },
  {
    key: "intellect-sous-comp::craft",
    question: "🔹 Valeur pour **intellect – Craft** ?",
  },
  {
    key: "intellect-sous-comp::alchimie",
    question: "🔹 Valeur pour **intellect – Alchimie** ?",
  },
  {
    key: "intellect-sous-comp::mythologie/savoir",
    question: "🔹 Valeur pour **intellect – Mythologie/Savoir** ?",
  },
  {
    key: "intellect-sous-comp::magie",
    question: "🔹 Valeur pour **intellect – Magie** ?",
  },

  // Agilité
  {
    key: "agilité-sous-comp::combat à distance léger",
    question: "🔹 Valeur pour **agilité – Combat à distance léger** ?",
  },
  {
    key: "agilité-sous-comp::discrétion",
    question: "🔹 Valeur pour **agilité – Discrétion** ?",
  },
  {
    key: "agilité-sous-comp::esquive",
    question: "🔹 Valeur pour **agilité – Esquive** ?",
  },
  {
    key: "agilité-sous-comp::dance/mouvements",
    question: "🔹 Valeur pour **agilité – Dance/Mouvements** ?",
  },
  {
    key: "agilité-sous-comp::escalade",
    question: "🔹 Valeur pour **agilité – Escalade** ?",
  },
  {
    key: "agilité-sous-comp::mêlée légères",
    question: "🔹 Valeur pour **agilité – Mêlée légères** ?",
  },
  {
    key: "agilité-sous-comp::crochetage",
    question: "🔹 Valeur pour **agilité – Crochetage** ?",
  },
  {
    key: "agilité-sous-comp::voler",
    question: "🔹 Valeur pour **agilité – Voler** ?",
  },

  // Sociale
  {
    key: "sociale-sous-comp::éloquence/mensonge",
    question: "🔹 Valeur pour **sociale – Éloquence/Mensonge** ?",
  },
  {
    key: "sociale-sous-comp::persuasion",
    question: "🔹 Valeur pour **sociale – Persuasion** ?",
  },
  {
    key: "sociale-sous-comp::charisme",
    question: "🔹 Valeur pour **sociale – Charisme** ?",
  },
  {
    key: "sociale-sous-comp::humour",
    question: "🔹 Valeur pour **sociale – Humour** ?",
  },
  {
    key: "sociale-sous-comp::séduction",
    question: "🔹 Valeur pour **sociale – Séduction** ?",
  },
  {
    key: "sociale-sous-comp::lire/écrire",
    question: "🔹 Valeur pour **sociale – Lire/Écrire** ?",
  },
  {
    key: "sociale-sous-comp::animaux",
    question: "🔹 Valeur pour **sociale – Animaux** ?",
  },
  {
    key: "sociale-sous-comp::médical",
    question: "🔹 Valeur pour **sociale – Médical** ?",
  },
];

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("register")
    .setDescription("Crée un compte utilisateur et une fiche de personnage"),

  async execute(interaction) {
    await interaction.reply({
      content:
        "📋 Début de l'inscription. Tu vas recevoir une série de questions.",
      ephemeral: true,
    });

    const filter = (m) => m.author.id === interaction.user.id;
    const collectedData = {};
    const channel = interaction.channel;

    for (const q of [...questions, ...sousCompetenceQuestions]) {
      await channel.send(q.question);
      const collected = await channel
        .awaitMessages({
          filter,
          max: 1,
          time: 60000,
          errors: ["time"],
        })
        .catch(() => null);

      if (!collected || collected.size === 0) {
        return channel.send("⏳ Temps écoulé. Inscription annulée.");
      }

      const answer = collected.first().content.trim();
      collectedData[q.key] = isNaN(answer) ? answer : parseInt(answer);
    }

    // Vérification d'existence
    const raw = fs.readFileSync(accountsPath, "utf8");
    const accounts = JSON.parse(raw);
    if (accounts.users.find((u) => u.username === collectedData.username)) {
      return channel.send("❌ Ce nom d'utilisateur est déjà pris.");
    }

    const passwordHash = await bcrypt.hash(collectedData.password, 10);
    const characterSheet = {
      nom: collectedData.nom,
      race: collectedData.race,
      classe: collectedData.classe,
      age: collectedData.age,
      corps: collectedData.corps,
      intellect: collectedData.intellect,
      agilité: collectedData.agilité,
      sociale: collectedData.sociale,
    };

    for (const domaine of ["corps", "intellect", "agilité", "sociale"]) {
      characterSheet[`${domaine}-sous-comp`] = {};
      for (const q of sousCompetenceQuestions.filter((x) =>
        x.key.startsWith(`${domaine}-sous-comp::`)
      )) {
        const key = q.key.split("::")[1];
        characterSheet[`${domaine}-sous-comp`][key] = collectedData[q.key];
      }
    }

    accounts.users.push({
      username: collectedData.username,
      passwordHash,
      characterSheet,
    });

    fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2), "utf8");
    return channel.send(
      "✅ Ton compte et ton personnage ont été enregistrés !"
    );
  },
};
