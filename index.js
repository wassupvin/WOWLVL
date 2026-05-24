const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  REST,
  Routes
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let lastStickyMessageId = null;

// 👉 GANTI DENGAN LINK FOTO KAMU
const IMAGE_URL = "https://cdn.discordapp.com/attachments/1507770268611903548/1507770550469005483/Transparent_Background.png?ex=6a131c40&is=6a11cac0&hm=b092c31f30068530f0ff40620ce65d1a9b9ff3aa11826b141618124e615e732f&";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const channel = message.channel;

  try {
    // hapus sticky lama
    if (lastStickyMessageId) {
      const oldMsg = await channel.messages.fetch(lastStickyMessageId);
      if (oldMsg) await oldMsg.delete();
    }

    // kirim sticky baru (foto)
    const newMsg = await channel.send({
      content: "Need Level? Go **WOWLVL**",
      files: [IMAGE_URL]
    });

    // simpan ID
    lastStickyMessageId = newMsg.id;

  } catch (err) {
    console.log("Error:", err.message);
  }
});
const commands = [
  new SlashCommandBuilder()
    .setName("calculator")
    .setDescription("XP Calculator")
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands("1507572125202911344", "1502085438674833558"),
    { body: commands }
  );
})();
client.login(process.env.TOKEN);
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

let userData = {};

client.on("interactionCreate", async (interaction) => {

  // 🔹 STEP 1: COMMAND
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "calculator") {

      const modal = new ModalBuilder()
        .setCustomId("calcModal")
        .setTitle("XP Calculator");

      const currentLevel = new TextInputBuilder()
        .setCustomId("currentLevel")
        .setLabel("Level sekarang")
        .setStyle(TextInputStyle.Short);

      const targetLevel = new TextInputBuilder()
        .setCustomId("targetLevel")
        .setLabel("Level tujuan")
        .setStyle(TextInputStyle.Short);

      const currentXP = new TextInputBuilder()
        .setCustomId("currentXP")
        .setLabel("XP sekarang")
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(currentLevel),
        new ActionRowBuilder().addComponents(targetLevel),
        new ActionRowBuilder().addComponents(currentXP)
      );

      await interaction.showModal(modal);
    }
  }

  // 🔹 STEP 2: SUBMIT FORM
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "calcModal") {

      userData[interaction.user.id] = {
        currentLevel: interaction.fields.getTextInputValue("currentLevel"),
        targetLevel: interaction.fields.getTextInputValue("targetLevel"),
        currentXP: interaction.fields.getTextInputValue("currentXP")
      };

      const menu = new StringSelectMenuBuilder()
        .setCustomId("mode")
        .setPlaceholder("Pilih metode")
        .addOptions([
          { label: "Ghost Catching", value: "ghost" }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        content: "Pilih metode:",
        components: [row]
      });
    }
  }

  // 🔹 STEP 3: PILIH MODE
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "mode") {

      const menu = new StringSelectMenuBuilder()
        .setCustomId("buff")
        .setPlaceholder("XP Boost")
        .addOptions([
          { label: "No Buff", value: "0" },
          { label: "5%", value: "5" },
          { label: "10%", value: "10" }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.update({
        content: "Pilih XP Boost:",
        components: [row]
      });
    }

    // 🔹 STEP 4: HITUNG
    if (interaction.customId === "buff") {

      const data = userData[interaction.user.id];
      const buff = parseInt(interaction.values[0]);

      const baseXP = 32174900;
      const result = Math.floor(baseXP / (1 + buff / 100));

      const embed = new EmbedBuilder()
        .setTitle("📊 Hasil Calculator")
        .addFields(
          { name: "Level", value: `${data.currentLevel} → ${data.targetLevel}` },
          { name: "XP Awal", value: data.currentXP },
          { name: "XP Dibutuhkan", value: result.toLocaleString() }
        );

      await interaction.update({
        embeds: [embed],
        components: []
      });
    }
  }

});

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "calculator") {

      const embed = new EmbedBuilder()
        .setTitle("⭐ Calculator")
        .setDescription("Pilih menu di bawah")
        .setColor(0x00ffcc);

      const menu = new StringSelectMenuBuilder()
        .setCustomId("menu")
        .setPlaceholder("Pilih fitur")
        .addOptions([
          { label: "Ghost Catching", value: "ghost" },
          { label: "XP Buff", value: "buff" }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  if (interaction.isStringSelectMenu()) {

    if (interaction.values[0] === "ghost") {
      await interaction.update({
        content: "👻 Ghost dipilih!",
        embeds: [],
        components: []
      });
    }

    if (interaction.values[0] === "buff") {
      await interaction.update({
        content: "⚡ Buff dipilih!",
        embeds: [],
        components: []
      });
    }
  }

});
