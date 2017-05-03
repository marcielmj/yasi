'use strict'

const SteamUser = require('steam-user')

const user = new SteamUser({'enablePicsCache': true})
const accountInfo = require('./user-account-info')
const error = require('./user-error')
const disconnected = require('./user-disconnected')

user.on('error', error)

user.on('disconnected', disconnected)

user.on('loggedOn', () => {
  user.once('accountInfo', accountInfo)
})

module.exports = user
