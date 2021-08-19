const {google} = require('googleapis');
import { EventEmitter } from 'events';
import fs from 'fs';
const readline = require('readline');
import *  as googleCred from '../assets/google_cred_desktop_app.json';
import { readFile } from './fileUtil';

import { GoogleAuth } from './googleAuthSingleton';


const emitter = new EventEmitter();


class GoogleLoader {
    constructor(file, destination) {

      let authOb =  GoogleAuth.getInstance();

      this.fileName = file.name;
      this.filePath = file.path;
      this.destination = destination;

      this.CLIENT_ID = googleCred.installed.client_id;
      this.API_KEY = googleCred.installed.client_id;

      // Array of API discovery doc URLs for APIs used by the quickstart
      this.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      this.SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

      console.log('TOKEN in google thing', authOb.getToken(), authOb.getAuth());
      this.TOKEN = authOb.token;
     
    }

/**
 * Lists the user's first 10 task lists.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
listTaskLists(auth) {
  console.log('LIST TASK LIST')
  const service = google.tasks({version: 'v1', auth});
  service.tasklists.list({
    maxResults: 10,
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const taskLists = res.data.items;
    if (taskLists) {
      console.log('Task lists:');
      taskLists.forEach((taskList) => {
        console.log(`${taskList.title} (${taskList.id})`);
      });
    } else {
      console.log('No task lists found.');
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
getNewToken(oAuth2Client, callback) {
   console.log('GRET NEW TOKEN')
   emitter.setMaxListeners(20);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: this.SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  
  const rl = readline.createInterface({

    input: process.stdin,
    output: process.stdout,
  });
  console.log('rl', rl);
  var response;
  rl.question('Enter the code from that page here: ', (code) => {
    response = code;
    console.log('CONSOLE.LOG',code);
    rl.close();
    oAuth2Client.getToken("4/1AX4XfWhgFPF3Tk_16ijRGqeMwbRoiJ7KecCGpmkORUCCgZeZJ1HstJG_th8", (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);

      console.log('is this reaching');
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
     /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
async initClient() {

  const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
  const token = await readFile('token.json')
  oAuth2Client.setCredentials(JSON.parse(token))
  console.log('init client');
  console.log('auth Instance', oAuth2Client)
  let drive = google.drive({version: 'v3', auth: oAuth2Client});

  drive.files.list({
    q: "name='Artifact Trrracer Dev'",
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
    
  }).then(t => {
    
    console.log('result',t);
  })


}

async createGoogleFile(){

  const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
  const token = await readFile('token.json')
  oAuth2Client.setCredentials(JSON.parse(token))
  console.log('init client');
  console.log('auth Instance', oAuth2Client)
  let drive = google.drive({version: 'v3', auth: oAuth2Client});

  var parentId = '159mYuPKRRR15EI9m-yWXsGFLt8evWcHP';//some parentId of a folder under which to create the new folder
  var fileMetadata = {
    'name' : 'New Folder',
    'mimeType' : 'application/vnd.google-apps.folder',
    'parents': [parentId]
  };
  drive.files.create({
    resource: fileMetadata,
  }).then(function(response) {
    switch(response.status){
      case 200:
        var file = response.result;
        console.log('Created Folder Id: ', file.id);
        break;
      default:
        console.log('Error creating the folder, '+response);
        break;
      }
  });
}

          /**
       * Print files.
       */
    listFiles() {
      gapi.client.drive.files.list({
          'pageSize': 100,
          'fields': "nextPageToken, files(id, name)"
      }).then(function(response) {
          appendPre('Files:');
          console.log(response, response.result)
          var files = response.result.files;
          if (files && files.length > 0) {
              for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    appendPre(file.name + ' (' + file.id + ')');
                  }
          } else {
                  appendPre('No files found.');
          }
        });
      }
  
 
}

export default GoogleLoader;
  

    



    

   

      var authorizeButton = document.getElementById('authorize_button');
      var signoutButton = document.getElementById('signout_button');

      /**
       *  On load, called to load the auth2 library and API client library.
       */
      function handleClientLoad() {
        gapi.load('client:auth2', initClient);
      }

      /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
      function initClient() {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        }, function(error) {
          appendPre(JSON.stringify(error, null, 2));
        });
      }

      /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
      function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
          authorizeButton.style.display = 'none';
          signoutButton.style.display = 'block';
          listFiles();
        } else {
          authorizeButton.style.display = 'block';
          signoutButton.style.display = 'none';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }


