const jsonfile = require('jsonfile')
const _ = require('lodash')
var fs = require('fs')

let fullBackup = jsonfile.readFileSync('./firestore.json')

let allCfpSpeakers = jsonfile.readFileSync('./firestore.json')['__collections__']['allCfpSpeakers']

delete fullBackup['__collections__']['allCfpSpeakers']
delete fullBackup['__collections__']['speakers']
delete fullBackup['__collections__']['sessions']


let speakers = jsonfile.readFileSync('./firestore.json')['__collections__']['speakers']
let sessions = jsonfile.readFileSync('./firestore.json')['__collections__']['sessions']

let approvedSpeakers = jsonfile.readFileSync('./accepted-object.json')

filteredSpeakers = {}

Object.keys(allCfpSpeakers).map(speakerKey => {
  let speaker = allCfpSpeakers[speakerKey]
  if (approvedSpeakers[speaker['name']]) {
    filteredSpeakers[speakerKey] = allCfpSpeakers[speakerKey]
  } else {
    // console.log(speaker['name'])
  }
})

Object.keys(filteredSpeakers).map(speakerKey => {
  let speaker = filteredSpeakers[speakerKey]

  let foundSpeaker = Object.keys(speakers).filter(existingSpeakerKey => {
    return speakers[existingSpeakerKey]['name'] == speaker['name']
  })
  if (foundSpeaker.length > 0) {
    console.log('Speaker exists ' + speaker['name'])
    speakers[speakerKey]['oldPhotoUrl'] = speaker['photoUrl']
    speakers[speakerKey]['photoUrl'] = speaker['photoUrl']
    speakers[speakerKey]['photo'] = speaker['photo']
  } else {
    speakers[speakerKey] = filteredSpeakers[speakerKey]
    console.log('Speaker added ' + speaker['name'])
  }
})

let filteredSessions = {}
Object.keys(sessions).map(sessionKey => {

    if ( parseInt(sessionKey) > 399 ) {
        
        if (sessions[sessionKey]['speakers'].length > 1) {
            console.log('Multiple')
        } else if( speakers[sessions[sessionKey]['speakers'][0]]) {
            console.log('Added session for ' + sessions[sessionKey]['speakers'][0])
            filteredSessions[sessionKey] = sessions[sessionKey]
        }

    } else {

        filteredSessions[sessionKey] = sessions[sessionKey]

    }
    
  })

console.log(Object.keys(filteredSessions).length)
fullBackup["__collections__"].speakers = speakers
fullBackup["__collections__"].sessions = filteredSessions


jsonfile.writeFileSync('./firestore-speakers.json', fullBackup)
