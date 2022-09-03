const { GOOGLE_DRIVE_CREDENTIALS } = process.env;

const FOLDER_MAP = {
  jen: '1-SzcYM_4-ezaFaFguQTJ0sOCtW2gB0Rp',
  evobio: '120QnZNEmJNF40VEEDnxq1F80Dy6esxGC',
  ethics: '1GOu9GPI3_mLk8zXc08CNYkG-WfapQkAj'
};

// eslint-disable-next-line func-names
exports.handler = async function (event) {
  // Import needed libraries
  const googleapis = await import('googleapis');
  const { google } = googleapis;

  // Check querystring parameters are there and get them
  const { queryStringParameters } = event;

  // folderName is required
  if (queryStringParameters.folderName === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'folderName is missing' }),
    };
  }
  const { folderName } = queryStringParameters;

  const serviceAccountCredentials = JSON.parse(GOOGLE_DRIVE_CREDENTIALS);
  const client = await google.auth.getClient({
    credentials: serviceAccountCredentials,
    scopes: 'https://www.googleapis.com/auth/drive.readonly',
  });

  const drive = await google.drive({
    version: 'v3',
    auth: client,
  });

  const files = await drive.files.list({
    corpora: 'drive',
    driveId: '0AFyqaJXF-KkGUk9PVA',
    includeItemsFromAllDrives: true,
    pageSize: 1000,
    q: `'${FOLDER_MAP[folderName]}' in parents and trashed = false`,
    supportsAllDrives: true,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(files),
  };
};
