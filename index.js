var participants = require("./participants");
var badgePrint = require('./badgePrint');
var fs = require('fs');
var moment = require('moment');
var argv = require('yargs')
    .usage('Usage: $0 --file [string] --programData [file] --category [Attendee,Trainee,Crew,Speaker] --date [31.01.2017]')
    .argv;

var category = argv.category || 'Attendee'
var startingDate = argv.date || null
var file = argv.file || null
var programData = null

if (argv.programData) {
  programData = JSON.parse(fs.readFileSync(argv.programData, 'utf8'));
}


// Delete 102, 200, 119

if (!argv.file) {
    console.log('Only blank badges will be printed. Usage: $0 --file [string]');
    badgePrint.blankBadgePrint(10, '5-blank-badges-' + category + '.pdf', category);
} else {
    badgePrint.badgePrint(participants(argv.file, category, moment(startingDate, "DD.MM.YYYY"), programData), 'badges-' + category + '.pdf');
}
