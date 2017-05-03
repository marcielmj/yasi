'use strict'

const prompt = require('./prompt')

const questions = {
  login: [prompt.username, prompt.password]
}

module.exports = questions
