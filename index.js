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

// ===== XP TABLE REAL (TOTAL XP) =====
const totalXP = {
  1: 100, 2: 250, 3: 550, 4: 1100, 5: 2000,
  6: 3350, 7: 5250, 8: 7800, 9: 11100, 10: 15250,
  11: 20350, 12: 26500, 13: 33800, 14: 42350, 15: 52250,
  16: 63600, 17: 76500, 18: 91050, 19: 107350, 20: 125500,
  21: 145600, 22: 167750, 23: 192050, 24: 218600, 25: 247500,
  26: 278850, 27: 312750, 28: 349300, 29: 388600, 30: 430750,
  31: 475850, 32: 524000, 33: 575300, 34: 629850, 35: 687750,
  36: 749100, 37: 814000, 38: 882550, 39: 954850, 40: 1031000,
  41: 1111100, 42: 1195250, 43: 1283550, 44: 1376100, 45: 1473000,
  46: 1574350, 47: 1680250, 48: 1790800, 49: 1906100, 50: 2026250,
  51: 2151350, 52: 2281500, 53: 2416800, 54: 2557350, 55: 2703250,
  56: 2854600, 57: 3011500, 58: 3174050, 59: 3342350, 60: 3516500,
  61: 3696600, 62: 3882750, 63: 4075050, 64: 4273600, 65: 4478500,
  66: 4689850, 67: 4907750, 68: 5132300, 69: 5363600, 70: 5601750,
  71: 5846850, 72: 6099000, 73: 6358300, 74: 6624850, 75: 6898750,
  76: 7180100, 77: 7469000, 78: 7765550, 79: 8069850, 80: 8382000,
  81: 8702100, 82: 9030250, 83: 9366550, 84: 9711100, 85: 10064000,
  86: 10425350, 87: 10795250, 88: 11173800, 89: 11561100, 90: 11957250,
  91: 12362350, 92: 12776500, 93: 13199800, 94: 13632350, 95: 14074250,
  96: 14525600, 97: 14986500, 98: 15457050, 99: 15937350, 100: 16427500,
  101: 16927600, 102: 17437750, 103: 17958050, 104: 18488600, 105: 19029500,
  106: 19580850, 107: 20142750, 108: 20715300, 109: 21298600, 110: 21892750,
  111: 22497850, 112: 23114000, 113: 23741300, 114: 24379850, 115: 25029750,
  116: 25691100, 117: 26364000, 118: 27048550, 119: 27744850, 120: 28453000,
  121: 29173100, 122: 29905250, 123: 30649550, 124: 31406100, 125: 32175000
};

// ===== XP PER GHOST =====
function getGhostXP() {
  return 1 + Math.floor(38 / 5); // = 8
}

// ===== STICKY =====
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
      content: "Need Level? Go **WOWLVL** 👻",
      files: [IMAGE_URL]
    });

    lastStickyMessageId = newMsg.id;

  } catch (err) {
    console.log(err);
  }
});

// ===== COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName("calculator")
    .setDescription("Growtopia XP Calculator")
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

    const modal = new ModalBuilder()
      .setCustomId("calc")
      .setTitle("XP Calculator");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("lvlNow").setLabel("Level Now").setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("lvlTarget").setLabel("Goal Level").setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("xpNow").setLabel("XP Level Now").setStyle(TextInputStyle.Short)
      )
    );

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit()) {

    const start = parseInt(interaction.fields.getTextInputValue("lvlNow"));
    const target = parseInt(interaction.fields.getTextInputValue("lvlTarget"));
    const currentXP = parseInt(interaction.fields.getTextInputValue("xpNow"));

    if (!totalXP[start] || !totalXP[target]) {
      return interaction.reply({ content: "❌ Level harus 1 - 125", ephemeral: true });
    }

    let neededXP = totalXP[target] - totalXP[start] - currentXP;
    if (neededXP < 0) neededXP = 0;

    const ghostXP = getGhostXP();
    const ghostNeeded = Math.ceil(neededXP / ghostXP);

    const embed = new EmbedBuilder()
      .setTitle("👻 Growtopia Calculator")
      .addFields(
        { name: "Level", value: `${start} → ${target}` },
        { name: "XP Needed", value: neededXP.toLocaleString() },
        { name: "XP per Ghost", value: ghostXP.toString() },
        { name: "Ghost Needed", value: ghostNeeded.toLocaleString() }
      );

    await interaction.reply({ embeds: [embed] });
  }

});

// ===== LOGIN =====
client.login(process.env.TOKEN);
