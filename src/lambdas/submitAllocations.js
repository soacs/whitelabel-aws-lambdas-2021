const AWS = require('aws-sdk');
var s3Bucket = new AWS.S3( { params: {Bucket: process.env.validatedUploadedAllocations} } );
exports.handler = async (event) => {
    
    console.log('event received in submit allocations', event);
    console.log('event records', JSON.stringify(event.Records));

    const key = event.Records[0].s3.object.key;
    
    const s3Params = {
      Key: key
    };
    
    console.log('getting metadata', s3Params);
    const metaData = await s3Bucket.headObject(s3Params).promise();    
    
    console.log(' metaData ', metaData);
    
    const advisorInfo = {
        loginId: metaData.Metadata.loginid,
        memberOid: metaData.Metadata.memberoid,
        firmOid: metaData.Metadata.firmoid,
        email: metaData.Metadata.email
    }

    let readData = await s3Bucket.getObject({
                                Key: key
                            }).promise();

    const body = {
        fileId: metaData.Metadata.fileid,
        file: readData.Body.toString('base64')
    }
    console.log('read data', readData);
    const passThroughData = {
        checksum: metaData.Metadata.checksum,
        fileId: metaData.Metadata.fileid,
        body: JSON.stringify(body),
        advisorInfo,
        key
    }

    console.log('event', event);
    const stepFunctions = new AWS.StepFunctions();
    
    // const requestContext = event.requestContext;
    console.log('passThroughData', passThroughData);
    const params = {
       "input": JSON.stringify({
            passThroughData: passThroughData
       }),
       "name": "MyExecution",
       "stateMachineArn": `arn:aws:states:us-east-1:${process.env.accountId}:stateMachine:SubmitAllocations`
    };

    console.log('start step functions');

    const response = await stepFunctions.startSyncExecution(params).promise();
    console.log('response', response);

    const outputResponse = JSON.parse(response.output);    
    
    return response;
};


