const SteamUser = require('steam-user')

let user = new SteamUser({'enablePicsCache': true})
let accountInfo = require('./user-account-info')
let error = require('./user-error')
let disconnected = require('./user-disconnected')

user.on('error', error)

user.on('disconnected', disconnected)

user.on('loggedOn', () => {
  user.once('accountInfo', accountInfo)
})

module.exports = user
