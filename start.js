/*jslint node: true */
'use strict';
const crypto = require('crypto');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const path = require('path');
require('dotenv').config({ path: path.dirname(process.mainModule.paths[0]) + '/.env' });

const BASE_CURRENCY = process.env.BASE_CURRENCY || 'BTC20200701';
const QUOTE_CURRENCY = process.env.QUOTE_CURRENCY || 'BTC';

const MIN_QUOTE_BALANCE = process.env.MIN_QUOTE_BALANCE || 0.0001;
const MIN_BASE_BALANCE = process.env.MIN_BASE_BALANCE || 0.0001;

const MIN_ORDER_SIZE = process.env.MIN_ORDER_SIZE || 0.001; // in base currency


async function sendRequest(method, params) {
	const urlParams = new URLSearchParams();
	urlParams.append('nonce', Date.now());
	for (let name in params)
		urlParams.append(name, params[name]);
	const body = urlParams.toString();
	console.log('body', body);

	const sig = crypto.createHmac('sha512', process.env.hmac_priv_key).update(body).digest('hex');
	console.log('sig', sig);
	const headers = {
		'Rest-Key': process.env.key,
		'Rest-Sign': sig,
	};
	const response = await fetch('https://cryptox.pl/api/' + method, { method: 'POST', body, headers });
	if (response.status !== 200)
		throw new Error('non-200 status: ' + response.status);

	const json = await response.json();
	console.log('json', json);
	if (json.result === 'failed')
		throw new Error("request failed: " + json.reason);
	return json;
}

async function getFunds() {
	return (await sendRequest('funds', {})).funds;
}

async function placeOrder(side, amount, price) {
	console.log("will " + side + " " + amount + " at " + price);
	const json = await sendRequest(BASE_CURRENCY + QUOTE_CURRENCY + '/' + side, { amount, price });
	console.log("created " + side + " " + amount + " at " + price);
}

async function placeOrders() {
	try {
		const funds = await getFunds();
		const base_avilable = funds['available_' + BASE_CURRENCY] - MIN_BASE_BALANCE;
		if (base_avilable >= MIN_ORDER_SIZE)
			await placeOrder('sell', base_avilable, process.env.sell_price);
		else
			console.log("no " + BASE_CURRENCY + " balance available for new sell orders");
		const quote_avilable = funds['available_' + QUOTE_CURRENCY] - MIN_QUOTE_BALANCE;
		const buy_amount = quote_avilable / process.env.buy_price;
		if (buy_amount >= MIN_ORDER_SIZE)
			await placeOrder('buy', buy_amount, process.env.buy_price);
		else
			console.log("no " + QUOTE_CURRENCY + " balance available for new buy orders");
	}
	catch (e) {
		console.log("failed to place orders: ", e);
	}
}


async function start() {
	if (!process.env.sell_price || !process.env.buy_price)
		throw Error("please set the prices");
	await placeOrders();
	setInterval(placeOrders, 60 * 1000);
}

start();


process.on('unhandledRejection', async up => {
	throw up;
});

