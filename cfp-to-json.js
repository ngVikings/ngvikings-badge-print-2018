const XLSX = require('xlsx');
const jsonfile = require('jsonfile');
const _ = require('lodash');
const Axios = require('axios');
var fs = require('fs');

let speakerTemplate = {
  featured: true,
  __collections__: {}
};

let sessionTemplate = {
  language: 'English',
  __collections__: {}
};

let oldSpeakers = jsonfile.readFileSync('./firestore.json')['__collections__'][
  'previousSpeakers'
];

function processSocial(handle) {
  if (!handle) return null;
  handle = _.trim(handle);
  handle = handle.replace(' ', '');
  handle = handle.substring(0, 8) == 'https://' ? handle.substring(8) : handle;
  handle = handle.substring(0, 4) == 'www.' ? handle.substring(4) : handle;
  handle =
    handle.substring(0, 12) == 'twitter.com/' ? handle.substring(12) : handle;
  handle =
    handle.substring(0, 11) == 'github.com/' ? handle.substring(11) : handle;
  handle = _.trim(handle, '@');

  return handle;
}

function processSubmissions(filename) {
  let speakers = {};
  let sessions = {};
  let gdes = [];

  let workbook = XLSX.readFile(filename);
  var worksheet = workbook.Sheets[workbook.SheetNames[0]];
  var submissionsRaw = XLSX.utils.sheet_to_json(worksheet);

  console.log('Submissions loaded:');
  console.log(submissionsRaw.length);

  submissionsRaw = submissionsRaw.filter(submission => {
    return submission['Length of your talk (approximate)'] != 'Full day workshop (10:00 - 17:00)'
  })



  console.log('Submissions without workshops:');
  console.log(submissionsRaw.length);

  function compare(a, b) {
    if (a['Your name'] < b['Your name']) return -1;
    if (a['Your name'] > b['Your name']) return 1;
    return 0;
  }

  submissionsRaw.sort(compare);

  function downloadImage(url, id) {
    if (url.includes('imgur')) {
      let imgId = url.substr(url.lastIndexOf('/') + 1);

      let imgUrl = 'https://api.imgur.com/3/image/' + imgId;
      imgUrl = _.trim(imgUrl, '.jpg');

      Axios({
        method: 'GET',
        url: imgUrl,
        headers: {
          Authorization: 'Client-ID 14cf738426fa7cd'
        }
      })
        .then(response => {
          let imgLink = response.data.data.link;

          Axios({
            method: 'GET',
            url: imgLink,
            responseType: 'stream'
          })
            .then(response => {
              //console.log('Writing image for ' + id + ' from imgUr');

              response.data.pipe(
                fs.createWriteStream('./people/' + id + '.jpg')
              );
            })
            .catch(err => {
              console.error(
                'IMGUR: Error getting image for ' + id + ' URL ' + imgLink
              );
              console.error(err.response);
            });
        })
        .catch(err => {
          console.error('IMGUR: Error getting image for ' + id + ' URL ' + url);
        });
    } else if (url.includes('.jpg')) {
      Axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      })
        .then(response => {
          /*  console.log(
            'Writing image for ' +
              id +
              ' from generic URL ' +
              url
          ); */

          response.data.pipe(fs.createWriteStream('./people/' + id + '.jpg'));
        })
        .catch(err => {
          console.error('JPG: Error getting image for ' + id + ' URL ' + url);
        });
    } else {
      console.error('GENERIC: No info for getting image for ' + id);
    }
  }

  let speakerCounter = 1;
  let sessionCounter = 401;

  submissionsRaw.map(submission => {
    let speaker = Object.assign({}, speakerTemplate);
    speaker['socials'] = [];
    speaker['badges'] = [];
    speaker['sessions'] = [];

    speaker['order'] = speakerCounter;

    speaker['name'] = submission['Your name'] || null;

    let speakerId = submission['Your name'].toLowerCase().replace(/\s/g, '_');

    speaker['id'] = speakerId;
    speaker['bio'] = submission['A few words about you'] || null;
    speaker['shortBio'] = submission['A few words about you'] || null;

    speaker['company'] =
      submission['Company / Organization you work for'] || null;

    speaker['country'] = submission['Your country'] || null;

    speaker['photo'] = '/images/people/' + speakerId + '.jpg';
    speaker['photoUrl'] = speaker['photo'];

    if (submission['Twitter handle']) {
      speaker['socials'].push({
        link:
          'https://twitter.com/' + processSocial(submission['Twitter handle']),
        icon: 'twitter',
        name: 'Twitter'
      });
    }

    if (submission['Github profile']) {
      speaker['socials'].push({
        link:
          'https://github.com/' + processSocial(submission['Github profile']),
        icon: 'github',
        name: 'GitHub'
      });
    }

    if (submission['Your website']) {
      speaker['socials'].push({
        link: submission['Your website'],
        icon: 'website',
        name: 'Website'
      });
    }

    if (submission['A few words about you'].toLowerCase().includes('gde')) {
      speaker['badges'].push({
        link: 'https://developers.google.com/experts/',
        icon: 'gde',
        name: 'gde',
        description: 'Google Developer Expert'
      });

      gdes.push(submission['Your name']);
    }

    if (oldSpeakers[speakerId]) {
      console.log('Old speaker found ' + speakerId);

      speaker['sessions'] = oldSpeakers[speakerId]['sessions'];
    }

    if (!speakers[speakerId]) {
      console.log('Adding speaker ' + speakerId);
      speakers[speakerId] = speaker;

      //downloadImage(submission['An image of you (link)'], speakerId);

      speakerCounter++;
    }

    let session = Object.assign({}, sessionTemplate);

    session['speakers'] = [];
    session['tags'] = [];

    session['speakers'].push(speakerId);
    session['title'] = submission['Title of your talk'] || null;
    session['description'] = submission['Pitch of your talk'] || null;

    if(submission['Length of your talk (approximate)'] == 'Lightning talk (10 minutes)') {
      session['tags'].push('Lightning');
    }

    switch (submission['How advanced is your talk?']) {
      case 'Beginner level, anyone can attend':
        session['complexity'] = 'Beginner';
        break;
      case 'Advanced, people will need platform experience. But do not need to know the subject beforehand.':
        session['complexity'] = 'Advanced';
        break;
      case 'Expert, this talk appeals to people who are well-acquainted with the subject':
        session['complexity'] = 'Expert';
        break;
    }

    if (!sessions[sessionCounter]) {
      console.log('Adding session ' + sessionCounter);
      sessions[sessionCounter] = session;

      sessionCounter++;
    }
  });

  jsonfile.writeFileSync('./speakers.json', speakers, { spaces: 2 }, err => {
    if (err) console.error(err);
  });

  jsonfile.writeFileSync('./sessions.json', sessions, { spaces: 2 }, err => {
    if (err) console.error(err);
  });

  console.log('GDEs found');
  console.log(gdes);

  console.log('Unique speakers:');
  console.log(Object.keys(speakers).length);
}

processSubmissions('./Call for Presentations ngVikings 2019 (Responses).xlsx');
