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

const IMAGE_URL = "https://cdn.discordapp.com/attachments/1507770268611903548/1507940635619889315/Transparent_Background.png?ex=6a13baa7&is=6a126927&hm=a34b7b16945c8e5d2b4926ff459aa1dea34bc5a35ffd5e64bf61259b376e9355&";

// ===== XP FUNCTION =====
function getXPBetween(start, target) {
  let total = 0;
  for (let lvl = start; lvl < target; lvl++) {
    const xp = Math.floor(50 + (10 * lvl * lvl) + (0.5 * lvl * lvl * lvl));
    total += xp;
  }
  return total;
}

// ===== STICKY (ANTI ERROR) =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  try {
    if (lastStickyMessageId) {
      try {
        const oldMsg = await message.channel.messages.fetch(lastStickyMessageId);
        if (oldMsg) await oldMsg.delete();
      } catch {}
    }

    const newMsg = await message.channel.send({
      content: "Need Level? Go **WOWLVL**",
      files: [IMAGE_URL]
    });

    lastStickyMessageId = newMsg.id;

  } catch (err) {
    console.log("Sticky Error:", err.message);
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
  try {
    await rest.put(
      Routes.applicationGuildCommands("1507572125202911344", "1502085438674833558"),
      { body: commands }
    );
    console.log("Slash command registered");
  } catch (err) {
    console.log(err);
  }
})();

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

  // STEP 2 - SAVE INPUT
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "calcModal") {

      const start = parseInt(interaction.fields.getTextInputValue("currentLevel"));
      const target = parseInt(interaction.fields.getTextInputValue("targetLevel"));
      const currentXP = parseInt(interaction.fields.getTextInputValue("currentXP"));

      if (isNaN(start) || isNaN(target) || isNaN(currentXP)) {
        return interaction.reply({ content: "❌ Semua input harus angka!", ephemeral: true });
      }

      if (target <= start) {
        return interaction.reply({ content: "❌ Level tujuan harus lebih besar!", ephemeral: true });
      }

      userData[interaction.user.id] = { start, target, currentXP };

      const menu = new StringSelectMenuBuilder()
        .setCustomId("buff")
        .setPlaceholder("Pilih XP Boost")
        .addOptions([
          { label: "No Buff", value: "none" },
          { label: "Ancestral Totem (+5%)", value: "totem" },
          { label: "Ring of Wisdom (+10%)", value: "ring" },
          { label: "Gingerbread Cookie (Triple XP)", value: "cookie" },
          { label: "Ghost Dragon Charm (+200 XP/ghost)", value: "dragon" }
        ]);

      await interaction.reply({
        content: "Pilih XP Boost:",
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }
  }

  // STEP 3 - CALCULATE
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "buff") {

      const data = userData[interaction.user.id];
      if (!data) {
        return interaction.update({ content: "❌ Data tidak ditemukan", components: [] });
      }

      const { start, target, currentXP } = data;
      const buffType = interaction.values[0];

      let neededXP = getXPBetween(start, target) - currentXP;
      if (neededXP < 0) neededXP = 0;

      let finalXP = neededXP;
      let info = "";

      if (buffType === "totem") {
        finalXP = Math.floor(neededXP / 1.05);
        info = "+5% XP";
      }

      if (buffType === "ring") {
        finalXP = Math.floor(neededXP / 1.10);
        info = "+10% XP";
      }

      if (buffType === "cookie") {
        finalXP = Math.floor(neededXP / 3);
        info = "Triple XP";
      }

      if (buffType === "dragon") {
        const xpPerGhost = 300;
        finalXP = Math.ceil(neededXP / xpPerGhost);
        info = "+200 XP per ghost";
      }

      if (buffType === "none") {
        info = "No Buff";
      }

      const embed = new EmbedBuilder()
        .setTitle("📊 Hasil Calculator")
        .addFields(
          { name: "Level", value: `${start} → ${target}` },
          { name: "XP Dibutuhkan", value: neededXP.toLocaleString() },
          { name: "Buff", value: info },
          {
            name: buffType === "dragon" ? "Ghost Needed" : "Final XP",
            value: finalXP.toLocaleString()
          }
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
