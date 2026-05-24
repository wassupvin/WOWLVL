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

// ===== XP PER BLOCK (RUMUS RESMI) =====
function getXPPerBlock(rarity) {
  return 1 + Math.floor(rarity / 5);
}

// ===== XP LEVEL =====
function getXPBetween(start, target) {
  let total = 0;
  for (let lvl = start; lvl < target; lvl++) {
    total += Math.floor(50 + (10 * lvl * lvl) + (0.5 * lvl * lvl * lvl));
  }
  return total;
}

// ===== STICKY MESSAGE =====
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
    console.log("Sticky Error:", err.message);
  }
});

// ===== REGISTER COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName("calculator")
    .setDescription("Growtopia XP Calculator")
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands("CLIENT_ID_KAMU", "GUILD_ID_KAMU"),
      { body: commands }
    );
    console.log("Command ready");
  } catch (err) {
    console.log(err);
  }
})();

// ===== INTERACTION =====
client.on("interactionCreate", async (interaction) => {

  // STEP 1: OPEN FORM
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "calculator") {

      const modal = new ModalBuilder()
        .setCustomId("calcModal")
        .setTitle("XP Calculator");

      const lvlNow = new TextInputBuilder()
        .setCustomId("lvlNow")
        .setLabel("Level sekarang")
        .setStyle(TextInputStyle.Short);

      const lvlTarget = new TextInputBuilder()
        .setCustomId("lvlTarget")
        .setLabel("Level tujuan")
        .setStyle(TextInputStyle.Short);

      const xpNow = new TextInputBuilder()
        .setCustomId("xpNow")
        .setLabel("XP sekarang")
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(lvlNow),
        new ActionRowBuilder().addComponents(lvlTarget),
        new ActionRowBuilder().addComponents(xpNow)
      );

      await interaction.showModal(modal);
    }
  }

  // STEP 2: INPUT
  if (interaction.isModalSubmit()) {

    const start = parseInt(interaction.fields.getTextInputValue("lvlNow"));
    const target = parseInt(interaction.fields.getTextInputValue("lvlTarget"));
    const currentXP = parseInt(interaction.fields.getTextInputValue("xpNow"));

    if (isNaN(start) || isNaN(target) || isNaN(currentXP)) {
      return interaction.reply({ content: "❌ Input harus angka!", ephemeral: true });
    }

    if (target <= start) {
      return interaction.reply({ content: "❌ Level tujuan harus lebih besar!", ephemeral: true });
    }

    userData[interaction.user.id] = { start, target, currentXP };

    const menu = new StringSelectMenuBuilder()
      .setCustomId("method")
      .setPlaceholder("Pilih metode")
      .addOptions([
        { label: "Ghost Catching", value: "ghost" }
      ]);

    await interaction.reply({
      content: "Pilih metode:",
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  }

  // STEP 3: METHOD
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "method") {

      const data = userData[interaction.user.id];

      const xpNeeded = getXPBetween(data.start, data.target) - data.currentXP;
      const ghostXP = getXPPerBlock(38); // ghost jar rarity 38
      const ghostNeeded = Math.ceil(xpNeeded / ghostXP);

      const embed = new EmbedBuilder()
        .setTitle("👻 Ghost Calculator")
        .addFields(
          { name: "Level", value: `${data.start} → ${data.target}` },
          { name: "XP Needed", value: xpNeeded.toLocaleString() },
          { name: "XP per Ghost", value: ghostXP.toString() },
          { name: "Ghost Needed", value: ghostNeeded.toLocaleString() }
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
