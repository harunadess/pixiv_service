'use strict';

const PixivApi = require('pixiv-api-client');
const Pixiv = new PixivApi();
const MainLoopOptions = {
	'search_target': 'partial_match_for_tags',
	'sort': 'date_desc'
};
const BaseUrl = 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=';

let username = '';
let password = '';
let inter = '';
let searchTerms = [];
let timer = null;
let lastIds = [];

let succInit = init();

if(succInit) {
	mainLoop();
	timer = createInterval(mainLoop, inter);
} else {
	console.log('failed initialisation, exiting');
	process.exit(1);
}

function init() {
	console.log('initialising...');

	try {
		username = require('../auth.json').username;
		password = require('../auth.json').password;

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

		searchTerms = require('./config.json').searchTerms;

		if(typeof(searchTerms) !== 'object' && searchTerms.length < 1) {
			console.log('ensure searchTerms has at least one tag in it');
		}

		searchTerms.map(tag => {
			lastIds[tag] = -1;
		});

		console.log('searching for: ');
		console.log(searchTerms);
	} catch(error) {
		console.error('ensure config.json is correctly set up. error:', error);
		return false;
	}

	return true;
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
		// console.log(error);
		return Promise.reject(false);
	});
}

function mainLoop() {
	login().then(() => {
		Promise.all(searchTerms.map(tag => {
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
		})).then(() => {
			console.log(`waiting for ${inter/60000} minutes..`);
		});
	}).catch(error => {
		process.exit(1);
	});
}
