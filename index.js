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

// ===== XP TABLE FULL =====
const xpTable = {
  1: 0,2: 50,3: 150,4: 300,5: 500,6: 750,7: 1050,8: 1400,9: 1800,10: 2250,
  11: 2750,12: 3300,13: 3900,14: 4550,15: 5250,16: 6000,17: 6800,18: 7650,19: 8550,20: 9500,
  21: 10500,22: 11550,23: 12650,24: 13800,25: 15000,26: 16250,27: 17550,28: 18900,29: 20300,30: 21750,
  31: 23250,32: 24800,33: 26400,34: 28050,35: 29750,36: 31500,37: 33300,38: 35150,39: 37050,40: 39000,
  41: 41000,42: 43050,43: 45150,44: 47300,45: 49500,46: 51750,47: 54050,48: 56400,49: 58800,50: 61250,
  51: 63750,52: 66300,53: 68900,54: 71550,55: 74250,56: 77000,57: 79800,58: 82650,59: 85550,60: 88500,
  61: 91500,62: 94550,63: 97650,64: 100800,65: 104000,66: 107250,67: 110550,68: 113900,69: 117300,70: 120750,
  71: 124250,72: 127800,73: 131400,74: 135050,75: 138750,76: 142500,77: 146300,78: 150150,79: 154050,80: 158000,
  81: 162000,82: 166050,83: 170150,84: 174300,85: 178500,86: 182750,87: 187050,88: 191400,89: 195800,90: 200250,
  91: 204750,92: 209300,93: 213900,94: 218550,95: 223250,96: 228000,97: 232800,98: 237650,99: 242550,100: 247500,
  101: 252500,102: 257550,103: 262650,104: 267800,105: 273000,106: 278250,107: 283550,108: 288900,109: 294300,110: 299750,
  111: 305250,112: 310800,113: 316400,114: 322050,115: 327750,116: 333500,117: 339300,118: 345150,119: 351050,120: 357000,
  121: 363000,122: 369050,123: 375150,124: 381300,125: 387500
};

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

// ===== INTERACTION =====
client.on("interactionCreate", async (interaction) => {

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
        .addOptions([{ label: "Ghost Catching", value: "ghost" }]);

      await interaction.reply({
        content: "Pilih metode:",
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }
  }

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

      const xpNow = xpTable[start];
      const xpTarget = xpTable[target];

      let neededXP = xpTarget - xpNow - currentXP;
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
