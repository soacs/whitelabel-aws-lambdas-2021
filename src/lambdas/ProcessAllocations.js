const AWS = require('aws-sdk');
const axios = require('axios');
exports.handler = async (event,context) => {

    console.log('event', event);
    const stepFunctions = new AWS.StepFunctions();
    
    const requestContext = event.requestContext;
    const params = {
       "input": JSON.stringify({
            loginId: requestContext.authorizer.loginId,
            email: requestContext.authorizer.email,
            firmOid: requestContext.authorizer.firmOid,
            inputData: event.body,
            memberOid: event.queryStringParameters.memberOid
       }),
       "name": "MyExecution",
       "stateMachineArn": `arn:aws:states:us-east-1:${requestContext.accountId}:stateMachine:UploadAllocations`
    };

    console.log('start step functions');

    const response = await stepFunctions.startSyncExecution(params).promise();
    console.log('response', response);

    const outputResponse = JSON.parse(response.output);

    if (outputResponse.Payload.statusCode === 200) {
        return  returnResponse(200, 'Allocations are submmited');
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
                             "X-XSS-Protection": "1; mode=block",
                             "Strict-Transport-Security:": "max-age=31536000; includeSubDomains"
                },
                body: JSON.stringify(message)
            };    
}