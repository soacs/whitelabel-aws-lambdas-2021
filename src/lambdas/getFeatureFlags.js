let AWS = require('aws-sdk'),
    LaunchDarkly = require('launchdarkly-node-server-sdk'),
    region = "us-east-1",
    secretName = "launchDarklySDKKey",
    sdkKey,
    parsedSecret,
    queryStringParameters,
    user;

let client = new AWS.SecretsManager({
    region: region
});

function getAwsSecretPromise() {
    return client.getSecretValue({
        SecretId: secretName
    }).promise();
}

exports.handler = async (event, context) => {
    // TODO implement

    console.log('event ---', event);

    if (event.httpMethod === "GET") {
        queryStringParameters = event.queryStringParameters;
        console.log('queryStringParameters: ' + queryStringParameters);
        user = queryStringParameters.user;
    }
    else {
        user = event.user;
    }
    const secret = await getAwsSecretPromise();

    if ('SecretString' in secret) {
            parsedSecret = JSON.parse(secret.SecretString);
            sdkKey = parsedSecret.SDK_KEY;
    } else {
        let buff = new Buffer(secret.SecretBinary, 'base64');
        sdkKey = buff.toString('ascii');
    }

    if (sdkKey) {
      let ldClient = await LaunchDarkly.init(sdkKey).waitForInitialization();

      // To get all the Flag values
      const ldFlagsState = await ldClient.allFlagsState({
        "key": user
      });
      const allFlags = await ldFlagsState.allValues();

      return {
          statusCode: 200,
          headers: {
                      "Access-Control-Allow-Origin" : "*",
                      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token","Content-Type":"application/json",
                      "Access-Control-Allow-Methods" : "GET,POST,OPTIONS",
              },
          body: JSON.stringify(allFlags)
      };
    } else {
      return {
          statusCode: 500,
          headers: {
                      "Access-Control-Allow-Origin" : "*",
                      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token","Content-Type":"application/json",
                      "Access-Control-Allow-Methods" : "GET,POST,OPTIONS",
              },
          body: 'Secret Key is not valid'
      };
    }
};
