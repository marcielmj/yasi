'use strict'

let username = require('./prompt/prompt-username')
let password = require('./prompt/prompt-password')

let questions = {
  logOn: [username, password]
}

module.exports = questions
