const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = './credentials/calendar/token.json';

let arryARetornar = []

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listEvents (auth) {
  let sDate = (new Date()).toISOString()
  let sDateMaxTemp = sDate.split("T")
  let sDateMax = sDateMaxTemp[0]+"T23:59:59.000Z"
  let sEvento
  
  console.log(sDate)
  console.log(sDateMax)
  const calendar = google.calendar({version: 'v3', auth})
  calendar.events.list({
    calendarId: 'primary',
    timeMin: sDate,
    timeMax: sDateMax,
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err)
    const events = res.data.items
    if (events.length) {
      events.map((event, i) => {
        arryARetornar[i] = (`${event.summary}`)
      })
    } else {
      console.log('No upcoming events found.')
    }
  })
}

function getCalendar() {
	fs.readFile('./credentials/calendar/credentials.json', (err, content) => {
		if (err) return console.log('Error loading client secret file:', err);
		authorize(JSON.parse(content), listEvents);
	});
	return arryARetornar
	limpiarArry()
}

function limpiarArry() {
	for (var i = 0; i <= arryARetornar.length; i++) {
		arryARetornar[i] = ""
	}
}

module.exports = getCalendar