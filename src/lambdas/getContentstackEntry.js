var AWS = require('aws-sdk'),
    ContentStack = require('contentstack'),
    environment,
    stackSecret;

exports.handler = async (event, context) => {

    console.log("BEGIN: getContentstackEntry");
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Received eventqueryStringParameters:', JSON.stringify(event.queryStringParameters, null, 2));
    console.log('Received context:', JSON.stringify(context, null, 2));

    var queryStringParameters = event.queryStringParameters;
     console.log('queryStringParameters: ', queryStringParameters);

    var contentType = queryStringParameters.contentType;
    var brand = queryStringParameters.brand;
//   var environment = queryStringParameters.environment;

    console.log('event.headers.origin', event.headers.origin);
    console.log('event.headers.origin.includes(ria-preview)', event.headers.origin.includes('ria-preview'));
    console.log('event.headers.origin.includes(ria-published)', event.headers.origin.includes('ria-published'));

    if (event.headers.origin.includes('ria-preview')) {
        environment = process.env.ENVIRONMENT_DEV;
        stackSecret = 'cs6cb60abff2bd5a078f53fff7';
    } else if (event.headers.origin.includes('ria-published')) {
        environment = process.env.ENVIRONMENT_PROD;
        stackSecret = 'csd4d98a5e5e3792fcfa632459';
    } else {
        environment = process.env.ENVIRONMENT_DEV;
        stackSecret = 'cs6cb60abff2bd5a078f53fff7';
    }


    console.log('contentType', contentType);
    console.log('brand', brand);
    console.log('environment', environment);

    // TODO implement secret fetching
    const contentStack = ContentStack.Stack(process.env.stackKey, stackSecret, environment);
    const Query = contentStack.ContentType(contentType).Query();
    const response = await Query
     .where('brand', brand)
     .includeContentType()
     .includeCount()
     .toJSON()
     .find();

   console.log('response #####',  JSON.stringify(response));
    return {
      statusCode: 200,
      headers: {
                  "Access-Control-Allow-Origin" : "*",
                  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token;ao-token","Content-Type":"application/json",
                  "Access-Control-Allow-Methods" : "GET,POST,OPTIONS",
          },
      body: JSON.stringify(response[0])
    };

};