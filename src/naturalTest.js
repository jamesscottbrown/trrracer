import { readFile } from './fileUtil';
import *  as googleCred from '../assets/google_cred_desktop_app.json';
import { start } from 'repl';

const {google} = require('googleapis');
const natural = require('natural');

export function testNat(file, concepts){

    // const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    // const token = await readFile('token.json')
    // oAuth2Client.setCredentials(JSON.parse(token))

    // let gDoc = google.docs({version: 'v1', auth: oAuth2Client});

    // gDoc.documents.get({documentId: '1Hham9i29Dcx2EJ97iy41q-K8NInWPAJmrupuXQ0LPM8'}).then((d)=>{
    //     console.log('dddd', d);
    // });

    var Trie = natural.Trie;

    var trie = new Trie();
    
    // Add one string at a time
    var tokenizer = new natural.WordTokenizer();
    let tokens = tokenizer.tokenize(file);
    tokens.map(t => trie.addString(t));
    console.log('CONCEPTSSS', concepts);
    let toCheck = concepts.filter(f=> {
        let test = f.actions.filter(a=> a.action === 'deleted');
        return test.length === 0;
    });

    console.log('NEW CONCEPTS', toCheck);

    return toCheck.map(m=> {
        return {'concept': m.name, 'contains': trie.contains(m.name)};
    });

}




export async function googleConceptSearch(file, concepts){

    let fileId = file.fileId;

    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = await readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))

    let gDoc = google.docs({version: 'v1', auth: oAuth2Client});

    let googTest = await gDoc.documents.get({documentId: fileId});

    var Trie = natural.Trie;
    var trie = new Trie();
    
    // Add one string at a time
    var tokenizer = new natural.WordTokenizer();

    googTest.data.body.content.map(con => {
   
        if(con.paragraph){
            con.paragraph.elements.map(el => {
                   
                if(el.textRun){
                    let tokens = tokenizer.tokenize(el.textRun.content);
                    tokens.map(t => trie.addString(t));
                }
            })
        }
        
    });

    let toCheck = concepts.filter(f=> {
        let test = f.actions.filter(a=> a.action === 'deleted');
        return test.length === 0;
    });

    return toCheck.map(m=> {
        return {'concept': m.name, 'contains': trie.contains(m.name)};
    });
}

