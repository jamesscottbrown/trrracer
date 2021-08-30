import {remote} from 'electron' 
import ElectronGoogleOAuth2 from '@getstation/electron-google-oauth2'
import {readFile, writeFile} from "./fileUtil";
import * as CREDENTIALS_PATH from '../assets/google_cred_desktop_app.json';

const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = 'token.json'


export async function authenticate() {
 
    console.log('this is firing')
    // eslint-disable-next-line
    const {client_secret, client_id, redirect_uris} = CREDENTIALS_PATH.installed

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

    try {
        

        const token = await readFile(TOKEN_PATH)
        oAuth2Client.setCredentials(JSON.parse(token))
        return oAuth2Client

    } catch (e) {
        console.log('before?')
        const electronOAuth = new ElectronGoogleOAuth2(client_id, client_secret, SCOPES);
        console.log('electron auth', electronOAuth)
        const token = await electronOAuth.openAuthWindowAndGetTokens()
        console.log('need to write file', token)
        await writeFile(TOKEN_PATH, JSON.stringify(token))

        oAuth2Client.setCredentials(token)
        return  oAuth2Client
    }
}