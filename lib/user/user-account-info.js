'use strict'

const log = require('fancy-log')

function accountInfo (name, country) {
  log.info(`[${country}] Welcome ${name}!`)
}

module.exports = accountInfo
