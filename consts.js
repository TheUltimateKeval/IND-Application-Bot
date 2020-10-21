const Discord = require("discord.js");

exports.logoPNG = "https://cdn.discordapp.com/attachments/728461529493667882/767063972779130880/No_BG.png";
exports.logoGIF = "https://cdn.discordapp.com/attachments/767320220842459157/767320297559949342/logo.gif";

exports.embedPrototype = () => new Discord.MessageEmbed({
    author: {name: "IND Bot", iconURL: this.logoGIF},
    title: "IND Clan",
    color: this.HEXToVBColor("FFA800"),
    thumbnail: {url: this.logoPNG},
    footer: {text: "Bot by Keval#8167", iconURL: "https://cdn.discordapp.com/attachments/767320220842459157/767423225978028092/face-trace.png"},
});

exports.HEXToVBColor = (rrggbb) => {
    return parseInt(rrggbb, 16);
}

exports.infoEmbed = () => {
    const embed = exports.embedPrototype()
        .setDescription("IND is a competitive asian clan. The #1 clan in India and accepting players from all over asia. Looking for players who are willing to discover the competitive scene and participate in regular scrimmages and Krunker weeklies.")
        .addFields(
            {name: "Owner", value: "<@479968918623092746>", inline: true},
            {name: "Members", value: "Total: 32", inline: true},
            {name: "Captains", value: "<@246227466920656899>  <@321692335765454849>", inline: true}
        );
    return embed;
        
}

exports.senderIsAdmin = (msg) => Boolean(msg.member.roles.cache.find(value => value == "Admin"));