import { readFile } from './fileUtil';
import *  as googleCred from '../assets/google_cred_desktop_app.json';
import * as fs from 'fs';
const {WordNet} = require('node-wordnet');
const {google} = require('googleapis');
const natural = require('natural');
const sw = require('stopword');



export function testNat(file, concepts){

    var Trie = natural.Trie;
    var trie = new Trie(false);

    
    
    // Add one string at a time
    var tokenizer = new natural.WordTokenizer();
    let tokens = tokenizer.tokenize(file);
    //tokens.map(t => trie.addString(t));
    trie.addStrings(tokens);

    var NGrams = natural.NGrams;
    let grams = NGrams.bigrams(file);

    
    let toCheck = concepts.filter(f=> {
        let test = f.actions.filter(a=> a.action === 'deleted');
        return test.length === 0;
    });

    return toCheck.map(m=> {
        console.log(m);
       let letters = m.name.split(' ');
       
        let contains = letters.map(l => {
            console.log('TESTING KEYS WITH PREFIX',trie.keysWithPrefix('ca'));
            return {token: l, bool: trie.contains(l)}})
        return {
            'concept': m.name, 
            'contains': contains//trie.contains(m.name)
        };
    });

}

export async function googleConceptSearch(file, concepts){

    console.log('is this firing in google??', file, concepts);

    let fileId = file.fileId;

    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))

    let gDoc = google.docs({version: 'v1', auth: oAuth2Client});
    if(!fileId){
        console.log('document id?', file, fileId);
    }
    
    if(fileId){

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
    
        // return toCheck.map(m=> {
        //     return {'concept': m.name, 'contains': trie.contains(m.name)};
        // });
        console.log('NEW CONCEPTS in GOOG', toCheck);
    
        return toCheck.map(m=> {
            console.log(m);
           let letters = m.name.split(' ');
            console.log(letters);
    
            let contains = letters.map(l => {
                return {token: l, bool: trie.contains(l)}})
            return {
                'concept': m.name, 
                'contains': contains//trie.contains(m.name)
            };
        });

    }else{
        return [];
    }

    
}

export async function googleFileFrequentWords(file, ind, tokenizer, tfidf){

    let fileId = file.fileId;

    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = fs.readFileSync('token.json', {encoding: 'utf-8'});
    oAuth2Client.setCredentials(JSON.parse(token))

    let gDoc = google.docs({version: 'v1', auth: oAuth2Client});
  
    if(file.fileId){
     
        let googTest = await gDoc.documents.get({documentId: fileId});

        //console.log('goog',googTest)
        let paragraphs =  googTest.data.body.content.flatMap(con => con.paragraph ? con.paragraph.elements : []).map(pa => pa.textRun ? pa.textRun.content : "").join(' ');

        //console.log('PARAGRAPHS', paragraphs);

        let text = tokenizer.tokenize(paragraphs);

        const newT = sw.removeStopwords(text);//.filter(f => f.upperCase() != 'PRE');

        //console.log('NEWT', newT);
       
        let newNEW = newT.map((t, j)=> natural.PorterStemmer.stem(t));

        //console.log(newNEW);

        tfidf.addDocument(newNEW);

        var Trie = natural.Trie;
        var trie = new Trie(false);

        trie.addStrings(newT);

        //YOU ARE SEARCHING for stemmed words
        file.tldrID = ind;
        file.tldrTop = tfidf.listTerms(ind).slice(0, 20).map(stem=> {
            stem.words = trie.keysWithPrefix(stem.term);
            return stem;
        });

        console.log('file.tldr top!!',file.tldrTop);

        return await file;


    }else{
        return await file;
    }

    
}


export function getFrequentWords(projectData, state){

    var TfIdf = natural.TfIdf;
    var tfidf = new TfIdf();
    let ind = 0;

    var tokenizer = new natural.WordTokenizer();

    return projectData.entries.map(en => {

        en.files = en.files.map(fi => {
           
           if(fi.fileType === 'txt' || fi.fileType === 'rtf'){

            let text = tokenizer.tokenize(fs.readFileSync(`${state}/${fi.title}`,{ encoding: 'utf8' }));
            const newT = sw.removeStopwords(text);
           
            let newNEW = newT.map((t, j)=> natural.PorterStemmer.stem(t)).filter(f => f.length > 2);

            // let newNEW = newT.map((t, j)=> {
            //     let low = t.toLowerCase();
            //     return low}).filter(f => f.length > 2);

            tfidf.addDocument(newNEW);

            var Trie = natural.Trie;
            var trie = new Trie(false);

            trie.addStrings(newT);

            //YOU ARE SEARCHING for stemmed words
            fi.tldrID = ind;
            fi.tldrTop = tfidf.listTerms(ind).slice(0, 20).map(stem=> {
                stem.words = trie.keysWithPrefix(stem.term);
                return stem;
            });

            ind = ind + 1;
           }else if(fi.fileType === 'gdoc'){
                googleFileFrequentWords(fi, ind, tokenizer, tfidf).then(pro => {
                    fi = pro;
                });
            }
           
            return fi;
        });
        return en;
    });


}

export function testWordNet(projectData, state){
    //console.log('wordnet test firing??');

    var wordnet = new natural.WordNet();

    console.log('WORDNET', projectData.entries)

   
  
}

