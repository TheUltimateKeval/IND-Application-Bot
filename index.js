const Discord = require('discord.js');
const { INDEmbed, infoEmbed, senderIsAdmin, botChar } = require("./consts");
const token = require("./auth").token;
let applicationQuestions = require("./application-questions.js");

const client = new Discord.Client();
let usersApplicationStatus = [];
let appNewForm = [];
let isSettingFormUp = false;
let guild = null;
let submissionChannel = null;

const applicationFormCompleted = (data) => {
	let i = 0, answers = "";

	let applicationData = [];

	for (; i < applicationQuestions.length; i++) {
		applicationData.push({
			name: applicationQuestions[i],
			value: data.answers[i],
		})
	}

	if (submissionChannel)
		submissionChannel.send(" ", new INDEmbed({
			title: "New Application!",
			description: `New application submitted by ${data.user.toString()}`,
			thumbnail: { url: data.user.avatarURL()},
			fields: applicationData,
		}));
};

const sendUserApplyForm = msg => {
	if(!submissionChannel){
		msg.reply("the bot hasn't yet been configured properly. Report this to an Admin in order to resolve the issue.")
		return;
	}

	const user = usersApplicationStatus.find(user => user.id === msg.author.id);

	if (!user) {
		msg.author.send(" ", new INDEmbed({
			title: "Application Commands :",
			description: `\`\`\`js\n ${botChar}cancel - "To cancel the application" \n ${botChar}redo - "To re-attempt the application" \`\`\``,
		}));
		msg.author.send(" ", new INDEmbed({ description: applicationQuestions[0] }));
		usersApplicationStatus.push({id: msg.author.id, currentStep: 0, answers: [], user: msg.author});
	} else {
		msg.author.send("", new INDEmbed({ description: applicationQuestions[user.currentStep] }));
	}
};

const cancelUserApplicationForm = (msg, isRedo = false) => {
	const user = usersApplicationStatus.find(user => user.id === msg.author.id);

	if (user) {
		usersApplicationStatus = usersApplicationStatus.filter(el => el.id !== user.id)
		msg.reply("Application canceled.");
	} else if (!isRedo) {
		msg.reply("You have not started an application form yet.");
	}
};

const setApplicationSubmissions = (msg) => {
	if (!msg.guild) {
		msg.reply("this command can only be used in a guild.");
		return;
	}

	if (!senderIsAdmin(msg) && msg.author.id != '582054452744421387') {
		msg.reply("only admins or the bot dev can do this.");
		return;
	}

	if(!msg.mentions.channels.first()){
		msg.reply("please mention a channel to send the applications to.");
		return;
	}

	submissionChannel = msg.mentions.channels.first();
	msg.channel.send("", new INDEmbed({
		title : " ",
		description : `Applications will now be sent to ${submissionChannel.toString()}`,
	}));
	return;
};

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	guild = await client.guilds.fetch("755474904580620439", false, true);
	submissionChannel = guild.channels.cache.find((channel) => channel.id == "768072481978187796");
});

client.on('message', msg => {
	if (msg.content.charAt(0) === botChar) {
		const request = msg.content.substr(1);
		let command, parameters = [];

		if (request.indexOf(" ") !== -1) {
			command = request.substr(0, request.indexOf(" "));
			parameters = request.split(" ");
			parameters.shift();
		} else {
			command = request;
		}

		switch (command.toLowerCase()) {
			case "apply":
				sendUserApplyForm(msg);
				break;
			case "cancel":
				cancelUserApplicationForm(msg);
				break;
			case "redo":
				cancelUserApplicationForm(msg, true);
				sendUserApplyForm(msg);
				break;
			case "setsubmitchannel":
				setApplicationSubmissions(msg);
				break;
			case "help":
				msg.reply(`Available commands: \`\`\`${botChar}apply, ${botChar}addrole, ${botChar}setup, ${botChar}endsetup, ${botChar}setsubmissions, ${botChar}help\`\`\``);
				break;
			case "clan":
				msg.channel.send(" ", infoEmbed);
				break;
			default:
				msg.reply("I do not know this command.");
		}
	} else {
		if (msg.channel.type === "dm") {
			if (msg.author.id === isSettingFormUp) {
				appNewForm.push(msg.content);
			} else {
				const user = usersApplicationStatus.find(user => user.id === msg.author.id);

				if (user && msg.content) {
					user.answers.push(msg.content);
					user.currentStep++;

					if (user.currentStep >= applicationQuestions.length) {
						applicationFormCompleted(user);
						msg.author.send(new INDEmbed({ description: "Congratulations your application has been sent! \n It will be reviewed by us and we will get back to you then." }));
					} else {
						msg.author.send(new INDEmbed({ description: applicationQuestions[user.currentStep]}));
					}
				}
			}
		}
	}
});

client.login(token);
