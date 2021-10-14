const axios = require('axios');

exports.handler = async (event, context) => {

    console.log('Received context:', JSON.stringify(context, null, 2));
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    
    const authorization = event.headers.Authorization;
    const username = event.requestContext.authorizer.loginId;
    const email = event.requestContext.authorizer.email;
    
    
   var config = {
      method: 'GET',
      url: process.env.openTokenUrl+'generateToken',
      headers: {
          Authorization: authorization
      },
      params: {
        username,
        email
      }
    };
    
    /* var config = {
          method: 'GET',
          url: process.env.openTokenUrl+'generateTokenHardcodedEmail',
    }; */    
    
    
    console.log('config --', config); 
    
    try {
        let openTokenResponse = await axios(config);  
        console.log('openTokenResponse --', openTokenResponse); 
        return {
            headers: {
             "Access-Control-Allow-Origin" : "*",
             "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token;ao-token",
             "Content-Type":"application/json",
             "Access-Control-Allow-Methods" : "GET,POST,OPTIONS,PUT,DELETE"
            },        
            statusCode: 200,
            body: JSON.stringify(openTokenResponse.data)
        };
    }
    
    catch (error) {
        console.log('error --', error); 
        return {
            headers: {
             "Access-Control-Allow-Origin" : "*",
             "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token;ao-token",
             "Content-Type":"application/json",
             "Access-Control-Allow-Methods" : "GET,POST,OPTIONS,PUT,DELETE"
            },        
            statusCode: 500,
            body: JSON.stringify(error)
        };   
    }
    
    
};
