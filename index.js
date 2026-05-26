const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ActionRowBuilder,
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

// ===== GLOBAL =====
let statusMessage = null;

// ===== EMOJI =====
const DL = "<:DL:1508062516067045478>";
const YELLOWSTAR = "<:YELLOWSTAR:1508062626284961872>";
const PACK_1 = "<:PACK_1:1508079141034004573>";
const PACK_2 = "<:PACK_2:1508079327420350554>";
const PACK_3 = "<:PACK_3:1508079419934249031>";
const RIGHTWING = "<:RIGHTWING:1508078210401959997>";
const LEFTWING = "<:LEFTWING:1508078152935669911>";
const VERIFIED = "<:VERIFIED:1508075987227906138>";
const BGL = "<:BGL:1508256826385502228>";
const OPENSIGN = "<:OPENSIGN:1508740529653940294>";
const CLOSEDSIGN = "<:CLOSEDSIGN:1508740634813665320>";

// ===== FORMAT =====
function formatCurrency(dlAmount) {
  const bgl = Math.floor(dlAmount / 100);
  const dl = dlAmount % 100;
  if (bgl > 0 && dl > 0) return `${bgl}${BGL} ${dl}${DL}`;
  if (bgl > 0) return `${bgl}${BGL}`;
  return `${dl}${DL}`;
}

// ===== XP TABLE =====
const totalXP = { /* tetap sama */ };

// ===== COMMAND =====
const commands = [
  new SlashCommandBuilder().setName("calculator").setDescription("XP Calculator"),
  new SlashCommandBuilder().setName("open").setDescription("Set OPEN"),
  new SlashCommandBuilder().setName("closed").setDescription("Set CLOSED")
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands("1507572125202911344", "1502085438674833558"),
    { body: commands }
  );
})();

// ===== OWNER CHECK =====
async function isOwner(interaction) {
  const guild = await interaction.guild.fetch();
  return interaction.user.id === guild.ownerId;
}

// ===== READY =====
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ===== INTERACTION =====
client.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand()) {

    // ===== CALCULATOR =====
    if (interaction.commandName === "calculator") {
      const modal = new ModalBuilder()
        .setCustomId("calc")
        .setTitle("XP Calculator");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("lvlNow").setLabel("Start Level").setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("lvlTarget").setLabel("Target Level").setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("xpNow").setLabel("Start XP").setStyle(TextInputStyle.Short)
        )
      );

      return interaction.showModal(modal);
    }

    // ===== OWNER CHECK =====
    if (["open", "closed"].includes(interaction.commandName)) {
      const owner = await isOwner(interaction);
      if (!owner) {
        return interaction.reply({
          content: "❌ Only server owner can use this command!",
          ephemeral: true
        });
      }
    }

    // ===== OPEN / CLOSED =====
    if (interaction.commandName === "open" || interaction.commandName === "closed") {

      const isOpen = interaction.commandName === "open";

      client.user.setPresence({
        activities: [{ name: isOpen ? "🟢 OPEN" : "🔴 CLOSED", type: 0 }],
        status: isOpen ? "online" : "dnd"
      });

      const embed = new EmbedBuilder()
        .setColor(isOpen ? "Green" : "Red")
        .setTitle(`${LEFTWING} WOWLVL STATUS ${RIGHTWING}`)
        .setDescription(
          isOpen
            ? `${OPENSIGN} **SERVICE IS NOW OPEN** ${OPENSIGN}`
            : `${CLOSEDSIGN} **SERVICE IS CURRENTLY CLOSED** ${CLOSEDSIGN}`
        )
        .addFields(
          { name: "Status", value: isOpen ? "🟢 OPEN" : "🔴 CLOSED", inline: true },
          { name: "Info", value: isOpen ? "Order now!" : "Please wait...", inline: true }
        );

      // ===== AUTO EDIT =====
      if (statusMessage) {
        await statusMessage.edit({
          content: "@everyone",
          embeds: [embed],
          allowedMentions: { parse: ["everyone"] }
        });

        return interaction.reply({
          content: "✅ Status updated!",
          ephemeral: true
        });
      }

      const msg = await interaction.reply({
        content: "@everyone",
        embeds: [embed],
        allowedMentions: { parse: ["everyone"] },
        fetchReply: true
      });

      statusMessage = msg;
    }
  }

  // ===== MODAL =====
  if (interaction.isModalSubmit()) {

    const start = parseInt(interaction.fields.getTextInputValue("lvlNow"));
    const target = parseInt(interaction.fields.getTextInputValue("lvlTarget"));
    const currentXP = parseInt(interaction.fields.getTextInputValue("xpNow"));

    if (!totalXP[start] || !totalXP[target] || start >= target) {
      return interaction.reply({ content: "❌ Level tidak valid", ephemeral: true });
    }

    let neededXP = (totalXP[target] - totalXP[start]) - currentXP;
    if (neededXP > 0) neededXP += 1;
    if (neededXP < 0) neededXP = 0;

    const embed = new EmbedBuilder()
      .setTitle(`${LEFTWING} Need Level? Go WOWLVL ${RIGHTWING}`)
      .addFields(
        { name: `${YELLOWSTAR} Level`, value: `${start} → ${target}` },
        { name: "Total XP", value: neededXP.toLocaleString() }
      );

    return interaction.reply({ embeds: [embed] });
  }

});

client.login(process.env.TOKEN);
