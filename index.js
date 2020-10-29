const Discord = require('discord.js');
const { INDEmbed, infoEmbed, senderIsAdmin, botChar, applicationEmbed, isImageURL, INDApplication, appFromDB } = require("./consts");
const { DB } = require('./databasemanager')
const token = process.env.TOKEN;
let Questions = require("./application-questions.js");

const client = new Discord.Client();
let usersApplicationStatus = [];
let appNewForm = [];
let isSettingFormUp = false;
let guild, submissionChannel, spamGuild, spamChannel;

const applicationFormCompleted = (user) => {

	// User Application Object
	// Store it in the DB
	// Send it in the submissions channel

	let application = new INDApplication(user);
	DB.set(user.id, application);

	submissionChannel.send(" ", applicationEmbed(application))
	.then((sentmsg) => {
		sentmsg.react("⬆️");
		sentmsg.react("⬇️");
	});
};

const sendUserApplyForm = async msg => {

	// Check if submissionChannel is configured
	// Check if user has already applied and if so, cancel if the latest application was less than 7 days ago
	// Ask the first question - "Applying for?" and set the user's questions in the database accordingly
	// Then continue the application in DMs

	if(msg.channel.type == "dm") {
		msg.reply("Apply in the server! Not in DMs!");
		return;
	}

	if(!submissionChannel){
		msg.reply("The bot hasn't yet been configured properly. Report this to an Admin in order to resolve the issue.")
		return;
	}

	if(msg.member.roles.cache.find(role => role.name == "IND" && msg.author.id != "582054452744421387")){
		msg.reply("Idiot you're already in IND!");
		return;
	}

	let userData;
	await DB.get(msg.author.id).then(data => userData = data);

	if(userData) {
		let diff = new Date().getTime() - userData.time;
		if(diff <= 604800000n && msg.author.id != "582054452744421387"){
			msg.reply("you have submitted an application recently, try again after one week.");
			return;
		}
	}

	msg.author.send(" ", new INDEmbed({ title: "Applying for (Comp / Pubstomper)" }));
	usersApplicationStatus.push({
		id: msg.author.id,
		user: msg.author,
		currentStep: -1,
		answers: [],
		questions: Questions.common,
		type: undefined,
	});
};

const fetchApplication = (msg, userID) => {
	if(!senderIsAdmin(msg)) {
		msg.reply("you have no right to use this!");
		return;
	}

	appFromDB(userID).then(data => {
		if(!data){
			msg.reply("The given user was not found");
			return;
		}
		
		msg.channel.send(" ", applicationEmbed(data));
	});
};

const rejectApplication = (msg, params) => {
	let userID = params.shift();
	let reason = params.join(" ");

	if(!senderIsAdmin(msg)) { 
		msg.reply("you have no right to do this!");
		return;
	}

	client.users.fetch(userID).then(user => {
		DB.get(userID).then(data => {

			if(!data) {
				msg.reply("user not found in database!");
				return;
			}

			data.status = "rejected";
			DB.set(userID, data).then(set => {				
				if(set) {
					user.send(" ", new INDEmbed({
						title: "Your application was rejected :C",
						description: `Reason: ${reason}`,
					}));
				} else {
					msg.reply("something went wrong. Contact the developer.")
				}
			});
		});
	}).catch(err => msg.reply("could not resolve user!"));
}

const acceptApplication = (msg, params) => {
	let userID = params[0];

	if(!senderIsAdmin(msg)) { 
		msg.reply("you have no right to do this!");
		return;
	}

	client.users.fetch(userID).then(user => {
		DB.get(userID).then(data => {

			if(!data) {
				msg.reply("user not found in database!");
				return;
			}

			data.status = "accepted";
			DB.set(userID, data).then(set => {				
				if(set) {
					user.send(" ", new INDEmbed({
						title: "🎉 Your application has been accepted! 🎉",
						description: `Cheer up player! You are going to be a part of IND now!`,
					}));
				} else {
					msg.reply("something went wrong. Contact the developer.")
				}
			});
		});
	}).catch(err => msg.reply("could not resolve user!"));
}

