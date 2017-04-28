# Yasi

Designed for advanced users.

[![code-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

[![npm](https://img.shields.io/npm/v/yasi.svg?style=flat-square)](https://www.npmjs.com/package/yasi) [![Known Vulnerabilities](https://snyk.io/test/github/marcielmj/yasi/badge.svg?style=flat-square)](https://snyk.io/test/github/marcielmj/yasi) [![dependencies](https://img.shields.io/david/marcielmj/yasi.svg?style=flat-square)](https://david-dm.org/marcielmj/yasi) [![license](https://img.shields.io/npm/l/yasi.svg?style=flat-square)](LICENSE)


# Requirements
- [Node.js](https://nodejs.org/) v6.x LTS or later


# Installation

```
npm install -g yasi
```


# Usage

On the command line, just type `yasi`. 

If you have games with remaining drops which have less than 2 hours of playtime, the app will first mass-idle all of them up to 2 hours. Then it will start switching through them to get card drops. This is because it's now impossible to get card drops before your first 2 hours of gameplay.

If you have purchased a game in the past 14 days, **idling it will waive your right to a refund on Steam**. If you have apps which were purchased less than 14 days ago, have remaining drops, have less than 2 hours of playtime, and weren't redeemed from a CD key, complimentary, or a gift, the app will first prompt you which games you'd like to idle.

It'll automatically switch through all games you have with remaining card drops (it checks every 20 minutes or immediately when a new item is received). One could theoretically mass-idle all games at once, but it takes just as long and this way doesn't rack up unnecessary fake playtime.


# License

This project is licensed under the [MIT License](LICENSE).
