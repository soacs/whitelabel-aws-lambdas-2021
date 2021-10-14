let AWS = require('aws-sdk'),
    region = "us-east-1",
    client = new AWS.SecretsManager({ region: region }),
    appSettingsTableName = 'AppSettings',
    billingPlanTableName = 'BillingPlan',
    docClient = new AWS.DynamoDB.DocumentClient(),
    parsedSecret;

exports.handler = async (event) => {
    console.log('Recieved event', event);
    
    
    //Will come from event later 
    event.authorizer = {
      customKey: '{"secrets":{"apiKey":"KQD0zIig6VGY4fxFfQ4p","sharedSecret":"r0rHPmYD1MY6gskvoen3s5YA3SKyhQ4DRmp8VOaP","folioAPIHTTPHostName":"apigw.dap.foliofn.com","clientSecret":"roboDevSecret","apiLoginId":"daveadvisor123"},"billingConfig":{"brand":"collaborationcapital","billingPlans":{"default":"6269010685921948456","firmId":"COLLABVPKGHSRYGC","memberNumber":"999"}}}',
      principalId: 'user',
      integrationLatency: 2259
    };
    
    //Will come from event later 
    event.method = "GET";
    event.path = "/restapi/members/cctestuser3";
    
    
    let secretsAndBillingData = JSON.parse(event.authorizer.customKey);
    
    console.log('Received event secretsAndBillingData', event.secretsAndBillingData);
    
    let obj = {
        method: event.method,
        path: event.path
    };
    
    console.log('secretsAndBillingData.billingConfig ---', secretsAndBillingData);
    
    const GET_HTTPS_CONFIG = () => {
        return {
            hostname: process.env.apiHostName,
            port: '443',
            pathPrefix: process.env.pathPrefix,
            agent: 'false',
            documentAPIHostName: process.env.documentAPIHostName,
            marketDataProviderAPIHostName: process.env.marketDataProviderAPIHostName
        };
    };
    
    const apiConfig = {
        fullResponse: true,
        autoParseJson: false,
        timeout: '31000',
        encryption: {
            type: 'sha256',
            base: 'base64'
        },
        keys: secretsAndBillingData.secrets,
        https_options: GET_HTTPS_CONFIG(),
    };
    
    let payload = {
        obj: obj,
        config: {
            authenticatedLoginId: null, // will populate once we have some strategy
            selectedMemberId: null, // will populate once we have some strategy
            fullResponse: apiConfig.fullResponse,
            autoParseJson: apiConfig.autoParseJson,
            timeout: apiConfig.timeout,
            keys: apiConfig.keys,
            encryption: apiConfig.encryption,
            https_options: apiConfig.https_options,
            billingPlanConfig: secretsAndBillingData.billingConfig.billingPlans.default
        }
    };
    
    console.log('payload ----', payload);
        
    return payload;
};

// Ideal Payload

//   var payload = {
//         obj : { 
//             method: 'GET',
//             path: '/robo/iq/program/firm/5332261958823719057' 
//         },
//         config : { 
//           authenticatedLoginId: null,
//           selectedMemberId: null,
//           remoteAddress: '::1',
//           fullResponse: true,
//           autoParseJson: false,
//           timeout: '31000',
//           certs: { key: './key.pem', cert: './server.crt' },
//           keys: 
//           { apiKey: 'KQD0zIig6VGY4fxFfQ4p',
//              sharedSecret: 'r0rHPmYD1MY6gskvoen3s5YA3SKyhQ4DRmp8VOaP',
//              apiLoginId: undefined,
//              folioAPIHTTPHostName: 'apigw.dap.foliofn.com' },
//           encryption: { type: 'sha256', base: 'base64' },
//           https_options: 
//           { 
//              hostname: 'apigw.dap.foliofn.com',
//              port: '443',
//              pathPrefix: '/foliofn',
//              agent: 'false',
//              verificationAPIHostname: 'https://verification.dapaws.foliofn.com',
//              documentAPIHostName: 'https://apigw-int.dap.foliofn.com',
//              marketDataProviderAPIHostName: 'http://foliomarketdata.dap.foliofn.com' 
//           },
//           billingPlanConfig: { firmId: 'FIRSTAJJLHDGULFG', memberNumber: '999' } 
//         }
//     };