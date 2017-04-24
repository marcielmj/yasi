const SteamUser = require('steam-user')
const log = require('fancy-log')

let user = new SteamUser({'enablePicsCache': true})

function accountInfo (name) {
  log.info('Welcome ' + name + '!')
}

function loggedOn () {
  user.once('accountInfo', accountInfo)
}

user.on('loggedOn', loggedOn)

function error (err) {
  log.error(err + '!')
}

user.on('error', error)

function disconnected () {
  log.info('Bye!')
  process.exit()
}

user.on('disconnected', disconnected)

module.exports = user
