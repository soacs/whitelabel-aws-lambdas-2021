const AWS = require('aws-sdk'),
    axios = require('axios'),
    generateHmacHeaderPayload = require('./generatePayloadForHmacHeader.js').generatePayloadforHmacHeader;
    
let response;

exports.handler = async (event,context) => {
    
    console.log("BEGIN: PASSTHROUGH LAMBDA FUNCTION");
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Received context:', JSON.stringify(context, null, 2));

    let getPath = function(hostname) {
        let apiURL = '', queryString;
        if (event.queryStringParameters !== null) {
            let objectSize = Object.entries(event.queryStringParameters).length;
            log('objectSize ---- ', objectSize);
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
            apiURL = 'https://'+hostname+'/'+event.pathParameters.proxy+queryString;
        } else {
            apiURL = 'https://'+hostname+'/'+event.pathParameters.proxy;
        }
        return apiURL;
    };
    
    try {
        let hmacHeader = await generateHmacHeaderPayload.generatePayload(event);
        let hostname = event.path.includes('integration-int') 
            ? process.env.apiHostNameInternal 
            : process.env.apiHostName;
        
        log('let hostname ---', hostname);
    
        log('let hmacHeader ---', hmacHeader ? hmacHeader: '');
        
        if (hmacHeader) {
            var config = {
              method: event.requestContext.httpMethod,
              url: getPath(hostname),
              headers: hmacHeader,
              data: event.body
            };
            
            log('config --', config); 
            
            let responseFromApi = await axios(config);
            log('Response From Zuul Gateway ---', responseFromApi);
            response = generateResponse(responseFromApi.status, JSON.stringify(responseFromApi.data));
        } else {
            response = generateResponse('401', 'Error in generating Hmac Header');
        }
    } catch (error) {
        console.log('ERROR: PASSTHROUGH LAMBDA FUNCTION -- ',  error); 
        let restApiErrors = {
            errors: error?.response?.data?.errors ? error.response.data.errors : null,
            fieldErrors: error?.response?.data?.fieldErrors ? error.response.data.fieldErrors : null
        };
        response = generateResponse(error.response.status, JSON.stringify(restApiErrors));
    }
    log('response -----', response);
    console.log("END: PASSTHROUGH LAMBDA FUNCTION");
    return response;
};

function generateResponse(statusCode, body) {
    let response = {
            headers: {
             "Access-Control-Allow-Origin" : "*",
             "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token;ao-token","Content-Type":"application/json",
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


