var ner = require( 'wink-ner' );

const trainingData = [
    { text: 'Derya', entityType: 'name', uid: 'DA' },
    { text: 'Darya', entityType: 'name', uid: 'DA' },
    { text: 'dariya', entityType: 'name', uid: 'DA' },
    { text: 'Dario', entityType: 'name', uid: 'DA' },
    { text: 'James', entityType: 'name', uid: 'JSB' },
    { text: 'Jen', entityType: 'name', uid: 'J' },
    { text: 'Alex', entityType: 'name', uid: 'A' },
    { text: 'Jim', entityType: 'name', uid: 'J' },
    { text: 'John', entityType: 'name', uid: 'J' },
    { text: 'Jason', entityType: 'name', uid: 'JD' },
    { text: 'Miriah', entityType: 'name', uid: 'MM' },
    { text: 'Mariah', entityType: 'name', uid: 'MM' }
  ];

  export const replaceNames = (text) => {

    let myNER = ner();
    var winkTokenizer = require( 'wink-tokenizer' );

       // Learn from the training data.
    myNER.learn( trainingData );

    var tokenize = winkTokenizer().tokenize;
    // Tokenize the sentence.
    var tokens = tokenize(text);
    // Simply Detect entities!
    tokens = myNER.recognize( tokens );

    tokens.filter(f => f.entityType === 'name').forEach((n, i) => {
      text = text.replace(n.originalSeq[0], n.uid);
    })

    return text;
  }