const XLSX = require('xlsx')
const _ = require('lodash')

require('dotenv').config()

var Twitter = require('twitter')
var twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

function participants (filename) {
  let workbook = XLSX.readFile(filename)
  let worksheet = workbook.Sheets[workbook.SheetNames[0]]
  let participantsRaw = XLSX.utils.sheet_to_json(worksheet)
  let participantsProcessed = participantsRaw.map(function (participant) {
    let outputString = participant['Your name'] || ''
    let twitterHandle = participant['Twitter handle'] || ''

    twitterHandle = _.trim(twitterHandle)

    twitterHandle = twitterHandle.replace(' ', '')

    twitterHandle = twitterHandle.substring(0, 8) == 'https://' ? twitterHandle.substring(8) : twitterHandle

    twitterHandle = twitterHandle.substring(0, 4) == 'www.' ? twitterHandle.substring(4) : twitterHandle

    twitterHandle = twitterHandle.substring(0, 12) == 'twitter.com/' ? twitterHandle.substring(12) : twitterHandle

    twitterHandle = _.trim(twitterHandle, '@')

    if (twitterHandle) {
      outputString += ';' + twitterHandle

       twitterClient.get('users/show', {
        screen_name: twitterHandle
      })
        .then(function (userData) {
          outputString += ';' + userData.followers_count
          console.log(outputString)
        })
        .catch(function (error) {
          outputString += ';Error getting followers count: ' + error
          //console.log(outputString)
          //throw new Error('Error')
        }) 
    } else {
      //outputString += ';No twitter specified'
      //console.log(outputString)
    }
  })

  return participantsProcessed
}

participants('./Call for Presentations ngVikings 2019 (Responses).xlsx')
