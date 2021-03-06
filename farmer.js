'use strict'

const cheerio = require('cheerio')
const inquirer = require('inquirer')
const log = require('fancy-log')
const prompt = require('prompt')
const steam = require('steam-user').Steam

const questions = require('./lib/cli/questions')
const user = require('./lib/user')

let request = require('request')

let gJar = request.jar()
let gPage = 1
let gCheckTimer
let gOwnedApps = []

request = request.defaults({'jar': gJar})

process.on('SIGINT', user.logout)

inquirer.prompt(questions.login).then((answers) => {
  user.login(answers.username, answers.password)
})

function checkCardApps () {
  if (gCheckTimer) {
    clearTimeout(gCheckTimer)
  }

  log('Checking card drops...')

  user.webLogOn()
  user.once('webSession', function (sessionID, cookies) {
    cookies.forEach(function (cookie) {
      gJar.setCookie(cookie, 'https://steamcommunity.com')
    })

    request('https://steamcommunity.com/my/badges/?p=' + gPage, function (err, response, body) {
      if (err || response.statusCode !== 200) {
        log("Couldn't request badge page: " + (err || 'HTTP error ' + response.statusCode))
        checkCardsInSeconds(30)
        return
      }

      var appsWithDrops = 0
      var totalDropsLeft = 0
      var appLaunched = false

      var $ = cheerio.load(body)
      var infolines = $('.progress_info_bold')

      for (var i = 0; i < infolines.length; i++) {
        var match = $(infolines[i]).text().match(/(\d+)/)

        var href = $(infolines[i]).closest('.badge_row').find('.badge_title_playgame a').attr('href')
        if (!href) {
          continue
        }

        var urlparts = href.split('/')
        var appid = parseInt(urlparts[urlparts.length - 1], 10)

        if (!match || !parseInt(match[1], 10) || gOwnedApps.indexOf(appid) === -1) {
          continue
        }

        appsWithDrops++
        totalDropsLeft += parseInt(match[1], 10)

        if (!appLaunched) {
          appLaunched = true

          var title = $(infolines[i]).closest('.badge_row').find('.badge_title')
          title.find('.badge_view_details').remove()
          title = title.text().trim()

          log('Idling app ' + appid + ' "' + title + '" - ' + match[1] + ' drop' + (match[1] === 1 ? '' : 's') + ' remaining')
          user.gamesPlayed(parseInt(appid, 10))
        }
      }

      log(totalDropsLeft + ' card drop' + (totalDropsLeft === 1 ? '' : 's') + ' remaining across ' + appsWithDrops + ' app' + (appsWithDrops === 1 ? '' : 's') + ' (Page ' + gPage + ')')
      if (totalDropsLeft === 0) {
        if ($('.badge_row').length === 150) {
          log('No drops remaining on page ' + gPage)
          gPage++
          log('Checking page ' + gPage)
          checkMinPlaytime()
        } else {
          log('All card drops recieved!')
          log('Shutting Down.')
          user.logout()
        }
      } else {
        checkCardsInSeconds(1200) // 20 minutes to be safe, we should automatically check when Steam notifies us that we got a new item anyway
      }
    })
  })
}

function startErUp (lowAppsToIdle, minPlaytime) {
  if (lowAppsToIdle.length < 1) {
    checkCardApps()
  } else {
    gOwnedApps = gOwnedApps.concat(lowAppsToIdle)
    user.gamesPlayed(lowAppsToIdle)
    log('Idling ' + lowAppsToIdle.length + ' app' + (lowAppsToIdle.length === 1 ? '' : 's') + " up to 2 hours.\nYou likely won't receive any card drops in this time.\nThis will take " + (2.0 - minPlaytime) + ' hours.')
    setTimeout(function () {
      user.gamesPlayed([])
      checkCardApps()
    }, (1000 * 60 * 60 * (2.0 - minPlaytime)))
  }
}

