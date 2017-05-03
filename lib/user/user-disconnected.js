'use strict'

const log = require('fancy-log')

function disconnected () {
  log.info('Bye!')
  process.exit()
}

module.exports = disconnected