client.on('ready', async () => {
	client.user.setPresence({ activity: { name: "%apply", type: "WATCHING" } });

	console.log(`Logged in as ${client.user.tag}!`);

	guild = await client.guilds.fetch("672016669509681182", false, true);
	submissionChannel = guild.channels.cache.find((channel) => channel.id == "769812742940131359");
	spamGuild = await client.guilds.fetch("755474904580620439", false, true);
	spamChannel = spamGuild.channels.cache.find((channel) => channel.id == "771405118914297868");

	console.log(spamChannel);

	setInterval(() => {
		spamChannel.send("Bruh wat dis...");
	}, 60000);

	console.log(`Submission Channel - #${submissionChannel.name}(${submissionChannel.id}) - ${guild.name}`);
	console.log(`Spam Channel - #${spamChannel.name}(${spamChannel.id}) - ${spamGuild.name}`);
});

client.on('message', msg => {
	if(msg.author.bot) return;

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

		console.log(`Command "${botChar + command.toLowerCase()}" called by ${msg.author.username}#${msg.author.discriminator}(${msg.author.id})`);

		switch (command.toLowerCase()) {
			case "apply":
				sendUserApplyForm(msg);
				break;
			case "help":
				msg.reply(`Help command not working kekw`);
				break;
			case "clan":
				msg.channel.send(" ", infoEmbed);
				break;
			case "fetch":
				if(!parameters[0]) { 
					msg.reply("please specify a user to fetch the application of.")
					break;
				};
				fetchApplication(msg, parameters[0]);
				break;
			case "reject":
				if(!parameters[0]){
					 msg.reply("please provide the ID the user to reject.");
					 break;
				} else if(!parameters[1]){
					msg.reply("you need to provide a reason for rejecting the person.");
					break;
				}
				rejectApplication(msg, parameters);
				break;
			case "accept":
				if(!parameters[0]){
					msg.reply("please provide the ID of the user to accept.");
					break;
				}
				acceptApplication(msg, parameters);
				break;
			case "cleardatabase":
				if(!msg.author.id == "582054452744421387") {
					msg.reply("you have no right to do this!");
					break;
				}
				DB.clear();
				msg.channel.send(" ", new INDEmbed({
					title: "Database cleared successfully!"
				}));
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

				if (user && (msg.content || msg.attachments)) {

					// Handling the first question about comp / pubs
					if(user.currentStep === -1) {
						switch (msg.content.toLowerCase()) {
							case "comp" :
								msg.reply("Comp selected");
								user.type = "comp";
								user.questions.push(...Questions.comp);
								break;
							case "pubstomper" :
								msg.reply("Pubstomper selected");
								user.type = "pubs";
								user.questions.push(...Questions.pubs);
								break;
							default:
								msg.reply("Invalid answer!");
								return;
						}
					} else if(user.currentStep == user.questions.length - 1){ //The screenshot question
						if(msg.attachments.first()) {
							msg.reply("Not a valid image link! (If you're trying to upload an image, use its link instead)");
							return;
						}

						if(msg.content){
							try {
								const url = new URL(msg.content);
								if(!isImageURL(msg.content)) throw new Error();
								user.answers.push(msg.content);
							} catch (err) {
								msg.reply("Not a valid image link! (If you're trying to upload an image, use its link instead)");
								return;	
							}
						}
					} else {
						user.answers.push(msg.content);
					}

					user.currentStep++;

					if (user.currentStep == user.questions.length) {
						applicationFormCompleted(user);
						msg.author.send(new INDEmbed({ description: "Congratulations your application has been sent! \n It will be reviewed by us and we will get back to you then." }));
					} else if (user.currentStep < user.questions.length) {
						msg.author.send(new INDEmbed({ title: user.questions[user.currentStep] + "?"}));
					} else {
						return;
					}
				}
			}
		}
	}
});

client.login(token);
