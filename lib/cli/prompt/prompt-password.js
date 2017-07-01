'use strict'

function validate (value) {
  return (value.length > 0) ? true : 'The password is required.'
}

const password = {
  type: 'password',
  name: 'password',
  mask: '*',
  message: 'Password',
  validate: validate
}

module.exports = password
