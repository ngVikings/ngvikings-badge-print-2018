var XLSX = require('xlsx')
var _ = require('lodash')
var moment = require('moment')

var IMAGES = {
  'Attendee': 'images/badge-print.png',
  'Trainee': 'images/badge-print4.png',
  'Speaker': 'images/badge-print3.png',
  'Crew': 'images/badge-print2.png'
}

var TRACKS = [
  'Bifrost', 'Valhalla', 'Vikings Cafe'
]

var DIET_STOP_LIST = [
  'meat, shrimps',
  'Food',
  'Steak, burgers or pizzas',
  'None, I&#39;m happy with anyting',
  'Nope',
  'nope',
  'sushi',
  'No preferences',
  'No.',
  'cheeseburger :)',
  'Meat! :o)',
  'Nope',
  'I love meat.',
  'I like food',
  'no, thanks',
  'No',
  'no',
  'Beef',
  'Steak, Burgers or pizzas.',
  'Chicken',
  'Roast beef',
  'None, I&#39;m happy with anyting',
  'Steak & Salad',
  'sushi',
  'No preferences',
  'NA',
  'Meet',
  'Meat',
  'Nope.',
  'I love meat.',
  'Sushi!',
  'banana',
  'Burger',
  'all its fine',
  'None',
  'none',
  'T',
  'no :)',
  'No restrictions',
  'Thanks for the effort, see you in the conference!',
  'you cool',
  '🍗🍖🥓'
]

var TSHIRTS = {
  'Female XS': 0,
  'Female S': 0,
  'Female M': 0,
  'Female L': 0,
  'Female XL': 0,
  'Female XXL': 0,
  'Male XS': 0,
  'Male S': 0,
  'Male M': 0,
  'Male L': 0,
  'Male XL': 0,
  'Male XXL': 0,
  'Male XXXL': 0,
  'Male XXXXL': 0,
  '-': 0,
  'number': 0
}

var TICKET_TYPES = {
  'numberRegular': 0,
  'numberDiscounted': 0,
  'numberFree': 0,
  'total': 0,
  'number': 0
}

var STATS = {
  'conf': {
    'tickets': {
      'regularBird': Object.assign({}, TICKET_TYPES),
      'earlyBird': Object.assign({}, TICKET_TYPES),
      'lateBird': Object.assign({}, TICKET_TYPES),
      'student': Object.assign({}, TICKET_TYPES),
      'sponsorTicket': Object.assign({}, TICKET_TYPES),
      'speakerTicket': Object.assign({}, TICKET_TYPES),
      'total': 0,
      'number': 0
    },
    'people': {
      'attendees': 0,
      'crew': 0,
      'speakers': 0,
      'trainees': 0,
      'number': 0
    },
    'diet': {
      'list': [],
      'number': 0
    },
    'referrer': {
      "I'm ngVikings 2017 participant": 0,
      'Twitter': 0,
      'Facebook': 0,
      'Meetup': 0,
      'Search engine': 0,
      'Printed ad': 0,
      'Article or blog post': 0,
      'Friend': 0
    }
  },
  'workshops': {
    'tickets': {
      'Workshop: Advanced Angular for Enterprise Applications by Manfred Steyer': {
        'total': 0,
        'number': 0
      },
      'Workshop: Angular Workshop: From Zero To Viking in 1 day! by Laurent Duveau': {
        'total': 0,
        'number': 0
      },
      'Workshop: Advanced RxJS in Angular by Kwinten Pisman & Brecht Billiet': {
        'total': 0,
        'number': 0
      },
      'Workshop: NGRX Beginner to Master by Dominic Elm': {
        'total': 0,
        'number': 0
      },
      'Workshop: Pimp your app for PWA by Lauri Svan': {
        'total': 0,
        'number': 0
      },
      'Workshop: Angular - The Awesome Parts by John Papa & Ward Bell': {
        'total': 0,
        'number': 0
      },
      'Workshop: ngGirls': {
        'total': 0,
        'number': 0
      },

      'total': 0,
      'number': 0
    },
    'diet': {
      'list': [],
      'number': 0
    }
  },
  'tshirts': {
    'attendees': Object.assign({}, TSHIRTS),
    'crew': Object.assign({}, TSHIRTS),
    'speakers': Object.assign({}, TSHIRTS),
    'black': Object.assign({}, TSHIRTS),
    'white': Object.assign({}, TSHIRTS),
    'number': 0
  },
  'total': 0,
  'filteredByDate': 0
}

