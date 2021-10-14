const AWS = require('aws-sdk'),
    axios = require('axios'),
    region = "us-east-1",
    client = new AWS.SecretsManager({ region: region });
    
let response,
    parsedSecret;

exports.handler = async (event,context) => {
    
    console.log("BEGIN: EXTEND SESSION FUNCTION");
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Received context:', JSON.stringify(context, null, 2));

    let getPath = function() {
        let apiURL = '', queryString;
        if (event.queryStringParameters !== null) {
            let objectSize = Object.entries(event.queryStringParameters).length;
            if (objectSize > 0) {
                queryString = '?';
                let cnt = 0;
                Object.entries(event.queryStringParameters).forEach(([key, value]) => {
                    queryString += `${key}=${value}`;
                    if (++cnt < objectSize) {
                        queryString += '&';
                    }
                });
                log('queryString ---', queryString);
            }
            apiURL = process.env.oauthUrl+queryString;
        } 
        return apiURL;
    };
    
    let getAwsSecretPromise = function (secretName) {
            log('secretName', secretName);
            return client.getSecretValue({
                SecretId: secretName
            }).promise();
        };
    
    let getSecrets = async function (clientId){
            const secrets = await getAwsSecretPromise(clientId);
        
            if ('SecretString' in secrets) {
                parsedSecret = JSON.parse(secrets.SecretString);
                let apiKeyAndSecrets = {
                    secrets: parsedSecret
                };
                return apiKeyAndSecrets;
             } else {
                let buff = new Buffer(secrets.SecretBinary, 'base64');
                return buff.toString('ascii');
             }
         };
    
    let getToken = async function() {
        const clientKeyAndSecrets = await getSecrets(process.env.folioInstitutionalKey);
        log('clientKeyAndSecrets ===', clientKeyAndSecrets);
        const stringKey = clientKeyAndSecrets.secrets.apiKey+':'+clientKeyAndSecrets.secrets.apiSecret;
        const base64EncodedString =  Buffer.from(stringKey).toString('base64');
        log('base64EncodedString ----', base64EncodedString);
        return 'Basic '+base64EncodedString;
    };
    
    try {
        var config = {
          method: event.requestContext.httpMethod,
          url: getPath(),
          headers: {
            Authorization: await getToken(),
          }
        };
        
        log('config --', config); 
        
        let responseFromApi = await axios(config);
        log('responseFromApi ---', JSON.stringify(responseFromApi.data));
        response = generateResponse(responseFromApi.status, JSON.stringify(responseFromApi.data));
    } catch (error) {
        console.log('ERROR: EXTEND SESSION FUNCTION -- ' + error); 
        response = generateResponse(error.response.status, error.response.statusText);
    }
    console.log("END: EXTEND SESSION FUNCTION");
    return response;
};

function generateResponse(statusCode, body) {
    let response = {
            headers: {
             "Access-Control-Allow-Origin" : "*",
             "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token;ao-token",
             "Content-Type":"application/json",
             "Access-Control-Allow-Methods" : "GET,POST,OPTIONS,PUT,DELETE"
            },
            statusCode: statusCode,
            body: body,
        };
    return response;
}

function log(message, variable) {
  if (process.env.ENVIRONMENT !== 'prod' && process.env.ENVIRONMENT !== 'uat') { 
    console.log(message, variable);
  }
}
