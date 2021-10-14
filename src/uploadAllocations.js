const AWS = require('aws-sdk');
var s3Bucket = new AWS.S3( { params: {Bucket: 'ria-allocations-dap'} } );
exports.handler = async (event) => {

console.log('event body', event.body);
let base64Data = event.body.split(';base64,').pop();
console.log('received data', base64Data);
var buffered = Buffer.from(base64Data, 'base64');

const csvContent = Buffer.from(base64Data, 'base64').toString();
console.log('received data', csvContent);

const bufS3 = Buffer.from(event.body.replace(/^data:csv\/\w+;base64,/, ""),'base64');


    let allocations = 'Allocations uploaded!';
    const csvParams = process.env.csvParams.split('#');
    
    console.log('csvParams to validate', csvParams);
    
    if(csvParams.some(csvParam => buffered.includes(csvParam))) {
        allocations = 'Allocations not uploaded!';
        console.log('invalid chars found');
        return generateResponse(502, allocations);

    }
    
    // const s3Client = new AWS.S3();
  try {
    /* await s3Client
      .putObject({
        Bucket: 'ria-allocations-dap',
        Key: 'advisorfile.csv',
        Body: base64Data,
      })
      .promise(); */
      const data = {
        Key: 'advisor1.csv', 
        Body: csvContent,
        ContentEncoding: 'base64',
        ContentType: 'text/csv'
      };

    console.log('writing data', data);
    await s3Bucket.putObject(data).promise();

    console.log('good written to s3');
    return generateResponse(200, allocations);

  } catch (_error) {
    // this is not ideal error handling, but good enough for the purpose of this example
    console.log('errro writing to s3', _error);
    return {
      statusCode: 409, 
      body: JSON.stringify({ description: 'something went wrong', result: 'error' })
    };
  }    
    
    // var bufferToString = buffered.toString();
    
    // console.log(bufferToString);


    // convert Buffer to string
    /* var data = bufferToString.split('\n') // split string to lines
    .map(e => e.trim()) // remove white spaces for each line
    .map(e => e.split(',').map(e => e.trim())); // split each line to array 

    console.log('array data', data);
    */
    


};

function generateResponse(statusCode, response) {
    return {
        headers: {
         "Access-Control-Allow-Origin" : "*",
         "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token;ao-token","Content-Type":"application/json",
         "Access-Control-Allow-Methods" : "GET,POST,OPTIONS,PUT,DELETE"
        },        
        statusCode: statusCode,
        body: JSON.stringify(response),
    };
}
