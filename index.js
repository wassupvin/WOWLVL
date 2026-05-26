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
let lastStatusMessage = null;

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
const totalXP = { /* (tetep sama, gak gue ubah) */ };

// ===== COMMAND =====
const commands = [
new SlashCommandBuilder().setName("calculator").setDescription("XP Calculator"),
new SlashCommandBuilder().setName("open").setDescription("Set OPEN"),
new SlashCommandBuilder().setName("closed").setDescription("Set CLOSED"),

// ✅ TESTI COMMAND
new SlashCommandBuilder()
.setName("testi")
.setDescription("Send testimonial (Owner only)")
.addStringOption(option =>
option.setName("level")
.setDescription("Level (contoh: 10 → 50)")
.setRequired(true))
.addAttachmentOption(option =>
option.setName("bukti")
.setDescription("Screenshot bukti")
.setRequired(true))
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
await rest.put(
Routes.applicationGuildCommands("1507572125202911344", "1502085438674833558"),
// ✅ FIX PENTING
{ body: commands.map(cmd => cmd.toJSON()) }
);
})();

// ===== READY =====
client.on("ready", () => {
console.log(`Logged in as ${client.user.tag}`);
});

// ===== OWNER CHECK =====
async function isOwner(interaction) {
const guild = await interaction.guild.fetch();
return interaction.user.id === guild.ownerId;
}

// ===== INTERACTION =====
client.on("interactionCreate", async (interaction) => {

if (interaction.isChatInputCommand()) {

// ✅ TAMBAH TESTI KE OWNER CHECK
if (["open", "closed", "testi"].includes(interaction.commandName)) {
const owner = await isOwner(interaction);
if (!owner) {
return interaction.reply({ content: "❌ Only owner!", ephemeral: true });
}
}

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

// ===== TESTI =====
if (interaction.commandName === "testi") {

const level = interaction.options.getString("level");
const image = interaction.options.getAttachment("bukti");

const embed = new EmbedBuilder()
.setColor("Gold")
.setTitle("📢 TESTIMONIAL WOWLVL")
.addFields(
{ name: "Level", value: level },
{ name: "Status", value: "✅ Order Completed" }
)
.setImage(image.url);

return interaction.reply({ embeds: [embed] });
}

// ===== OPEN =====
if (interaction.commandName === "open") {
client.user.setPresence({
activities: [{ name: "🟢 OPEN", type: 0 }],
status: "online"
});

const embed = new EmbedBuilder()
.setColor("Green")
.setTitle(`${LEFTWING} WOWLVL STATUS ${RIGHTWING}`)
.setDescription(`${OPENSIGN} **SERVICE IS NOW OPEN** ${OPENSIGN}`)
.addFields(
{ name: "Status", value: `${OPENSIGN} OPEN`, inline: true },
{ name: "Info", value: "Order now!", inline: true }
);

if (lastStatusMessage) {
try { await lastStatusMessage.delete(); } catch {}
}

const msg = await interaction.reply({
content: "@everyone",
embeds: [embed],
allowedMentions: { parse: ["everyone"] },
fetchReply: true
});

lastStatusMessage = msg;
}

// ===== CLOSED =====
if (interaction.commandName === "closed") {
client.user.setPresence({
activities: [{ name: "🔴 CLOSED", type: 0 }],
status: "dnd"
});

const embed = new EmbedBuilder()
.setColor("Red")
.setTitle(`${LEFTWING} WOWLVL STATUS ${RIGHTWING}`)
.setDescription(`${CLOSEDSIGN} **SERVICE CLOSED** ${CLOSEDSIGN}`)
.addFields(
{ name: "Status", value: `${CLOSEDSIGN} CLOSED`, inline: true },
{ name: "Info", value: "Please wait until service open.", inline: true }
);

if (lastStatusMessage) {
try { await lastStatusMessage.delete(); } catch {}
}

const msg = await interaction.reply({
content: "@everyone",
embeds: [embed],
allowedMentions: { parse: ["everyone"] },
fetchReply: true
});

lastStatusMessage = msg;
}
}

if (interaction.isModalSubmit()) {
// (SEMUA CALCULATOR LU TETEP, GAK DIUBAH)
}

});

client.login(process.env.TOKEN);
