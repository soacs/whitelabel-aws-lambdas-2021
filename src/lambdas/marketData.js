const AWS = require('aws-sdk'),
    axios = require('axios');
    
let response, data;

exports.handler = async (event,context) => {
    
    console.log("BEGIN: MARKET DATA FUNCTION");
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
            apiURL = process.env.marketDataUrl+queryString;
        } 
        return apiURL;
    };

    try {
        var config = {
          method: event.requestContext.httpMethod,
          url: getPath(),
          headers: {
            'client-app': 'fi-options-trading',
          }
        };
        
        log('config --', config); 
        
        let responseFromApi = await axios(config);
        responseFromApi.data.forEach((res) => {
            data = {
                symbol: res.symbol,
                status: res.status,
                lastTradeTime: res.lastTradeTime,
                lastTradePrice: res.lastTradePrice,
                percentChange: res.percentChange,
                assetClassName: res.fundamentals.longName
            };
        });
        
        log('responseFromApi ---', JSON.stringify(responseFromApi.data));
        response = generateResponse(responseFromApi.status, JSON.stringify(data));
    } catch (error) {
        console.log('ERROR: MARKET DATA FUNCTION -- ' + error); 
        response = generateResponse(error.response.status, error.response.statusText);
    }
    console.log("END: MARKET DATA FUNCTION");
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
