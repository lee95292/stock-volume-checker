//https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
//https://developers.google.com/sheets/api/guides/values
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const { argv } = require("process");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive"
];

const TOKEN_PATH = "token.json";

exports.updateSheet = async (spreadsheetId, range, resource) => {
  const auth = await exports.authorize();
  try {
    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      valueInputOption:"RAW",
      range,
      resource:{
        values: resource
      }
    });
  } catch (err) {
    console.log("error!", err);
  }
};

exports.authorize = async () => {
  const c = await fs.readFileSync("credentials.json");
  const credentials = JSON.parse(c);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  const token = await fs.readFileSync(TOKEN_PATH);

  if(token.length === 0){
    await getNewToken(oAuth2Client)
  }
  oAuth2Client.setCredentials(JSON.parse(token));

  return oAuth2Client;
};

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
    });
  });
}

