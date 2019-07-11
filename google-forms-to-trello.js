var XLSX = require('xlsx')
const jsonfile = require('jsonfile')
const syncRequest = require('sync-request')

var authentication = 'key=285c54e5f281b48a0116006db544e23e&token=2126c293f93d004a33aad50889d1fdbcde02d309de1a22bf411de10a135e000a'
var idBoard = '5c56e0e900aa1a2719f8a506'
var inboxList = '5c56e1334be76163e139ef27'
var updatedLabel = '5c56e0e991d0c2ddc5929970'

var travelLabelDenmark = '5c56e0e991d0c2ddc5929974'
var travelLabelEurope = '5c56e0e991d0c2ddc5929975'
var travelLabelWorld = '5c56e0e991d0c2ddc5929979'

var labelsJson = null

function getCardName (submission) {
  return submission['Title of your talk'] +
    ' by ' + submission['Your name'] +
    ' from ' + submission['Company / Organization you work for'] +
    ' (' + submission['Your country'] + ')'
}

function getCardLabelIds (submission) {
  var idLabels = labelsJson.filter((label) => {
    return label.name === submission['Length of your talk (approximate)'] || label.name === submission[ 'How advanced is your talk?']
  }).map((label) => {
    return label.id;})

  var travelFieldValue = submission[ 'Do you need travel expenses covered?']

  if (travelFieldValue === 'Yes - I travel from somewhere in Denmark') {
    idLabels.push(travelLabelDenmark)
  } else if (travelFieldValue === 'Yes - I travel from somewhere in Europe (outside of Denmark)') {
    idLabels.push(travelLabelEurope)
  } if (travelFieldValue === 'Yes - I travel from somewhere outside of Europe') {
    idLabels.push(travelLabelWorld)
  }

  return idLabels
}

function getCardDesc (submission) {
  var body = ''

  for (let [key, value] of Object.entries(submission)) {

    if (value.length == 0) {
      continue
    }
    if (key === 'A few words about you' || key === 'Pitch of your talk' || key === 'Longer description of your talk' || key === 'Will you need any special equipment during the presentation?' || key === 'Can you give examples of talks you have given previously?' || key === 'Any other questions or concerns?') {
      body += '\n## ' + key + '\n' + value + '\n\n'
    } else {
      body += '**' + key + ':** ' + value + '\n'
    }
  }
  return body
}

function saveToTrello (args) {
  var submission = args.submission
  var cardId = submission['trello_card_id']
  if (cardId) {
    return updateCard(cardId, submission)
  } else {
    return createCard(submission)
  }
}

function sendAll () {
  var url = 'https://api.trello.com/1/boards/' + idBoard + '/labels?' + authentication

  var response = syncRequest('GET', url)
  labelsJson = JSON.parse(response.getBody('utf8'))

  console.log('Labels loaded:')
  console.log(labelsJson)

  var workbook = XLSX.readFile('TEMP Call for Presentations ngVikings 2019 (Responses).xlsx')
  var worksheet = workbook.Sheets[workbook.SheetNames[0]]
  var submissionsRaw = XLSX.utils.sheet_to_json(worksheet)

  console.log('Submissions loaded:')
  console.log(submissionsRaw.length)

  var submissionsProcessed = submissionsRaw.map((submission) => {

    submission['trello_card_id'] = saveToTrello({submission: submission})

    return submission
  })

  console.log('Writing processed file')
  jsonfile.writeFileSync('participants-processed.json', submissionsProcessed)
}

function updateCard (cardId, submission) {
  console.log('Updating card ' + cardId)

  var idLabels = getCardLabelIds(submission)
  idLabels.push(updatedLabel)
  var payload = {
    name: getCardName(submission),
    desc: getCardDesc(submission),
    closed: false,
    idLabels: idLabels.join(',')
  }
  console.log(payload)

  var url = 'https://api.trello.com/1/cards/' + cardId + '?' + authentication
  var response = syncRequest('PUT', url, {
    json: payload
  })
  var responseJson = JSON.parse(response.getBody('utf8'))

  return responseJson['id']
}

function createCard (submission) {
  console.log('Creating card')

  var payload = {
    name: getCardName(submission),
    desc: getCardDesc(submission),
    idList: inboxList,
    idLabels: getCardLabelIds(submission).join(',')
  }
  console.log(payload)

  var url = 'https://api.trello.com/1/cards?' + authentication
  var response = syncRequest('POST', url, {
    json: payload
  })
  var responseJson = JSON.parse(response.getBody('utf8'))

  console.log('Card with ID' + responseJson['id'] + ' created')

  return responseJson['id']
}

sendAll()
