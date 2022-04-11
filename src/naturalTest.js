import * as fs from 'fs';
import { readFile } from './fileUtil';
import * as googleCred from '../assets/google_cred_desktop_app.json';
import { saveJSON } from './components/ProjectContext';

const { google } = require('googleapis');
const natural = require('natural');
const sw = require('stopword');

export function txtConceptLink(file, concepts) {
  const { Trie } = natural;
  const trie = new Trie(false);

  // Add one string at a time
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(file);
  // tokens.map(t => trie.addString(t));
  trie.addStrings(tokens);

  const { NGrams } = natural;
  const grams = NGrams.bigrams(file);

  const toCheck = concepts.filter((f) => {
    const test = f.actions.filter((a) => a.action === 'deleted');
    return test.length === 0;
  });

  return toCheck.map((m) => {
    console.log(m);
    const letters = m.name.split(' ');

    const contains = letters.map((l) => {
      console.log('TESTING KEYS WITH PREFIX', trie.keysWithPrefix('ca'));
      return { token: l, bool: trie.contains(l) };
    });
    return {
      concept: m.name,
      contains, // trie.contains(m.name)
    };
  });
}

export async function googleConceptSearch(file, concepts) {
  console.log('is this firing in google??', file, concepts);

  const { fileId } = file;

  const oAuth2Client = new google.auth.OAuth2(
    googleCred.installed.client_id,
    googleCred.installed.client_secret,
    googleCred.installed.redirect_uris[0]
  );
  const token = readFile('token.json');
  oAuth2Client.setCredentials(JSON.parse(token));

  const gDoc = google.docs({ version: 'v1', auth: oAuth2Client });
  if (!fileId) {
    console.log('document id?', file, fileId);
  }

  if (fileId) {
    const googTest = await gDoc.documents.get({ documentId: fileId });

    const { Trie } = natural;
    const trie = new Trie();

    // Add one string at a time
    const tokenizer = new natural.WordTokenizer();

    googTest.data.body.content.map((con) => {
      if (con.paragraph) {
        con.paragraph.elements.map((el) => {
          if (el.textRun) {
            const tokens = tokenizer.tokenize(el.textRun.content);
            tokens.map((t) => trie.addString(t));
          }
        });
      }
    });

    const toCheck = concepts.filter((f) => {
      const test = f.actions.filter((a) => a.action === 'deleted');
      return test.length === 0;
    });

    // return toCheck.map(m=> {
    //     return {'concept': m.name, 'contains': trie.contains(m.name)};
    // });
    console.log('NEW CONCEPTS in GOOG', toCheck);

    return toCheck.map((m) => {
      console.log(m);
      const letters = m.name.split(' ');
      console.log(letters);

      const contains = letters.map((l) => {
        return { token: l, bool: trie.contains(l) };
      });
      return {
        concept: m.name,
        contains, // trie.contains(m.name)
      };
    });
  }
  return [];
}

export async function googleFileFrequentWords(file, ind, tokenizer, tfidf) {
  const { fileId } = file;

  const oAuth2Client = new google.auth.OAuth2(
    googleCred.installed.client_id,
    googleCred.installed.client_secret,
    googleCred.installed.redirect_uris[0]
  );
  const token = fs.readFileSync('token.json', { encoding: 'utf-8' });
  oAuth2Client.setCredentials(JSON.parse(token));

  const gDoc = google.docs({ version: 'v1', auth: oAuth2Client });

  if (file.fileId) {
    const googTest = await gDoc.documents.get({ documentId: fileId });

    const paragraphs = googTest.data.body.content
      .flatMap((con) => (con.paragraph ? con.paragraph.elements : []))
      .map((pa) => (pa.textRun ? pa.textRun.content : ''))
      .join(' ');

    const text = tokenizer.tokenize(paragraphs);

    const newT = sw.removeStopwords(text);

    const newNEW = newT.map((t, j) => natural.PorterStemmer.stem(t));

    // console.log(newNEW);

    tfidf.addDocument(newNEW);

    const { Trie } = natural;
    const trie = new Trie(false);

    trie.addStrings(newT);

    // YOU ARE SEARCHING for stemmed words
    file.tfidfID = ind;

    return tfidf
      .listTerms(ind)
      .slice(0, 20)
      .map((stem) => {
        stem.words = trie.keysWithPrefix(stem.term);
        return stem;
      });
  }
  return [];
}

export function getFrequentWords(projectData, title, state) {
  const { TfIdf } = natural;
  const tfidf = new TfIdf();
  let ind = 0;

  const tokenizer = new natural.WordTokenizer();

  const newEntries = projectData.entries.map((en) => {
    en.files = en.files.map((fi) => {
      if (fi.fileType === 'txt' || fi.fileType === 'rtf') {
        const text = tokenizer.tokenize(
          fs.readFileSync(`${title}/${fi.title}`, { encoding: 'utf8' })
        );
        const newT = sw.removeStopwords(text);

        const newNEW = newT
          .map((t, j) => natural.PorterStemmer.stem(t))
          .filter((f) => f.length > 2);

        tfidf.addDocument(newNEW);

        const { Trie } = natural;
        const trie = new Trie(false);

        trie.addStrings(newT);

        // YOU ARE SEARCHING for stemmed words
        fi.tfidfID = ind;
        fi.tfidfTop = tfidf
          .listTerms(ind)
          .slice(0, 20)
          .map((stem) => {
            stem.words = trie.keysWithPrefix(stem.term);
            return stem;
          });

        ind += 1;
      } else if (fi.fileType === 'gdoc') {
        googleFileFrequentWords(fi, ind, tokenizer, tfidf).then((pro) => {
          fi.tfidf = pro;
        });
      }

      return fi;
    });
    return en;
  });

  const newProj = { ...projectData, entries: newEntries };

  console.log('NEW NEW proj in frequent words', newProj);

  return saveJSON(newProj, state);
}
