// === BOT DISCORD ===
const { Client, GatewayIntentBits } = require("discord.js");
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const TOKEN = process.env.TOKEN;
const ROLE_ID = process.env.ROLE_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

client.on("ready", () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  console.log(`[DEBUG] Vérification de ${newMember.user.tag}`);

  if (!oldMember.roles.cache.has(ROLE_ID) && newMember.roles.cache.has(ROLE_ID)) {
    setTimeout(async () => {
      let executor = null;

      try {
        const auditLogs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 5 });

        const entry = auditLogs.entries.find(entry =>
          entry.target.id === newMember.id &&
          entry.changes?.some(change =>
            change.key === '$add' &&
            change.new?.some(role => role.id === ROLE_ID)
          )
        );

        if (entry) {
          executor = entry.executor;
        }
      } catch (err) {
        console.error('❌ Erreur en récupérant les logs d’audit :', err);
      }

      const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        logChannel.send(
          `[WL Ajouté] ${executor ? executor : 'un modérateur inconnu'} a ajouté <@&${ROLE_ID}> à ${newMember}`
        );
      }
    }, 1500);
  }
});

client.login(TOKEN).catch(err => {
  console.error("❌ Erreur de connexion au bot :", err);
});

// === SERVEUR EXPRESS POUR UPTIMEROBOT ===
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot actif 🚀');
});

app.listen(PORT, () => {
  console.log(`🌐 Serveur Express actif sur le port ${PORT}`);
});