function checkMinPlaytime () {
  log('Checking app playtime...')

  user.webLogOn()
  user.once('webSession', function (sessionID, cookies) {
    cookies.forEach(function (cookie) {
      gJar.setCookie(cookie, 'https://steamcommunity.com')
    })

    request('https://steamcommunity.com/my/badges/?p=' + gPage, function (err, response, body) {
      if (err || response.statusCode !== 200) {
        log("Couldn't request badge page: " + (err || 'HTTP error ' + response.statusCode) + '. Retrying in 10 seconds...')
        setTimeout(checkMinPlaytime, 10000)
        return
      }

      var lowHourApps = []
      var ownedPackages = user.licenses.map(function (license) {
        var pkg = user.picsCache.packages[license.package_id].packageinfo
        pkg.time_created = license.time_created
        pkg.payment_method = license.payment_method
        return pkg
      }).filter(function (pkg) {
        return !(pkg.extended && pkg.extended.freeweekend)
      })

      var $ = cheerio.load(body)
      $('.badge_row').each(function () {
        var row = $(this)
        var overlay = row.find('.badge_row_overlay')
        if (!overlay) {
          return
        }

        var match = overlay.attr('href').match(/\/gamecards\/(\d+)/)
        if (!match) {
          return
        }

        var appid = parseInt(match[1], 10)

        var name = row.find('.badge_title')
        name.find('.badge_view_details').remove()
        name = name.text().replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '').trim()

        // Check if app is owned
        if (!user.ownsApp(appid)) {
          log('Skipping app ' + appid + ' "' + name + '", not owned')
          return
        }

        var newlyPurchased = false
        // Find the package(s) in which we own this app
        ownedPackages.filter(function (pkg) {
          return pkg.appids && pkg.appids.indexOf(appid) !== -1
        }).forEach(function (pkg) {
          var timeCreatedAgo = Math.floor(Date.now() / 1000) - pkg.time_created
          if (timeCreatedAgo < (60 * 60 * 24 * 14) && [steam.EPaymentMethod.ActivationCode, steam.EPaymentMethod.GuestPass, steam.EPaymentMethod.Complimentary].indexOf(pkg.payment_method) === -1) {
            newlyPurchased = true
          }
        })

        // Find out if we have drops left
        var drops = row.find('.progress_info_bold').text().match(/(\d+)/)
        if (!drops) {
          return
        }

        drops = parseInt(drops[1], 10)
        if (isNaN(drops) || drops < 1) {
          return
        }

        // Find out playtime
        var playtime = row.find('.badge_title_stats').html().match(/(\d+\.\d+)/)
        if (!playtime) {
          playtime = 0.0
        } else {
          playtime = parseFloat(playtime[1], 10)
          if (isNaN(playtime)) {
            playtime = 0.0
          }
        }

        if (playtime < 2.0) {
          // It needs hours!

          lowHourApps.push({
            'appid': appid,
            'name': name,
            'playtime': playtime,
            'newlyPurchased': newlyPurchased
          })
        }

        if (playtime >= 2.0 || !newlyPurchased) {
          gOwnedApps.push(appid)
        }
      })

      if (lowHourApps.length > 0) {
        var minPlaytime = 2.0
        var newApps = []

        lowHourApps.forEach(function (app) {
          if (app.playtime < minPlaytime) {
            minPlaytime = app.playtime
          }

          if (app.newlyPurchased) {
            newApps.push(app)
          }
        })

        var lowAppsToIdle = []

        if (newApps.length > 0) {
          log('=========================================================')
          log('WARNING: Proceeding will waive your right to a refund on\nthe following apps:\n  - ' + newApps.map(function (app) { return app.name }).join('\n  - ') +
            '\n\nDo you wish to continue?\n' +
            '    y = yes, idle all of these apps and lose my refund\n' +
            "    n = no, don't idle any of these apps and keep my refund\n" +
            '    c = choose which apps to idle')

          prompt.start()
          prompt.get({
            'properties': {
              'choice': {
                'required': true,
                'pattern': /^[yncYNC]$/
              }
            }
          }, function (err, result) {
            if (err) {
              log('ERROR: ' + err.message)
              return
            }

            switch (result.choice.toLowerCase()) {
              case 'y':
                lowAppsToIdle = lowHourApps.map(function (app) { return app.appid })
                startErUp(lowAppsToIdle, minPlaytime)
                break

              case 'n':
                lowAppsToIdle = []
                startErUp(lowAppsToIdle, minPlaytime)
                break

              case 'c':
                var properties = {}
                lowHourApps.forEach(function (app) {
                  properties[app.appid] = {
                    'description': 'Idle ' + app.name + '? [y/n]',
                    'pattern': /^[ynYN]$/,
                    'required': true
                  }
                })

                prompt.get({'properties': properties}, function (err, result) {
                  if (err) {
                    log.error(err)
                  }

                  for (var appid in result) {
                    if (isNaN(parseInt(appid, 10))) {
                      continue
                    }

                    if (result[appid].toLowerCase() === 'y') {
                      lowAppsToIdle.push(parseInt(appid, 10))
                    }
                  }

                  startErUp(lowAppsToIdle, minPlaytime)
                })
            }
          })
        } else {
          lowAppsToIdle = lowHourApps.map(function (app) { return app.appid })
          startErUp(lowAppsToIdle, minPlaytime)
        }
      } else {
        checkCardApps()
      }
    })
  })
}

function checkCardsInSeconds (seconds) {
  gCheckTimer = setTimeout(checkCardApps, (1000 * seconds))
}

user.once('appOwnershipCached', () => {
  log('Got app ownership info')
  checkMinPlaytime()
})

user.on('newItems', function (count) {
  if (gOwnedApps.length === 0 || count === 0) {
    return
  }

  log('Got notification of new inventory items: ' + count + ' new item' + (count === 1 ? '' : 's'))
  checkCardApps()
})
