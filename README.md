# Cryptox market making bot

This trading bot creates limit buy and sell orders to make markets on [Cryptox.pl](https://cryptox.pl) exchange. The orders are set at fixed prices configured by you. It works best for market making stablecoin pairs where the price is expected to be relatively stable.

The bot tries to keep all your available balance in the book. As soon as one of your orders is (fully or partially) filled on one side of the book, the bot will place the proceeds on the other side of the book.

This bot and its source code are offered as is, without any guarantees of its correct operation. The bot might lose money because of bugs, unreliable network connections, and other reasons.

## Install
Install node.js 8+, clone the repository, then say
```sh
npm install
```

## Configure

Enable API access on cryptox.pl and get the corresponding API key. 

Copy `.env.sample` file to `.env` and fill out your API credentials as well as your buy and sell prices.

## Prepare

Deposit both traded assets to cryptox. 

## Run
```sh
node start.js
```
It is recommended to run the bot using [pm2](https://pm2.keymetrics.io/) to enable automatic restarts. Install pm2 globally:
```sh
npm install -g pm2
```
Run:
```sh
pm2 start start.js --time
```
Stop:
```sh
pm2 stop start.js
```
Logs will grow quite fast. Refer to pm2 documentation for proper log management.
