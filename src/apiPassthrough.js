var AWS = require('aws-sdk');
var axios = require('axios');
let response;
let queryStringKey;
let queryStringValue;


exports.handler = async (event) => {

    let getPath = function() {
        let apiURL = '';
        if (event.apiPayload.queryStringParameters !== null) {
            Object.entries(event.apiPayload.queryStringParameters).forEach(([key, value]) => {
                queryStringKey = key;
                queryStringValue = value;
            });
            apiURL = process.env.apiHostName+event.apiPayload.pathParameters.proxy+'?'+queryStringKey+'='+queryStringValue;
        } else {
            apiURL = process.env.apiHostName+event.apiPayload.pathParameters.proxy;
        }
        return apiURL;
    };

    let config = {
      method: event.apiPayload.requestContext.httpMethod,
      url: getPath(),
      headers: event.authHeader,
      data: event.apiPayload.body
    };

    console.log('config --', config);

    try {
      let responseFromApi = await axios(config);
      response = {
            statusCode: responseFromApi.status,
            body: responseFromApi.data,
        };
    } catch (error) {
        console.log('error.reponse --- ', error.response);
        response = {
            statusCode: error.response.status,
            body: error.response.statusText,
        };
    }
    return response;
};
