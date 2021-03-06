'use strict'

function validate (value) {
  return (value.length > 0) ? true : 'The account name is required.'
}

const username = {
  type: 'input',
  name: 'username',
  message: 'Steam account name',
  validate: validate
}

module.exports = username
