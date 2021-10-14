const axios = require('axios');

exports.handler = async (event, context) => {

    console.log('Received context:', JSON.stringify(context, null, 2));
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    let vendor = event.Input.vendor;
    let advisorInfo;
    let username;
    let email;
    let authorization;
    let capelogicUserString;
    
    if (vendor === 'bondnav') {
        username = event.Input.username;
        email = event.Input.email;
        authorization = event.Input.authorization;
        
    } else {
        advisorInfo = event.Input.Payload.Input.Payload.passThroughData.advisorInfo;
        username = advisorInfo.username;
        email = advisorInfo.email;
        authorization = advisorInfo.authorization;
        vendor = advisorInfo.vendor;
        capelogicUserString = event.Input.Payload.capeLogicUserInfo;
    }
    

   var config = {
      method: 'GET',
      url: process.env.openTokenUrl+'generateToken',
      headers: {
          Authorization: authorization
      },
      params: {
        username,
        email,
        vendor,
        capelogicUserString
      }
    };
    
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
            body: openTokenResponse.data
        };
    }
    
    catch (error) {
        console.log('Error --', error); 
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
