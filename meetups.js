const jsonfile = require('jsonfile')
const _ = require('lodash')
var fs = require('fs')
var logger = fs.createWriteStream('meetups.md', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

let meetups = jsonfile.readFileSync('meetups.json')

meetups = _.uniqBy(meetups, 'id')

meetups.map(meetup => {

  if (meetup.profile_image_url_https) {logger.write(`![${meetup.name}](${meetup.profile_image_url_https})\r\n`)}
  logger.write(`## ${meetup.name}\r\n`)
  if (meetup.description) {logger.write(`${meetup.description}\r\n`)}
  if (meetup.location) {logger.write(`* Location: ${meetup.location}\r\n`)}
  logger.write(`* Twitter: [@${meetup.screen_name}](https://twitter.com/${meetup.screen_name})\r\n`)

  if (meetup.entities && meetup.entities.url && meetup.entities.url.urls && meetup.entities.url.urls[0]) {
    logger.write(`* URL: [${meetup.entities.url.urls[0].expanded_url}](${meetup.entities.url.urls[0].expanded_url})\r\n`)
  }

  logger.write(`---\r\n\r\n`)
  
})
