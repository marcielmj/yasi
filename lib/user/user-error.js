'use strict'

const log = require('fancy-log')
const steamUser = require('steam-user')

function error (err) {
  switch (err.eresult) {
    case steamUser.EResult.InvalidPassword:
      log.error('The account name or password that you have entered is incorrect.')
      break

    default:
      log.error(`${err}!`)
  }
}

module.exports = error
