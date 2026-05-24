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

// ===== RUMUS XP BARU =====
function getXPBetween(start, target) {
  let total = 0;

  for (let lvl = start; lvl < target; lvl++) {
    const xp = Math.floor(50 + (10 * lvl * lvl) + (0.5 * lvl * lvl * lvl));
    total += xp;
  }

  return total;
}

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
    Routes.applicationGuildCommands("YOUR_CLIENT_ID", "YOUR_GUILD_ID"),
    { body: commands }
  );
})();

// ===== INTERACTION =====
client.on("interactionCreate", async (interaction) => {

  // STEP 1
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

  // STEP 2
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "calcModal") {

      userData[interaction.user.id] = {
        currentLevel: parseInt(interaction.fields.getTextInputValue("currentLevel")),
        targetLevel: parseInt(interaction.fields.getTextInputValue("targetLevel")),
        currentXP: parseInt(interaction.fields.getTextInputValue("currentXP"))
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

  // STEP 3 & 4
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "mode") {

      const menu = new StringSelectMenuBuilder()
        .setCustomId("buff")
        .setPlaceholder("XP Boost")
        .addOptions([
          { label: "No Buff", value: "none" },
          { label: "Ancestral Totem (+5%)", value: "totem" },
          { label: "Ring of Wisdom (+10%)", value: "ring" },
          { label: "Gingerbread Cookie (Triple XP)", value: "cookie" },
          { label: "Ghost Dragon Charm (+200 XP/ghost)", value: "dragon" }
        ]);

      await interaction.update({
        content: "Pilih XP Boost:",
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }

    if (interaction.customId === "buff") {

      const data = userData[interaction.user.id];

      const start = data.currentLevel;
      const target = data.targetLevel;
      const currentXP = data.currentXP;
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
