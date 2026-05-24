const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  REST,
  Routes,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let lastStickyMessageId = null;
let userData = {};

const IMAGE_URL = "https://cdn.discordapp.com/attachments/1507770268611903548/1507770550469005483/Transparent_Background.png";

// ===== STICKY =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  try {
    if (lastStickyMessageId) {
      const oldMsg = await message.channel.messages.fetch(lastStickyMessageId);
      if (oldMsg) await oldMsg.delete();
    }

    const newMsg = await message.channel.send({
      content: "Need Level? Go **WOWLVL**",
      files: [IMAGE_URL]
    });

    lastStickyMessageId = newMsg.id;
  } catch (err) {
    console.log(err);
  }
});

// ===== REGISTER COMMAND =====
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

// ===== FUNCTION XP =====
function calculateXP(start, target) {
  let total = 0;

  for (let lvl = start; lvl < target; lvl++) {
    total += 50 + (lvl * lvl * 10);
  }

  return total;
}

// ===== INTERACTION =====
client.on("interactionCreate", async (interaction) => {

  // STEP 1 - OPEN FORM
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "calculator") {

      const modal = new ModalBuilder()
        .setCustomId("calcModal")
        .setTitle("XP Calculator");

      const input1 = new TextInputBuilder()
        .setCustomId("currentLevel")
        .setLabel("Level sekarang")
        .setStyle(TextInputStyle.Short);

      const input2 = new TextInputBuilder()
        .setCustomId("targetLevel")
        .setLabel("Level tujuan")
        .setStyle(TextInputStyle.Short);

      const input3 = new TextInputBuilder()
        .setCustomId("currentXP")
        .setLabel("XP sekarang")
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(input1),
        new ActionRowBuilder().addComponents(input2),
        new ActionRowBuilder().addComponents(input3)
      );

      await interaction.showModal(modal);
    }
  }

  // STEP 2 - SAVE DATA
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

      await interaction.reply({
        content: "Pilih metode:",
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }
  }

  // STEP 3 - PILIH MODE
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

      await interaction.update({
        content: "Pilih XP Boost:",
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }

    // STEP 4 - HITUNG
    if (interaction.customId === "buff") {

      const data = userData[interaction.user.id];

      const start = parseInt(data.currentLevel);
      const target = parseInt(data.targetLevel);
      const currentXP = parseInt(data.currentXP);
      const buff = parseInt(interaction.values[0]);

      let neededXP = calculateXP(start, target) - currentXP;
      let finalXP = Math.floor(neededXP / (1 + buff / 100));

      const embed = new EmbedBuilder()
        .setTitle("📊 Hasil Calculator")
        .addFields(
          { name: "Level", value: `${start} → ${target}` },
          { name: "XP Awal", value: currentXP.toLocaleString() },
          { name: "XP Dibutuhkan", value: neededXP.toLocaleString() },
          { name: "Setelah Buff", value: finalXP.toLocaleString() }
        );

      await interaction.update({
        embeds: [embed],
        components: []
      });
    }
  }

});

// ===== LOGIN =====
client.login(process.env.TOKEN);
