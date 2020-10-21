const Discord = require("discord.js");

exports.logoPNG = "https://cdn.discordapp.com/attachments/728461529493667882/767063972779130880/No_BG.png";
exports.logoGIF = "https://cdn.discordapp.com/attachments/767320220842459157/767320297559949342/logo.gif";

exports.INDEmbed = class INDEmbed extends Discord.MessageEmbed{
    constructor(data) {
        super(data);
        this.author = data.author ? data.author : {name: "IND Bot", iconURL: exports.logoGIF};
        this.title = data.title ? data.title : "IND Clan";
        this.color = data.color ? data.color : exports.HEXToVBColor("FFA800");
        //this.thumbnail = data.thumbnail ? data.thumbnail : exports.logoPNG;
        this.footer = data.footer ? data.footer : {text: "Bot by Keval#8167", iconURL: "https://cdn.discordapp.com/attachments/767320220842459157/767423225978028092/face-trace.png"};
    }
}

exports.HEXToVBColor = (rrggbb) => {
    return parseInt(rrggbb, 16);
}

exports.infoEmbed = new this.INDEmbed({
    description: "IND is a competitive asian clan. The #1 clan in India and accepting players from all over asia. Looking for players who are willing to discover the competitive scene and participate in regular scrimmages and Krunker weeklies.",
    fields: [
        {name: "Owner", value: "<@479968918623092746>", inline: true},
        {name: "Members", value: "Total: 32", inline: true},
        {name: "Captains", value: "<@246227466920656899>  <@321692335765454849>", inline: true}
    ],
    thumbnail: { url: exports.logoPNG },
})

exports.senderIsAdmin = (msg) => Boolean(msg.member.roles.cache.find(value => value == "Admin"));