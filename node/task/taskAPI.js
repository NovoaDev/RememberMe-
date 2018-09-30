const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/tasks.readonly'];
const TOKEN_PATH = './credentials/task/token.json';

let arryARetornar = []

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
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

function listTaskLists(auth) {
  let sEvento
  let i = 0

  const service = google.tasks({version: 'v1', auth});
  service.tasks.list({
    maxResults: 100,
    tasklist: '@default',
    
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const taskLists = res.data.items;
    if (taskLists) {
      taskLists.forEach((taskList) => {
        arryARetornar[i] = (`${taskList.title}`);
        console.log(`${taskList.title}`)
        i++
      });
    } else {
      console.log('No task lists found.');
    }
  });
}

function getTask() {
  fs.readFile('./credentials/task/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listTaskLists);
  });
  return arryARetornar
  limpiarArry()
}

function limpiarArry() {
  for (var i = 0; i <= arryARetornar.length; i++) {
    arryARetornar[i] = ""
  }
}

module.exports = getTask