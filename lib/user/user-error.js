const log = require('fancy-log')

function error (err) {
  log.error(`${err}!`)
}

module.exports = error
