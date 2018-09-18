// ----------------------------------------------------------------------- GoogleCalendar
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';

//------------------------------------------------------------------------- Mio
const SerialPort = require('serialport')
const tarea = require('node-cron')

const ReadLine = SerialPort.parsers.Readline

const port = new SerialPort("COM3", { baudRate: 9600 })
const parser = port.pipe(new ReadLine({ delimiter: '\r\n' }))

let bEsperandoRespuesta = false
let bRespondida = false
let bMostrarEnDisplay = true

tarea.schedule('* * * * *', function () {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listEvents);
  });
})

//--------------------------------------------- Escuchar Arduino
parser.on('open', function () { console.log('connection is opened') })

parser.on('data', function (data) { readArduino(data.toString()) })
//--------------------------------------------------------------
// ----------------------------------------------------------------------- GoogleCalendar
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
//------------------------------------------------------------------------- Mio
function listEvents (auth) {
  let sDate = (new Date()).toISOString()
  let sDateMaxTemp = sDate.split("T")
  let sDateMax = sDateMaxTemp[0]+"T23:59:59.000Z"
  let sEvento
  
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
        console.log(`${event.summary}`)
        sEvento = (`${event.summary}`)
        if (bMostrarEnDisplay) {
          port.write("#1#lolita\n") 
        }
      })
    } else {
      console.log('No upcoming events found.')
    }
  })
}

function preguntarArduino (sNota) {
  port.write("#1#"+sNota+"\n")
  esperarRespuesta()
}

function esperarRespuesta () {
  let bIterar = true
  bEsperandoRespuesta = true

  while(bIterar){
    if (bRespondida) {
      bIterar = false
      bRespondida = false
      bEsperandoRespuesta = false
    }
  }
}

function readArduino (sDatosArduino) {
  if (bEsperandoRespuesta) {
    let sDatos = sDatosArduino
    let sDatosPrefijo = sDatos.substring(0, 4)
    let iLargoDatos = sDatos.length
    let sDatosFinal = sDatos.substring(4, iLargoDatos)

    if (sDatosPrefijo == "#01#") { 
      //Siguiente
      bRespondida = true
      bMostrarEnDisplay = true
    }
    if (sDatosPrefijo == "#02#") {  
      //Cancelar
      bRespondida = true
      bMostrarEnDisplay = false
    }     
  }
}  
