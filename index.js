'use strict';

const PixivApi = require('pixiv-api-client');
const Pixiv = new PixivApi();
const MainLoopOptions = {
	'search_target': 'exact_match_for_tags',
	'sort': 'date_desc'
};
const BaseUrl = 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=';

let username = '';
let password = '';
let inter = '';
let tags = [];
let timer = null;
let lastIds = [];

let succInit = init();

if(succInit) {
	timer = createInterval(mainLoop, inter);
} else {
	console.log('failed initialisation, exiting');
}

function init() {
	console.log('initialising...');

	try {
		username = require('./auth.json').username;
		password = require('./auth.json').password;

		console.log('read auth');
	} catch(error) {
		console.log('error reading username and password');
		return false;
	}

	if(username === "") {
		console.log('enter a username');
		return false;
	}

	if(password === "") {
		console.log('enter a password');
		return false;
	}

	try {
		inter = require('./config.json').checkLatency;
		inter = parseInt(inter)*60000;

		if(typeof(inter) !== 'number') {
			console.log('ensure checkLatency is a number');
			return false;
		}

		tags = require('./config.json').tags;

		if(typeof(tags) !== 'object' && tags.length < 1) {
			console.log('ensure tags has at least one tag in it');
		}

		tags.map(tag => {
			lastIds[tag] = -1;
		});
	} catch(error) {
		console.log('ensure config.json is correctly set up');
		return false;
	}

	return true;
}

function login() {
	return Pixiv.login(username, password).then(() => {

	}).catch(error => {
		console.log('error logging in.');
	});
}

function createInterval(func, duration) {
	return setTimeout(() => {
		func();
		return createInterval(func, duration);
	}, duration);
}

function login() {
	return Pixiv.login(username, password).then(() => {
		return true;
	}).catch(error => {
		console.log('error logging in.');
		console.error(error);
		return false;
	});
}

function mainLoop() {
	login().then(() => {
		Promise.all(tags.map(tag => {
			Pixiv.searchIllust(tag, MainLoopOptions).then(json => {
				let last = json.illusts[0];
				if(lastIds[tag] !== last.id) {
					lastIds[tag] = last.id;
	
					console.log(`=== New Post: ${tag} ===`);
					console.log((BaseUrl+last.id));
				} else {
					console.log(`No new posts for ${tag}`);
				}
			}).catch(error => {
				console.log('error searching illustrations');
				console.log(error);
				clearTimeout(timer);
			});
		}));
	});
}
