var SteamUser = require('steam-user');
var SteamTotp = require('steam-totp');
const fs = require("fs");
var request = require("request");
const cheerio = require('cheerio');
const SteamCommunity = require("steamcommunity");
const community = new SteamCommunity();
var readlineSync = require('readline-sync');

var client = new SteamUser();
var username = readlineSync.question("[Digite seu login steam: ");
var password = readlineSync.question("[Digite sua senha da steam: ");

client.logOn({
	"accountName": username,
	"password": password
});

client.on('loggedOn', function(details) {
	console.log("Logado com Sucesso na Steam " + client.steamID);
	client.setPersona(SteamUser.EPersonaState.Online);
	client.gamesPlayed(730);
});

client.on('error', function(e) {
	// Some error occurred during logon
	console.log(e);
});

client.on('webSession', (sessionid, cookies) => {
	community.setCookies(cookies),
	community.startConfirmationChecker(10000);
	
	if (client.vanityURL) {
		var url = `https://steamcommunity.com/id/${client.vanityURL}/gcpd/730/?tab=playercommends`;
	} else {
		var url = `https://steamcommunity.com/profiles/${client.steamID}/gcpd/730/?tab=playercommends`;
	}
	request.post(url, {
		headers: {
			'Cookie': cookies,
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
		},

	}, (err, res, body) => {

		if (err)
			console.log(err);
		else if (body) {

			var $ = cheerio.load(body);
			let link_steam = $('.linkTitle');

			var link_steam_exp = '';
			link_steam.each(function() {
				link_steam_exp += $(this).attr('href');
				link_steam_exp += '\n';

			});

			fs.writeFile(`./link_steam_${client.steamID}.txt`, link_steam_exp, (err) => {
				if (err) throw err;
				console.log('links exportados');

			});

			fs.writeFile(`./nick_steam_${client.steamID}.txt`, link_steam.text(), (err) => {
				if (err) throw err;
				console.log('nicks exportados');
				process.exit();

			});

		} else {
			console.log(res + 'failed: ');
		}
	});
});


community.on("sessionExpired", function (err) {
	if (err) {
		client.webLogOn();
	}
});
