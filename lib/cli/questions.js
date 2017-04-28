let username = require('./prompt/prompt-username')
let password = require('./prompt/prompt-password')

let questions = {}

questions.logOn = [username, password]

module.exports = questions
