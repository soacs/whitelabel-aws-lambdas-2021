let AWS = require('aws-sdk'),
    region = "us-east-1",
    client = new AWS.SecretsManager({ region: region }),
    parsedSecret;

exports.handler = async (event) => {
    console.log('Recieved event', event);
    console.log('Recieved eventPassthroughData', event.Input.Payload);

    let getAwsSecretPromise = function (secretName) {
        log('secretName', secretName);
        return client.getSecretValue({
            SecretId: secretName
        }).promise();
    };
    const path = event.Input.Payload.path;
    const body = event.Input.Payload.passThroughData.body || null;
    console.log('payload path ---', event.Input.Payload.path);
    let getSecrets = async function (firmOid){
        log('typeof(secretName) ----', typeof(firmOid));
        const secrets = await getAwsSecretPromise(firmOid);
    
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
     
    let apiKeyAndSecrets = await getSecrets(event.Input.Payload.passThroughData.advisorInfo.firmOid);
    const httpMethod = event.Input.Payload.httpMethod;
    const GET_HTTPS_CONFIG = {
        hostname: process.env.apiHostName,
        port: '443',
        pathPrefix: '',
        agent: 'false',
        documentAPIHostName: null,
        marketDataProviderAPIHostName: null
    };
    
    const apiConfig = {
        fullResponse: true,
        autoParseJson: false,
        timeout: '31000',
        encryption: {
            type: 'sha256',
            base: 'base64'
            },
            keys: apiKeyAndSecrets.secrets,
            https_options: GET_HTTPS_CONFIG,
    };
    
    let payload = {
        obj: {
            method: httpMethod || 'POST',
            path: path
        },
        config: {
            memberId: (event.Input.Payload.passThroughData && event.Input.Payload.passThroughData.source === 'getAllAccountsPayload') ? event.Input.Payload.passThroughData.advisorInfo.username: null,
            selectedMemberId: null,
            fullResponse: apiConfig.fullResponse,
            autoParseJson: apiConfig.autoParseJson,
            timeout: apiConfig.timeout,
            keys: apiConfig.keys,
            encryption: apiConfig.encryption,
            https_options: apiConfig.https_options
        },
        apiPayload: body  // body will go here
    };
    
    log('payload ----', payload);
    

    return {
        nextState: 1,
        payload: payload,
        passThroughData: event.Input.Payload.passThroughData       
    }; 
};

function log(message, variable) {
  if (process.env.ENVIRONMENT !== 'prod' && process.env.ENVIRONMENT !== 'uat') { 
    console.log(message, variable);
  }
}
