const coin = require("../../schemas/coin");
const moment = require("moment");
const ceza = require("../../schemas/ceza");
const cezapuan = require("../../schemas/cezapuan")
const jailLimit = new Map();
const ms = require("ms")
moment.locale("tr");
const conf = require("../../configs/sunucuayar.json")
const settings = require("../../configs/settings.json")
const { red, green, Revuu, kirmiziok } = require("../../configs/emojis.json")
module.exports = {
  conf: {
    aliases: ["reklam"],
    name: "reklamcı",
    help: "reklam"
  },

  run: async (client, message, args, embed) => {
    if (!message.member.permissions.has(8n) && !conf.jailHammer.some(x => message.member.roles.cache.has(x))) 
    {
    message.react(red)
    message.channel.send({ content :"Yeterli yetkin bulunmuyor!"}).then((e) => setTimeout(() => { e.delete(); }, 5000)); 
    return }
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) { message.channel.send({ content :"Bir üye belirtmelisin!"}).then((e) => setTimeout(() => { e.delete(); }, 5000));
    message.react(red) 
    return }
    if (conf.reklamRole.some(x => member.roles.cache.has(x))) { message.channel.send({ content :"Bu üye zaten jailde!"}).then((e) => setTimeout(() => { e.delete(); }, 5000));
    message.react(red) 
    return }
    const reason = args.slice(1).join("Sunucu İçi Reklam")
    if (message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send(embed.setDescription("Kendinle aynı yetkide ya da daha yetkili olan birini jailleyemezsin!"));
    if (!member.manageable) return message.channel.send({ content :"Bu üyeyi jailleyemiyorum!"});
    if (settings.jaillimit > 0 && jailLimit.has(message.author.id) && jailLimit.get(message.author.id) == settings.jaillimit) 
    {
    message.react(red)
    message.channel.send({ content :"Saatlik jail sınırına ulaştın!"}).then((e) => setTimeout(() => { e.delete(); }, 5000)); 
    return }
    await ceza.findOneAndUpdate({ guildID: message.guild.id, userID: member.user.id }, { $push: { ceza: 1 } }, { upsert: true });
    await ceza.findOneAndUpdate({ guildID: message.guild.id, userID: member.user.id }, { $inc: { top: 1 } }, { upsert: true });
    await ceza.findOneAndUpdate({ guildID: message.guild.id, userID: message.author.id }, { $inc: { JailAmount: 1 } }, {upsert: true});
    await coin.findOneAndUpdate({ guildID: member.guild.id, userID: member.user.id }, { $inc: { coin: -20 } }, { upsert: true });
    await cezapuan.findOneAndUpdate({ guildID: message.guild.id, userID: member.user.id }, { $inc: { cezapuan: 20 } }, { upsert: true });
    const cezapuanData = await cezapuan.findOne({ guildID: message.guild.id, userID: member.user.id });
    if(conf.cezapuanlog) message.guild.channels.cache.get(conf.cezapuanlog).send({ content :`${member} üyesi \`jail cezası\` alarak toplam \`${cezapuanData ? cezapuanData.cezapuan : 0} ceza puanına\` ulaştı!`});

    member.roles.cache.has(conf.boosterRolu) ? member.roles.set([conf.boosterRolu, conf.rekalmRole[0]]) : member.roles.set(conf.reklamRole)

    message.react(green)
    const penal = await client.penalize(message.guild.id, member.user.id, "REKLAM", true, message.author.id, reason);
    message.reply({ content :`${green} ${member.toString()} üyesi, ${message.author} tarafından, \`Sunucu İçi Reklam\` nedeniyle Cezalandırıldı! \`(Ceza ID: #${penal.id})\``}).then((e) => setTimeout(() => { e.delete(); }, 50000));
    if (settings.dmMessages) member.send({ content :`**${message.guild.name}** sunucusunda, **${message.author.tag}** tarafından, **Sunucu İçi Reklam** sebebiyle Cezalandırıldı.`}).catch(() => {});
    

    const log = embed
      .setAuthor({ name: member.user.username, iconURL:  member.user.displayAvatarURL({ dynamic: true }) })
      .setColor("#2f3136")
      .setDescription(`
${member.toString()} Adlı Kişiye Reklam Cezası Uygulandı

${Revuu} Ceza Veren Kişi : ${message.author} (\`${message.author.id}\`)
${kirmiziok} Ceza Sebebi: \`Sunucu İçi Reklam\`
      `)
      .setFooter({ text:`${moment(Date.now()).format("LLL")}    (Ceza ID: #${penal.id})` })

    message.guild.channels.cache.get(conf.jailLogChannel).wsend({ embeds: [log]});

    if (settings.jaillimit > 0) {
      if (!jailLimit.has(message.author.id)) jailLimit.set(message.author.id, 1);
      else jailLimit.set(message.author.id, jailLimit.get(message.author.id) + 1);
      setTimeout(() => {
        if (jailLimit.has(message.author.id)) jailLimit.delete(message.author.id);
      }, 1000 * 60 * 60);
    }
  },
};
