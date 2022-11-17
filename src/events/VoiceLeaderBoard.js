const cfg = require("../configs/settings.json")
const voiceUser = require("../schemas/voiceUser");
const sex = require("../schemas/leaderboard");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");
const client = global.bot;

module.exports = async () => {
    const voiceUsersData = await voiceUser.find({ guildID: cfg.guildID }).sort({ topStat: -1 });
    const voiceUsers = voiceUsersData.splice(0, 30).map((x, index) => `[\`${index+1}.\`] <@${x.userID}> **:** \`${moment.duration(x.topStat).format("H [saat], m [dakika]")}\``).join(`\n`);

    let data = await sex.findOne({ guildID: cfg.guildID })
    if (!data || data && !data.voiceListID.length) return

  const sunucuisim = client.guilds.cache.get(cfg.guildID).name
  let LeaderBoard = await client.channels.cache.find(x => x.name == "leaderboard").messages.fetch(data.voiceListID);
  setInterval(() => {
  checkingLeader()
  }, 600000);
  function checkingLeader() {  
  const voiceList = (`${voiceUsers.length > 0 ? voiceUsers : "Veri Bulunmuyor."}`)

  let MessageEdit = new MessageEmbed()
  .setColor("#2f3136")
  .setAuthor({ name: client.guilds.cache.get(cfg.guildID).name, iconURL: client.guilds.cache.get(cfg.guildID).iconURL({dynamic:true})})
  .setDescription(`🎉 Aşağı da \`${sunucuisim}\` sunucusunun genel ses sıralaması listelenmektedir.\n\n${voiceList}\n\nGüncellenme Tarihi: <t:${Math.floor(Date.now() / 1000)}:R>`)
  LeaderBoard.edit({ embeds: [MessageEdit]})

}
}
module.exports.conf = {
  name: "ready",
};