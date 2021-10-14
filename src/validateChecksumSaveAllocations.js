const AWS = require('aws-sdk');
const axios = require('axios');
var s3Bucket = new AWS.S3( { params: {Bucket: process.env.uploadedAllocationsBucket} } );
exports.handler = async (event) => {

    console.log('recevied event', event);

    const payload = event.Input.Payload;
    console.log('event advisorInfo', JSON.stringify(event.Input.Payload.passThroughData.advisorInfo));
    console.log('recevied payload1', JSON.stringify(payload));
    let checkSum = payload.passThroughData.checkSum;
    let memberOid = payload.passThroughData.advisorInfo.memberOid;
    
    const validateCheckSumUrl = `ria/v2/trades/allocations/upload/check?advisor=${memberOid}&fileChecksum=${checkSum}&fileScanSuccess=true`;
    var config = {
        method: 'POST',
        url: `https://${process.env.apiHostName}/${validateCheckSumUrl}`,
        headers: payload.hmacHeader,
        data: ''
    };
      
    console.log('config with hmacHeader--', config); 
      
    let validatedCheckSum = await axios(config);


    console.log('validatedCheckSumr--', validatedCheckSum); 

   if (validatedCheckSum.data && validatedCheckSum.data.fileChecksumPreviouslyExists) {
        console.log('duplicate file found --', validatedCheckSum.data);
        return {
            errors: [{
                message: 'There is already a same file submitted earlier, This is a duplicate file. Please wait for the process to complete. You will receive an email about the processing status'
            }],
            statusCode: 500
        };        
    }

    let base64Data = event.Input.Payload.passThroughData.base64Data;
    const csvContent = Buffer.from(base64Data, 'base64').toString();
    console.log('received data', csvContent);

      const advisorInfo = event.Input.Payload.passThroughData.advisorInfo;
      const fileName = advisorInfo.loginId + Date.now() + '.csv';
      try {
    
          const data = {
            Key: fileName, 
            Body: csvContent,
            Metadata: {
                memberOid: advisorInfo.memberOid, 
                loginId: advisorInfo.loginId, 
                email: advisorInfo.email, 
                firmOid: advisorInfo.firmOid,
                checkSum: event.Input.Payload.passThroughData.checkSum,
                fileId: validatedCheckSum.data.fileId
            },            
            ACL: 'bucket-owner-full-control',
            ContentEncoding: 'base64',
            ContentType: 'text/csv'
          };
    
        console.log('writing data', data);
        await s3Bucket.putObject(data).promise();
    
        console.log('written to s3');
        return {
            statusCode: 200,
            body: JSON.stringify('Submitted successfully')            
        };
    
      } catch (_error) {
        console.log('errror', _error);
        return {
          statusCode: 409, 
          body: JSON.stringify({ description: 'something went wrong', result: 'error' })
        };
      }
};
