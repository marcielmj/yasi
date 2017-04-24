const SteamUser = require('steam-user')
const log = require('fancy-log')

let user = new SteamUser({'enablePicsCache': true})

user.on('loggedOn', function loggedOn () {
  user.once('accountInfo', function accountInfo (name) {
    log.info('Welcome ' + name)
  })
})

user.on('error', function error (err) {
  log.error(String(err))
})

module.exports = user
