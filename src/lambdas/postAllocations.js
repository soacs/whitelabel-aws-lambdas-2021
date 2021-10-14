const AWS = require('aws-sdk');
const axios = require('axios');
const s3 = new AWS.S3();
exports.handler = async (event) => {

    try {
        
        console.log('received payload', JSON.stringify(event.Input.Payload));
        
        const payload = event.Input.Payload;
        const key = event.Input.Payload.passThroughData.key;
        const passThroughData = event.Input.Payload.passThroughData;
        const advisorInfo = event.Input.Payload.passThroughData.advisorInfo;
        
        const url =  `https://${process.env.apiHostName}${passThroughData.path}`;

        var config = {
          method: 'POST',
          url: url,
          headers: payload.hmacHeader,
          data: passThroughData.body
        };
        
        console.log('config --', config); 
            
        let responseFromApi = await axios(config);        
        
        console.log('axios response', responseFromApi);
        

        const s3Key = key.substring(key.indexOf('/') + 1);

         var params = {
          Bucket: process.env.validatedUploadedProcessedAllocations, 
          CopySource: process.env.validatedUploadedToProcessAllocations + '/' + key,
          Key: 'processed/' + s3Key 
         };

        await s3.copyObject(params).promise();
         
        console.log('copied to processed', params); 
        await s3.deleteObject({  Bucket: process.env.validatedUploadedToProcessAllocations, Key: key }).promise();
        
        return {
            statusCode: 200,
            body: JSON.stringify('Your allocations submmitted!'),
        }
    } catch (_error) {
        console.log('error submitting to API', JSON.stringify(_error));
        return {
          statusCode: 409, 
          body: JSON.stringify({ description: 'something went wrong', result: 'error' })
        };
      }
    
};
