const Discord = require("discord.js");
const { DB } = require("./databasemanager");
const profilelink = "https://krunker.io/social.html?p=profile&q=";

exports.botChar = "%";

exports.logoPNG = "https://cdn.discordapp.com/attachments/728461529493667882/767063972779130880/No_BG.png";
exports.logoGIF = "https://cdn.discordapp.com/attachments/767320220842459157/767320297559949342/logo.gif";

exports.INDEmbed = class INDEmbed extends Discord.MessageEmbed{
    constructor(data) {
        super(data);
        this.author = data.author ? data.author : {name: "IND Bot", iconURL: exports.logoGIF};
        this.color = data.color ? data.color : exports.HEXToVBColor("FFA800");
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
    title: "IND Clan"
});

exports.senderIsAdmin = (msg) => (msg.author.id == "479968918623092746" || msg.author.id == "582054452744421387") ? true : false;

exports.applicationEmbed = (data) => {
    let imageURL = data.answers[data.answers.length-1];
    let fields = [];
    fields.push(
        { name: "IGN", value: data.main, inline: true },
        { name: "Level", value: data.stats.level, inline: true },
        { name: "KDR", value: data.stats.kdr, inline: true },
        { name: "KPG", value: data.stats.kpg, inline: true },
        { name: "Accuracy", value: data.stats.accuracy, inline: true},
        { name: "Nukes", value: data.stats.nukes, inline: true },
        { name: "Playtime", value: data.stats.playtime, inline: true },
        { name: "Region", value: data.stats.region, inline: true }
    );

    for(let i = 0; i < data.answers.length; i++) {
        fields.push({ name: data.questions[i], value: data.answers[i] ? data.answers[i] : "Undefined"});
    }

    let altlist = `[${data.main}](${(profilelink + data.main).replace(/ /g, "%20")})`;
    data.alts.forEach((alt) => altlist += `, [${alt}](${(profilelink + alt).replace(/ /g, "%20")})`);

    let thumbnail;
    switch(data.status) {
        case "pending": thumbnail = "https://cdn.discordapp.com/attachments/767320220842459157/771290428770484244/four-oclock_1f553.png"; break;
        case "rejected": thumbnail = "https://cdn.discordapp.com/attachments/767320220842459157/771289812429832192/prohibited_1f6ab.png"; break;
        case "accepted": thumbnail = "https://cdn.discordapp.com/attachments/767320220842459157/771290128818896906/check-mark-button_2705.png"; break;
    }
    
    return new exports.INDEmbed({
        title: `Application by ${data.user.tag}`,
        description: `<@${data.user.id}>'s Application\nAccounts: ${altlist}`,
        thumbnail: { url: thumbnail, proxyURL: "https://cdn.discordapp.com/attachments/767320220842459157/769451323610759188/http-error-404-not-found.png"},
        image: { url: imageURL, proxyURL: "https://cdn.discordapp.com/attachments/767320220842459157/769451323610759188/http-error-404-not-found.png"},
        fields: fields,
        timestamp: data.time,
    });
};

let imageExtensions = ["png", "PNG", "jpg", "JPG", "jpeg", "JPEG", "gif", "GIF"];

exports.isImageURL = (urlString) => {
    urlString = urlString.toLowerCase();
    for(let ext of imageExtensions) {
        if(urlString.endsWith("." + ext)) { return true; }
    }; 
    return false;
}

exports.INDApplication = class INDApplication {
    constructor(data, status) {
        if(data) {
            this.user = data.user;
            this.type = data.type;
            this.main = data.answers[0];
            this.stats = {
                level: data.answers[1],
                kdr: data.answers[2],
                kpg: data.answers[3],
                accuracy: data.answers[4],
                nukes: data.answers[5],
                playtime: data.answers[6],
                region: data.answers[7],
            }
            this.alts = data.answers[8].split(" | ");
            this.questions = data.questions.slice(9);
            this.answers = data.answers.slice(9);
            this.time = new Date().getTime();
            this.status = status ? status : "pending";
            return this;
        } else {
            return this;
        }
    }

    register() {
        DB.set(this.user.id, this);
    }
}

exports.appFromDB = async (id) => {
    var returnval;
    await DB.get(id).then(data => {
        if(!data) return;
        returnval = new exports.INDApplication();
        returnval.user = data.user;
        returnval.type = data.type;
        returnval.main = data.main;
        returnval.stats = data.stats;
        returnval.alts = data.alts;
        returnval.questions = data.questions;
        returnval.answers = data.answers;
        returnval.time = data.time;
        returnval.status = data.status;
    });

    if(returnval) return returnval;
    return undefined;
}