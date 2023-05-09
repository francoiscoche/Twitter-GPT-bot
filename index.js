require('dotenv').config();

const axios = require('axios');
const crypto = require('crypto');
const { Configuration, OpenAIApi } = require("openai");

// OPEN AI KEY
const apiKey = process.env.OPENAI_API_KEY

// TWITTER OAuth credentials
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const token = process.env.ACCESS_TOKEN_KEY;
const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

const configuration = new Configuration({
    apiKey: apiKey,
});

// Request data
const url = 'https://api.twitter.com/2/tweets';
const method = 'POST';

// Generate a timestamp and nonce
const timestamp = Math.floor(Date.now() / 1000);
const nonce = crypto.randomBytes(16).toString('hex');

// Create the OAuth signature
const signatureMethod = 'HMAC-SHA1';
const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(`oauth_consumer_key=${consumerKey}&oauth_nonce=${nonce}&oauth_signature_method=${signatureMethod}&oauth_timestamp=${timestamp}&oauth_token=${token}`)}`;
const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
const oauthSignature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
const authorizationHeader = `OAuth oauth_consumer_key="${consumerKey}", oauth_nonce="${nonce}", oauth_signature="${encodeURIComponent(oauthSignature)}", oauth_signature_method="${signatureMethod}", oauth_timestamp="${timestamp}", oauth_token="${token}"`;
// const authorizationHeader = `OAuth oauth_consumer_key="",oauth_token="",oauth_signature_method="HMAC-SHA1",oauth_timestamp="",oauth_nonce="",oauth_version="1.0",oauth_signature=""`;


// Send the request with the Authorization header
const openai = new OpenAIApi(configuration);
let response;

async function main() {
    response = await openai.createCompletion({
        // model: "text-curie-001",
        model: "text-davinci-003",
        prompt: "Ecrit un tweet bienveillant sur ton quotidien de developpeur.",
        max_tokens: 250,
        temperature: 0,
    });
    let chaineAvecGuillemets = response.data.choices[0].text;

    let res = chaineAvecGuillemets.replace(/["']/g, '');
    let data = { 'text': res };

    axios({
        url,
        method,
        data,
        headers: {
            Authorization: authorizationHeader
        }
    }).then(response => {
        console.log(response.data);
    }).catch(error => {
        console.error(error);
    });
}

main();