let workshopTicketOwners = []
let conferenceTicketOwners = []

function createParticipant (participant, programData) {

  // console.log(participant)

  var firstName = participant['Ticket First Name'] || ''
  var lastName = participant['Ticket Last Name'] || ''

  var crewType = participant['Crew type'] || ''

  if (firstName.trim() && lastName.trim()) {
    var fullName = [firstName.trim(), lastName.trim()].join(' ')
  }else {
    console.log('Unassigned ticket for ticket ' + participant['Ticket Reference'] + ' . Using order name')
    var fullName = participant['Order Name']
  }

  var company = participant['Ticket Company Name']
  var sessionInfo = null

  var ticketName = participant['Ticket']

  var ticketPrice = parseInt(participant['Price'])

  var categoryName = null

  var tShirt = participant['T-shirt type & size']

  var dietAnswer = participant['Do you have any special dietary requirements?'] ? participant['Do you have any special dietary requirements?'].trim() : null

  var diet = (dietAnswer === '-' || _.includes(DIET_STOP_LIST, dietAnswer)) ? null : dietAnswer

  var discount = participant['Order Discount Code'] !== '-' ? participant['Order Discount Code'] : null
  var referrer = participant['How did you hear about us?'] !== '-' ? participant['How did you hear about us?'] : null

  var email = participant['Ticket Email']

  var contactCard = fullName + ' <' + email + '>'

  var modifiedDate = moment(participant['Ticket Last Updated Date'], 'MM/DD/YY'); // Last Updated | Created

console.log(participant['Twitter handle to print on your badge'])

  var twitter = ( participant['Twitter handle to print on your badge'] && participant['Twitter handle to print on your badge'] !== '-' )  ? '@' + _.trimStart(participant['Twitter handle to print on your badge'].replace('https://twitter.com/', '').replace('https://github.com/', ''), '@') : null

  console.log(twitter)

  if (company) {
    contactCard += ' of ' + company
  }

  if (ticketName.includes('Bird') || ticketName.includes('Student') || ticketName.includes('Conference')) {
    categoryName = 'Attendee'

    var confType = _.camelCase(ticketName)

    if (ticketName.includes('Early')) {
      confType = 'earlyBird'
    }

    if (ticketName.includes('Late')) {
      confType = 'lateBird'
    }

    if (ticketName.includes('Conference')) {
      confType = 'regularBird'
    }

    if (ticketName.includes('Student') || ticketName.includes('student')) {
      confType = 'student'
    }

    STATS.conf.tickets.number++
    STATS.conf.tickets.total += ticketPrice

    STATS.conf.people.attendees++
    STATS.conf.people.number++

    STATS.total += ticketPrice

    if (ticketPrice === 0) {
      STATS.conf.tickets[confType].numberFree++
      STATS.conf.tickets[confType].number++

      console.log('Free ticket with code/tag: ' + (discount ? discount : '') + (participant['Tags'] ? participant['Tags'] : '') + ' ref: ' + participant['Ticket Reference'] + ' company: ' + participant['Ticket Company Name'])
    } else if (!discount) {
      STATS.conf.tickets[confType].numberRegular++
      STATS.conf.tickets[confType].number++
      STATS.conf.tickets[confType].total += ticketPrice
    } else {
      STATS.conf.tickets[confType].numberDiscounted++
      STATS.conf.tickets[confType].number++
      STATS.conf.tickets[confType].total += ticketPrice
    }

    STATS.tshirts.attendees[tShirt]++
    STATS.tshirts.attendees.number++
    STATS.tshirts.number++

    STATS.tshirts.black[tShirt]++
    STATS.tshirts.black.number++

    if (diet) {
      STATS.conf.diet.list.push(diet)
      STATS.conf.diet.number++
    }

    if (referrer && (STATS.conf.referrer[referrer] === 0 || STATS.conf.referrer[referrer] > 0)) {
      STATS.conf.referrer[referrer]++
    }

    conferenceTicketOwners.push(email)

  } else if (ticketName.includes('Workshop')) {
    categoryName = 'Trainee'

    STATS.workshops.tickets.number++
    STATS.workshops.tickets.total += ticketPrice

    STATS.conf.people.trainees++
    STATS.conf.people.number++

    STATS.total += ticketPrice

    if (ticketName.includes('Liisa')) {
      ticketName = 'Workshop: Angular - The Awesome Parts by John Papa & Ward Bell'
    }

    STATS.workshops.tickets[ticketName].number++
    STATS.workshops.tickets[ticketName].total += ticketPrice

    workshopTicketOwners.push(email)

    if (diet) {
      STATS.workshops.diet.list.push(diet)
      STATS.workshops.diet.number++
    }
  } else if (ticketName === 'Crew Ticket') {
    categoryName = 'Crew'

    STATS.conf.people.crew++

    STATS.conf.people.number++

    STATS.tshirts.crew[tShirt]++
    STATS.tshirts.crew.number++
    STATS.tshirts.number++

    STATS.tshirts.white[tShirt]++
    STATS.tshirts.white.number++

    if (diet) {
      STATS.conf.diet.list.push(diet)
      STATS.conf.diet.number++
    }
  } else if (ticketName === 'Speaker Ticket') {
    categoryName = 'Speaker'
    sessionInfo = {}

    STATS.conf.tickets['speakerTicket'].numberFree++


    var speaker = programData.speakers.find(speaker => {
      return speaker ? speaker['name'] == fullName : false
    }
    )
    if (!speaker) {
      console.log("Can't find session for ", fullName)
    } else {
      sessionInfo.social = speaker.socials
      var session = Object.values(programData.sessions).find(session => {
        return (session && session.speakers) ? session.speakers.includes(speaker.id) : false
      }
      )
      if (!session) {
        console.log("Can't find session for ", fullName)
        //sessionInfo.title = "Workshop: ngGirls"
      } else {
        sessionInfo.title = session.title
        var timeslot = null
        for (const day of programData.schedule) {

          let isFound = false
          timeslot = day.timeslots.find(timeslot => {

            let items = _.chain(timeslot.sessions)
              .map('items')
              .flatten()
              .value()

            return items.includes(parseInt(session.id))
          })
          if (timeslot) {
            sessionInfo.date = moment(day.dateFormat, 'YYYY-MM-DD').format('dddd') // MMMM Do
            sessionInfo.startTime = timeslot.startTime
            let flatSlots = _.chain(timeslot.sessions)
              .map('items')
              .flatten()
              .value()

            sessionInfo.track = TRACKS[flatSlots.indexOf(parseInt(session.id))]
            break
          }
        }
        if (!timeslot) {
          console.log("Can't find timeslot for ", session.id, fullName, sessionInfo.title)
        }
      }
    }

    STATS.conf.people.speakers++

    STATS.conf.people.number++

    STATS.tshirts.speakers[tShirt]++
    STATS.tshirts.speakers.number++
    STATS.tshirts.number++

    STATS.tshirts.black[tShirt]++
    STATS.tshirts.black.number++

    if (diet) {
      STATS.conf.diet.list.push(diet)
      STATS.conf.diet.number++
    }
  } else {
    console.log('===== Unknown category for ticket ' + participant['Ticket'])
  }

  var image = IMAGES[categoryName]

  return {
    fullName,
    company,
    contactCard,
    sessionInfo,
    image,
    categoryName,
    ticketName,
    modifiedDate,
    twitter,
    crewType,
    firstName,
  lastName}
}

