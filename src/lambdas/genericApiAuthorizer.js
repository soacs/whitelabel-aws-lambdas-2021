let AWS = require('aws-sdk'),
    jwt = require('jsonwebtoken'),
    fs = require('fs');

let verifyAccessToken = async function(accessToken) {
    accessToken = accessToken.replace('Bearer ',''); 
    let cert = fs.readFileSync("/opt/pki/jwt_"+process.env.ENVIRONMENT+".pub");
    log('certs ----', cert);
    let decode = await jwt.verify(accessToken, cert, { algorithms: ['RS256'] });
    log('decoded token', decode);
    return decode;
};

let generatePolicyStatement = function (apiName, action) {
    let statement = {};
    statement.Action = process.env.invokeAction;
    statement.Effect = action;
    let methodArn = apiName;
    statement.Resource = methodArn;
    log('statement ----', statement);
    return statement;
};

let generatePolicy = async function (data, policyStatements) {
    let authResponse = {};
    authResponse.principalId = data.email;
    authResponse.context = {
        loginId: data.user_name,
        email: data.email,
        firmOid: data.firm_oid
    };
    let policyDocument = {};
    policyDocument.Version = process.env.policyDocumentVersion;
    policyDocument.Statement = policyStatements;
    authResponse.policyDocument = policyDocument;
    log('authResponse --', authResponse);
    return authResponse;
};

let generateIAMPolicy = async function (data) {
    let policyStatements = [];
    policyStatements.push(generatePolicyStatement(process.env.arn, "Allow"));
    log('policy Statements', policyStatements);
    return await generatePolicy(data, policyStatements);
};

exports.handler = async function(event, context) {
    console.log("START: Generic API AUTHORIZER");
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Received context:', JSON.stringify(context, null, 2));
    let iamPolicy = null;
    try {
        let data = await verifyAccessToken(event.authorizationToken);
        if (data.client_id === process.env.client_id && data.email && data.user_name) {
            log('Token and identity is correct ---', data.client_id);
            iamPolicy = await generateIAMPolicy(data);
        } else {
            log('Error : when token is correct but source is not trustworthy ---', data.client_id);
            let policyStatements = [];
            let policyStatement = generatePolicyStatement("*", "Deny");
            policyStatements.push(policyStatement);
            iamPolicy = await generatePolicy('user', null, policyStatements);
        }
    } catch (error) {
        log('Error : verifyAccessToken method has error ---', error);
        throw new Error("Unauthorized");
    }
    
    log('iamPolicy ---', iamPolicy);
    console.log("END: Generic API AUTHORIZER");
    return iamPolicy;
};

function log(message, variable) {
  if (process.env.ENVIRONMENT !== 'prod' && process.env.ENVIRONMENT !== 'uat') { 
    console.log(message, variable);
  }
}
