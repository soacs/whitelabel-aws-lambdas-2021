const axios = require('axios');

exports.handler = async (event) => {

    
    try {
        
    console.log('event received', event);
    console.log('event received passthrough', JSON.stringify(event.Input));
        const payload = event.Input.Payload;
        const passThroughData = event.Input.Payload.passThroughData;
        
        const url =  `https://${process.env.apiHostName}${passThroughData.path}`;

        var config = {
          method: 'GET',
          url: url,
          headers: payload.hmacHeader
        };
        
        /* console.log('config --', config); 

        let responseFromApi = await axios(config);        
        
        console.log('axios response', responseFromApi); */
        
        return {
            nextState: 1,
            Input: event.Input,
            response: ["RA4604300Z",
"RA4604300A"]
        }; 
    
    } catch (_error) {
        console.log('error getting API', JSON.stringify(_error));
        return {
            nextState: 1,
            Input: event.Input
        }; 
      }    
    
    
};
