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
client.on("interactionCreate", async (interaction) => {

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
