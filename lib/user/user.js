'use strict'

const SteamUser = require('steam-user')

const accountInfo = require('./user-account-info')
const disconnected = require('./user-disconnected')
const error = require('./user-error')

const user = new SteamUser({'enablePicsCache': true})

user.on('error', error)

user.on('disconnected', disconnected)

user.on('loggedOn', () => {
  user.once('accountInfo', accountInfo)
})

user.login = (username, password) => {
  user.logOn({
    'accountName': username,
    'password': password
  })
}

user.logout = () => {
  user.gamesPlayed([])
  user.logOff()
}

module.exports = user
