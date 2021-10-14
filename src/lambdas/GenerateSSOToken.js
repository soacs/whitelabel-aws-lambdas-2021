const AWS = require('aws-sdk');
const axios = require('axios');
exports.handler = async (event,context) => {

    console.log('event', event);
    const stepFunctions = new AWS.StepFunctions();
    
    const requestContext = event.requestContext;
    const vendor = event.queryStringParameters.vendor;
    const params = {
       "input": JSON.stringify({
            username: requestContext.authorizer.loginId,
            email: requestContext.authorizer.email,
            firmOid: requestContext.authorizer.firmOid,
            authorization: event.headers.Authorization,
            memberOid: event.queryStringParameters.memberOid,
            vendor: vendor,
            nextState: vendor === 'bondnav' ? 1 : 2
       }),
       "name": "MyExecution",
       "stateMachineArn": `arn:aws:states:us-east-1:${requestContext.accountId}:stateMachine:GenerateSSOToken`
    };

    console.log('start step functions', params);

    const response = await stepFunctions.startSyncExecution(params).promise();
    console.log('response', response);

    const outputResponse = JSON.parse(response.output);
    
    if (outputResponse.Payload.statusCode === 200) {
       const token = outputResponse.Payload.body;
       console.log('token returned', token);
       return returnResponse(200, token);
   }
    
    return  returnResponse(500, {errors: outputResponse.Payload.errors });
        
};

function returnResponse(status, message) {
    console.log('message', message);
    return {
                statusCode: status,
                 headers: {
                             "Access-Control-Allow-Origin" : "*",
                             "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token;ao-token","Content-Type":"application/json",
                             "Access-Control-Allow-Methods" : "GET,POST,OPTIONS",
                             "Content-Security-Policy": "default-src 'self'",
                             "X-Frame-Options": "SAMEORIGIN",
                             "X-XSS-Protection": "1; mode=block"
                },
                body: JSON.stringify(message)
            };    
}