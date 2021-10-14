const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

AWS.config.update({
    maxRetries: 2,
    httpOptions: {
        timeout: 30000,
        connectTimeout: 5000
    }
});

exports.handler = (event, context, callback) => {
  
  const stateMachineArn = 'arn:aws:states:us-east-1:772387772726:stateMachine:RIAMiddlewareExpressStateMachine';
  const params = {
    stateMachineArn,
    input: JSON.stringify(event),
  };
  
  console.log('event from step invocation function --- ', event);

  stepfunctions.startSyncExecution(params).promise().then((data) => {
    const apiData = JSON.parse(data.output);
    console.log('apiData---', apiData.statusCode);
    const response = {
      statusCode: apiData.statusCode,
      headers: {
         "Access-Control-Allow-Origin" : "*",
         "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-firm-oid,x-folio-firmoid,X-Amz-Security-Token;ao-token","Content-Type":"application/json",
         "Access-Control-Allow-Methods" : "GET,POST,OPTIONS,PUT,DELETE"
      },
      body: JSON.stringify(apiData.body)
    };
    
    callback(null, response);
  }).catch(error => {
    console.log('error---', error);
    callback(error.message);
  });
 
};