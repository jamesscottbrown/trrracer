import { readFile } from './fileUtil';
import *  as googleCred from '../assets/google_cred_desktop_app.json';

const {google} = require('googleapis');
const natural = require('natural');

export async function testNat(file, concepts){

    
    // const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    // const token = await readFile('token.json')
    // oAuth2Client.setCredentials(JSON.parse(token))
    // console.log('init client');
    // console.log('auth Instance', oAuth2Client)

    // let gDoc = google.docs({version: 'v1', auth: oAuth2Client});

    // gDoc.documents.get({documentId: '1Hham9i29Dcx2EJ97iy41q-K8NInWPAJmrupuXQ0LPM8'}).then((d)=>{
    //     console.log('dddd', d);
    // });

    // console.log('google docs', gDoc, );

    

    var Trie = natural.Trie;

    var trie = new Trie();
    
    // Add one string at a time
    var tokenizer = new natural.WordTokenizer();
    let tokens = tokenizer.tokenize(file);
    tokens.map(t => trie.addString(t));
    
    let checkerArray = concepts.map(m=> {
        return {'concept': m.name, 'contains': trie.contains(m.name)};
    });
    console.log('DOES IT CONTAIN THIS', checkerArray);
    
    // Or add many strings
    //trie.addStrings(["string1", "string2", "string3"]);

}
