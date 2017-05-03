'use strict'

const prompt = require('./prompt')

const questions = {
  logOn: [prompt.username, prompt.password]
}

module.exports = questions
