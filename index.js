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
const totalXP = {
1:100,2:250,3:550,4:1100,5:2000,6:3350,7:5250,8:7800,9:11100,10:15250,
11:20350,12:26500,13:33800,14:42350,15:52250,16:63600,17:76500,18:91050,19:107350,20:125500,
21:145600,22:167750,23:192050,24:218600,25:247500,26:278850,27:312750,28:349300,29:388600,30:430750,
31:475850,32:524000,33:575300,34:629850,35:687750,36:749100,37:814000,38:882550,39:954850,40:1031000,
41:1111100,42:1195250,43:1283550,44:1376100,45:1473000,46:1574350,47:1680250,48:1790800,49:1906100,50:2026250,
51:2151350,52:2281500,53:2416800,54:2557350,55:2703250,56:2854600,57:3011500,58:3174050,59:3342350,60:3516500,
61:3696600,62:3882750,63:4075050,64:4273600,65:4478500,66:4689850,67:4907750,68:5132300,69:5363600,70:5601750,
71:5846850,72:6099000,73:6358300,74:6624850,75:6898750,76:7180100,77:7469000,78:7765550,79:8069850,80:8382000,
81:8702100,82:9030250,83:9366550,84:9711100,85:10064000,86:10425350,87:10795250,88:11173800,89:11561100,90:11957250,
91:12362350,92:12776500,93:13199800,94:13632350,95:14074250,96:14525600,97:14986500,98:15457050,99:15937350,100:16427500,
101:16927600,102:17437750,103:17958050,104:18488600,105:19029500,106:19580850,107:20142750,108:20715300,109:21298600,110:21892750,
111:22497850,112:23114000,113:23741300,114:24379850,115:25029750,116:25691100,117:26364000,118:27048550,119:27744850,120:28453000,
121:29173100,122:29905250,123:30649550,124:31406100,125:32175000
};

// ===== COMMAND =====
const commands = [
new SlashCommandBuilder().setName("calculator").setDescription("XP Calculator"),
new SlashCommandBuilder().setName("open").setDescription("Set OPEN"),
new SlashCommandBuilder().setName("closed").setDescription("Set CLOSED")
].map(cmd => cmd.toJSON());

// ===== REGISTER =====
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
try {
console.log("Registering commands...");
await rest.put(
Routes.applicationGuildCommands("1507572125202911344", "1502085438674833558"),
{ body: commands }
);
console.log("Commands registered!");
} catch (err) {
console.error(err);
}
})();

// ===== READY FIX =====
client.on("clientReady", () => {
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

if (["open", "closed"].includes(interaction.commandName)) {
const owner = await isOwner(interaction);
if (!owner) {
return interaction.reply({ content: "❌ Only owner!", ephemeral: true });
}
}

if (interaction.commandName === "open") {

client.user.setPresence({
activities: [{ name: "🟢 OPEN" }],
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
allowedMentions: { parse: ["everyone"] }
});

lastStatusMessage = msg;
}

if (interaction.commandName === "closed") {

client.user.setPresence({
activities: [{ name: "🔴 CLOSED" }],
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
allowedMentions: { parse: ["everyone"] }
});

lastStatusMessage = msg;
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
neededXP = Math.round(neededXP);
if (neededXP > 0) neededXP += 1;
if (neededXP < 0) neededXP = 0;

const base = 8;
const coconut = 50;
const dragon = 200;

const pack1XP = base + coconut + dragon;
const pack23XP = (base + coconut + dragon) * 1.2;

const results = [

(() => {
const ghosts = Math.floor(129000 / pack1XP);
const total = ghosts * pack1XP;
const amount = Math.ceil(neededXP / total);
return { name: "Pack 1", amount, cost: amount * 20 };
})(),

(() => {
const ghosts = Math.floor(619200 / pack23XP);
const total = ghosts * pack23XP;
const amount = Math.ceil(neededXP / total);
return { name: "Pack 2", amount, cost: amount * 40 };
})(),

(() => {
const ghosts = Math.floor(1238400 / pack23XP);
const total = ghosts * pack23XP;
const amount = Math.ceil(neededXP / total);
return { name: "Pack 3", amount, cost: amount * 75 };
})()

];

const best = results.reduce((a, b) => a.cost < b.cost ? a : b);

const embed = new EmbedBuilder()
.setTitle(`${LEFTWING} Need Level? Go WOWLVL ${RIGHTWING}`)
.addFields(
{ name: `${YELLOWSTAR} Level`, value: `${start} → ${target}` },
{ name: "Total XP", value: neededXP.toLocaleString() },
{ name: `Pack ${PACK_1}`, value: `${results[0].amount}x (${formatCurrency(results[0].cost)})` },
{ name: `Pack ${PACK_2}`, value: `${results[1].amount}x (${formatCurrency(results[1].cost)})` },
{ name: `Pack ${PACK_3}`, value: `${results[2].amount}x (${formatCurrency(results[2].cost)})` },
{ name: `Best Pack ${VERIFIED}`, value: `${best.name} (${formatCurrency(best.cost)})` }
);

return interaction.reply({ embeds: [embed] });
}

});

client.login(process.env.TOKEN);
