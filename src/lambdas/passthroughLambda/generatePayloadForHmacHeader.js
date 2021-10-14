let AWS = require('aws-sdk'),
    region = "us-east-1",
    client = new AWS.SecretsManager({ region: region }),
    parsedSecret,
    generateHmacHeader = require('./generateHmacHeader.js').generateHmacHeader;

const generatePayloadforHmacHeader = {
   generatePayload: async (req) => {
        
        console.log("BEGIN: GENERATE PAYLOAD FOR HMAC HEADER FUNCTION");
        console.log('Received event:', JSON.stringify(req, null, 2));
        
        let getAwsSecretPromise = function (secretName) {
            log('secretName', secretName);
            return client.getSecretValue({
                SecretId: secretName
            }).promise();
        };
        
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
         
        let apiKeyAndSecrets = await getSecrets(req?.requestContext?.authorizer?.firmOid);
        
        const pathPrefix = function() {
            log('req.pathParameters', req.pathParameters);
            if (req.pathParameters !== null) {
                if (req.pathParameters.proxy.indexOf('foliofn') >= 0) {
                    return process.env.pathPrefix;
                }
            }
            return '';
        };
        
        const GET_HTTPS_CONFIG = {
            hostname: req.path.includes('integration-int') ? process.env.apiHostNameInternal : process.env.apiHostName,
            port: '443',
            pathPrefix: pathPrefix(),
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
        
        let getPath = function() {
            let path = '', queryString;
            if (req.queryStringParameters !== null) {
                let objectSize = Object.entries(req.queryStringParameters).length;
                log('objectSize ---- ', objectSize);
                if (objectSize > 0) {
                    queryString = '?';
                    let cnt = 0;
                    Object.entries(req.queryStringParameters).forEach(([key, value]) => {
                        queryString += `${key}=${value}`;
                        if (++cnt < objectSize) {
                            queryString += '&';
                        }
                    });
                    log('queryString in generate hmac payload header ---', queryString);
                }
                path = req.pathParameters.proxy+queryString;
            } else {
                path = req.pathParameters.proxy;
            }
            return path;
        };
        
        let payload = {
            obj: {
                method: req.requestContext.httpMethod,
                path: '/'+ getPath()
            },
            config: {
                // authenticatedLoginId: req?.requestContext?.authorizer?.principalId,
                authenticatedLoginId: null,
                selectedMemberId: null,
                fullResponse: apiConfig.fullResponse,
                autoParseJson: apiConfig.autoParseJson,
                timeout: apiConfig.timeout,
                keys: apiConfig.keys,
                encryption: apiConfig.encryption,
                https_options: apiConfig.https_options
            },
            apiPayload: req
        };
        
        log('payload ----', payload);
        
        let encryptedPayloadAndBody = await generateHmacHeader.hmacHeader(payload);
        log('let encryptedPayloadAndBody ---', encryptedPayloadAndBody);
        
        console.log("END: GENERATE PAYLOAD FOR HMAC HEADER FUNCTION");
        return encryptedPayloadAndBody;
    }
};

module.exports.generatePayloadforHmacHeader =  generatePayloadforHmacHeader;

function log(message, variable) {
  if (process.env.ENVIRONMENT !== 'prod' && process.env.ENVIRONMENT !== 'uat') { 
    console.log(message, variable);
  }
}
