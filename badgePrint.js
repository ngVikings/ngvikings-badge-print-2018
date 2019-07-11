var fs = require('fs')
var _ = require('lodash')

function printParticipant (doc, participant, side) {
  doc.addPage()

  var height = doc.page.height
  var width = doc.page.width - 20
  var margin = 10

  var sessionInfo = participant.sessionInfo
  var categoryName = participant.categoryName
  var ticketName = participant.ticketName


  if ((categoryName === 'Speaker' && sessionInfo && side === 'back') || (categoryName === 'Trainee' && side === 'back')) {
    if (categoryName === 'Speaker') {
      doc.image('images/badge-print3.png', 0, 0, {
        height,
        width: doc.page.width
      })

      var talkTitle = sessionInfo.title
      var talkTime = sessionInfo.date + ', ' + sessionInfo.startTime
      var track = sessionInfo.track

      if (talkTitle) {
        doc.font('fonts/Oswald/Oswald-Bold.ttf')
          .fontSize(30)
          .fillColor('#0d1130')
        if (doc.widthOfString(talkTitle) > width) {
          doc.fontSize(24)
        }
        doc.text(talkTitle, margin, 120, {
          align: 'center',
          height,
        width})
      }

      if (talkTime) {
        doc.font('fonts/Oswald/Oswald-Regular.ttf')
          .fontSize(22)
          .fillColor('#e46025')
          .text(talkTime, {
            align: 'center',
            height,
          width})
      }

      if (track) {
        doc.font('fonts/Oswald/Oswald-Bold.ttf')
          .fontSize(18)
          .fillColor('#2556a6')
          .text(track, {
            align: 'center',
            height,
          width})
      }
    } else {
      doc.image('images/badge-print4.png', 0, 0, {
        height,
        width: doc.page.width
      })

      workshopName = ticketName.substring(10)

      doc.font('fonts/Oswald/Oswald-Bold.ttf')
        .fontSize(30)
        .fillColor('#0d1130')
      if (doc.widthOfString(workshopName) > width) {
        doc.fontSize(24)
      }
      doc.text(workshopName, margin, 120, {
        align: 'center',
        height,
      width})

      doc.font('fonts/Oswald/Oswald-Bold.ttf')
        .fontSize(18)
        .fillColor('#2556a6')
        .text('February 28th, 09:00-17:00', {
          align: 'center',
          height,
        width})
    }


  } else {
    doc.image(participant.image, 0, 0, {
      height,
      width: doc.page.width
    })

/*     var qrWidth = 70
    doc.image(
      qr.imageSync(participant.contactCard, {
        type: 'png'
      }),
      (doc.page.width - 210 - qrWidth) / 2, height - 50 - qrWidth, {
        width: qrWidth
      })  */

    // First name
    doc.font('fonts/Oswald/Oswald-Bold.ttf')
      .fontSize(48)
      .fillColor('#0d1130')
    if (doc.widthOfString(participant.firstName) > width) {
      doc.fontSize(40)
      if (doc.widthOfString(participant.firstName) > width) {
        doc.fontSize(36)
      }
    }

    doc
      .text(participant.firstName, margin, 110, {
        align: 'center',
        height,
      width})

    // Last name

    doc.font('fonts/Oswald/Oswald-Bold.ttf')
      .fontSize(24)
      .fillColor('#0d1130')
    if (doc.widthOfString(participant.lastName) > width) {
      doc.fontSize(20)
      if (doc.widthOfString(participant.lastName) > width) {
        doc.fontSize(18)
      }
    }

    doc
      .text(participant.lastName,  {
        align: 'center',
        height,
      width})

      // Company

    if (participant.company) {
      doc.font('fonts/Oswald/Oswald-Regular.ttf')
        .fontSize(18)
        .fillColor('#2556a6')
      if (doc.widthOfString(participant.company) > width) {
        doc.fontSize(12)
        if (doc.widthOfString(participant.company) > width) {
          doc.fontSize(10)
        }
      }
      doc.text(participant.company, margin, 215, {
        align: 'center',
        height,
      width})
    }

    if (participant.twitter && participant.twitter!='@') {
      doc.font('fonts/Oswald/Oswald-Regular.ttf')
        .fontSize(22)
        .fillColor('#e46025')
      doc.text(participant.twitter, 15, 250, {
        align: 'left',
        height,
      width})
    }
  }
}

var PDFDocument = require('pdfkit')
var qr = require('qr-image')

function badgePrint (participants, filename) {
  console.log('Started creating ' + filename + '...')

  // Create a document
  doc = new PDFDocument({
    size: [315, 436],
    autoFirstPage: false
  })

  doc.pipe(fs.createWriteStream(filename))

  for (var participant of participants) {

    if (participant['fullName'] != ' ') {
      printParticipant(doc, participant, 'front')
      // Back page
      printParticipant(doc, participant, 'back')
    } else {
      console.log('Empty name, skipping...')
    }
  }

  // Finalize PDF file
  doc.end()

  console.log('Finished creating ' + filename)
}

function blankBadgePrint (count, filename, category) {
  var IMAGES = {
    'Attendee': 'images/badge-print.png',
    'Trainee': 'images/badge-print4.png',
    'Speaker': 'images/badge-print3.png',
    'Crew': 'images/badge-print2.png'
  }

  console.log('Started creating ' + filename + '...')

  doc = new PDFDocument({
    size: [315, 436],
    autoFirstPage: false
  })
  doc.pipe(fs.createWriteStream(filename))

  var image = IMAGES[category || 'Attendee']

  for (var i = 0; i < count; i++) {
    doc.addPage()
    var height = doc.page.height
    doc.image(image, 0, 0, {
      height,
      width: doc.page.width
    })
    doc.addPage()
    doc.image(image, 0, 0, {
      height,
      width: doc.page.width
    })
  }

  doc.end()

  console.log('Finished creating ' + filename)
}

module.exports = {
  badgePrint,
blankBadgePrint}