function participants (filename, filterOnType, startingDate, programData) {
  var workbook = XLSX.readFile(filename)
  var worksheet = workbook.Sheets[workbook.SheetNames[0]]
  var participantsRaw = XLSX.utils.sheet_to_json(worksheet)
  var participantsProcessed = participantsRaw.map(function (participant) {
    return createParticipant(participant, programData)
  }).filter(function (p) {
    return p.categoryName
  }).filter(function (p) {
    return !filterOnType || filterOnType === p.categoryName
  }).filter(function (p) {
    if (startingDate) {
      if (p.modifiedDate.isSameOrAfter(startingDate)) {
        console.log('Modified date: ' + p.modifiedDate.format())
        STATS.filteredByDate++
        return true
      } else {
        return false //  Set to false when filtering by date
      }
    } else {
      return true
    }
  }).sort(function (a, b) {
    if (a.categoryName.localeCompare(b.categoryName) != 0) {
      return a.categoryName.localeCompare(b.categoryName)
    }
    return a.fullName.localeCompare(b.fullName)
  })

   console.log(JSON.stringify(STATS, undefined, 2))


    console.log('ONLY workshop attendees:');
    console.log(JSON.stringify(_.difference(workshopTicketOwners, conferenceTicketOwners), undefined, 2));
    

  return participantsProcessed
}

module.exports = participants
