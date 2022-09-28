const ner = require('wink-ner');

const { GOOGLE_DRIVE_CREDENTIALS } = process.env;

const FOLDER_MAP = {
  jen: '1-SzcYM_4-ezaFaFguQTJ0sOCtW2gB0Rp',
  evobio: '120QnZNEmJNF40VEEDnxq1F80Dy6esxGC',
  ethics: '1GOu9GPI3_mLk8zXc08CNYkG-WfapQkAj',
};

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
  { text: 'Mariah', entityType: 'name', uid: 'MM' },
];

const replaceNames = (text) => {
  let myNER = ner();
  var winkTokenizer = require('wink-tokenizer');

  // Learn from the training data.
  myNER.learn(trainingData);

  var tokenize = winkTokenizer().tokenize;
  // Tokenize the sentence.
  var tokens = tokenize(text);
  // Simply Detect entities!
  tokens = myNER.recognize(tokens);

  tokens
    .filter((f) => f.entityType === 'name')
    .forEach((n, i) => {
      text = text.replace(n.originalSeq[0], n.uid);
    });

  return text;
};

const removeNameFromGoogleData = (data) => {
  for (const id of Object.keys(data)) {
    for (const e of data[id].body.content) {
      for (const el of (e.paragraph || {})?.elements || []) {
        el.textRun.content = replaceNames(el.textRun.content);
      }
    }
  }
};

// eslint-disable-next-line func-names
exports.handler = async function (event) {
  // Import needed libraries
  const googleapis = await import('googleapis');
  const { google } = googleapis;

  // Check querystring parameters are there and get them
  const { queryStringParameters } = event;

  // folderName and fileName are required
  if (queryStringParameters.fileName === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'fileName is missing' }),
    };
  }
  if (queryStringParameters.folderName === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'folderName is missing' }),
    };
  }
  const { fileName, folderName } = queryStringParameters;

  const serviceAccountCredentials = JSON.parse(GOOGLE_DRIVE_CREDENTIALS);
  const client = await google.auth.getClient({
    credentials: serviceAccountCredentials,
    scopes: 'https://www.googleapis.com/auth/drive.readonly',
  });

  const drive = await google.drive({
    version: 'v3',
    auth: client,
  });

  const fileQuery = await drive.files.list({
    corpora: 'drive',
    driveId: '0AFyqaJXF-KkGUk9PVA',
    includeItemsFromAllDrives: true,
    pageSize: 1000,
    q: `'${FOLDER_MAP[folderName]}' in parents and trashed = false and name = '${fileName}'`,
    supportsAllDrives: true,
  });

  if (fileQuery.data.files === undefined || fileQuery.data.files.length < 1) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: `Couldn't find file: ${fileName} in folder: ${folderName}`,
      }),
    };
  }

  const fileId = fileQuery.data.files[0].id;
  const fileType = fileQuery.data.files[0].mimeType;

  let file;
  let fileData;
  const filePieces = fileName.split('.');
  const fileExtension = filePieces[filePieces.length - 1];

  let shouldReverseBase64Encoding = false;

  if (fileType.includes('application/vnd.google-apps.document')) {
    file = await drive.files.export({
      alt: 'media',
      fileId,
      supportsAllDrives: true,
      mimeType: 'text/plain',
    });
    fileData = file.data;
  } else if (fileExtension === 'pdf' || fileExtension === 'png') {
    try {
      file = await drive.files.get(
        {
          alt: 'media',
          fileId,
          supportsAllDrives: true,
        },
        {
          responseType: 'arraybuffer',
        }
      );
    } catch {
      try {
        file = await drive.files.get(
          {
            acknowledgeAbuse: true,
            alt: 'media',
            fileId,
            supportsAllDrives: true,
          },
          {
            responseType: 'arraybuffer',
          }
        );
      } catch {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Unknown error',
          }),
        };
      }
    }

    if (queryStringParameters.raw) {
      shouldReverseBase64Encoding = true;
    }
    fileData = new Uint8Array(file.data);
    fileData = Buffer.from(fileData).toString('base64');
  } else if (fileExtension === 'json') {
    file = await drive.files.get({
      alt: 'media',
      fileId,
      supportsAllDrives: true,
    });

    if (fileName === 'goog_doc_data.json') {
      fileData = JSON.stringify(removeNameFromGoogleData(file.data));
    } else {
      fileData = JSON.stringify(file.data);
    }
  } else {
    file = await drive.files.get({
      alt: 'media',
      fileId,
      supportsAllDrives: true,
    });
    fileData = file.data;

    // Replace names in Otter AI transcript files
    if (fileName.endsWith('_otter_ai.txt')) {
      fileData = replaceNames(fileData);
    }
  }

  return {
    statusCode: 200,
    body: fileData,
    isBase64Encoded: shouldReverseBase64Encoding,
    headers: {
      'Cache-Control': 'max-age=172800', // 2 days in seconds
    },
  };
};
