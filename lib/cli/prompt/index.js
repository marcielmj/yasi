'use strict'

const username = require('./prompt-username')
const password = require('./prompt-password')

const prompt = {
  username: username,
  password: password
}

module.exports = prompt
