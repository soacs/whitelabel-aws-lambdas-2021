let AWS = require('aws-sdk'),
    axios = require('axios'),
    response ='',
    queryStringKey,
    queryStringValue,
    region = "us-east-1",
    client = new AWS.SecretsManager({ region: region }),
    appSettingsTableName = 'AppSettings',
    billingPlanTableName = 'BillingPlan',
    docClient = new AWS.DynamoDB.DocumentClient(),
    parsedSecret;

const moment = require('moment');
const crypto = require('crypto');
const _ = require('lodash');

exports.handler = async (event) => {

    let getAwsSecretPromise = function (secretName) {
            console.log('secretName', secretName);
            return client.getSecretValue({
                SecretId: secretName
            }).promise();
        };

    let getAppSettingsItemByFirmOID = function(dataItems, firmOID) {
    	let res = dataItems.Items.find( (curItem) => {
    		return curItem.firmOID === firmOID;
    	});
    	return res;
    };

    let getBillingPlan = async function (brand) {
        var params = {
            TableName: billingPlanTableName,
            Key: {
                brand: brand
            }
        };
        return docClient.get(params).promise();
    };

    let getSecrets = async (firmOid) => {
        let params = {
             TableName: appSettingsTableName
         };
        let data = await docClient.scan(params).promise();
        let appSettingsData = getAppSettingsItemByFirmOID(data, firmOid);
        let secretName = appSettingsData.brand;
        const secrets = await getAwsSecretPromise(secretName);

        if ('SecretString' in secrets) {
            parsedSecret = JSON.parse(secrets.SecretString);
            let billingPlan = await getBillingPlan(secretName);
            let secretsAndBillingPlan = {
                secrets: parsedSecret,
                billingConfig: billingPlan.Item
            };
            return secretsAndBillingPlan;
         } else {
            let buff = new Buffer(secrets.SecretBinary, 'base64');
            return buff.toString('ascii');
         }
     };

    let secretsAndBillingData = await getSecrets(event.headers['x-folio-firmoid']);

    const pathPrefix = function() {
        console.log('event.pathParameters', event.pathParameters);
        if (event.pathParameters !== null) {
            if (event.pathParameters.proxy.indexOf('foliofn') >= 0) {
                return process.env.pathPrefix;
            }
        }
        return '';
    };

    const GET_HTTPS_CONFIG = {
        hostname: process.env.apiHostName,
        port: '443',
        pathPrefix: pathPrefix(),
        agent: 'false',
        documentAPIHostName: process.env.documentAPIHostName,
        marketDataProviderAPIHostName: process.env.marketDataProviderAPIHostName
    };

    const apiConfig = {
        fullResponse: true,
        autoParseJson: false,
        timeout: '31000',
        encryption: {
            type: 'sha256',
            base: 'base64'
        },
        keys: secretsAndBillingData.secrets,
        https_options: GET_HTTPS_CONFIG,
    };

    let getPath = function() {
            let path = '';
            if (event.queryStringParameters !== null) {
                Object.entries(event.queryStringParameters).forEach(([key, value]) => {
                    queryStringKey = key;
                    queryStringValue = value;
                });
                path = event.pathParameters.proxy+'?'+queryStringKey+'='+queryStringValue;
            } else {
                path = event.pathParameters.proxy;
            }
            return path;
        };

    let generatePayloadforHmacHeader =  (event) => {
        console.log('Recieved event.pathParameters.proxy', event.pathParameters.proxy);
        let payload = {
            obj: {
                method: event.requestContext.httpMethod,
                path: '/'+ getPath()
            },
            config: {
                authenticatedLoginId: null, // will populate once we have some strategy
                selectedMemberId: null, // will populate once we have some strategy
                fullResponse: apiConfig.fullResponse,
                autoParseJson: apiConfig.autoParseJson,
                timeout: apiConfig.timeout,
                keys: apiConfig.keys,
                encryption: apiConfig.encryption,
                https_options: apiConfig.https_options,
                billingPlanConfig: secretsAndBillingData.billingConfig.billingPlans.default
            }
        };

        return payload;
    };

    let payload = generatePayloadforHmacHeader(event);

    let obj = payload.obj,
        config = payload.config;

    let isDocumentApiHostname = false;

    const folioApiPrivate = {
        generatePath: function(obj) {
            let path = obj.pathSuffix;
            // path += obj.pathSuffix;
            console.log('obj.path ---', path);
            return path;
        },
        generateQueryString: function(qsData) {
            qsData = qsData || {};
            qsData = _.omitBy(qsData, _.isNil); // remove empty keys
            return _.isEmpty(qsData) ? false : qsData;
        },
        generatePostBody: function(body) {
            body = body || {};
            // body = _.omitBy(body, _.isNil); // remove empty keys
            return _.isEmpty(body) ? undefined : body;
        },
        generateURI: function(obj) {
            const hostNamePath = obj.hostname + obj.path;
            let uri = obj.isDocumentApiHostname ?  hostNamePath : 'https://' + hostNamePath;
            let qsData = obj.qsData;
            let objectSize = Object.keys(qsData).length;

            if (objectSize > 0) {
                let queryString = '?';
                let cnt = 0;
                for (let key in qsData) {
                    queryString += `${key}=${qsData[key]}`;
                    if (++cnt < objectSize) {
                        queryString += '&';
                    }
                }
                uri += queryString;
            }
            return uri;
        },
        generateTimeStamp: function() {
            let ts = moment().format('YYYY-MM-DDTHH:mm:ssZ'); // ISO-8601 formatted timestamp
            return ts;
        },
        generateMD5Body: function(body) {
            console.log('body in generateMD5Body ----', body);
            body = crypto.createHash('md5').update(body).digest('hex'); // MD5 hash request body
            return body;
        },
        generateStringToSign: function(obj) {
            console.log('objext in generateStringToSign ----', obj);
            let sts = Buffer.from(obj.httpVerb + '\n' + obj.uri + '\n' + obj.timestamp + '\n' + obj.md5Body).toString(); // UTF-8 encoding
            return sts;
        },
        generateSignature: function(obj) {
            console.log("The object for the signature passsed is", obj);
            let sign = crypto.createHmac(obj.encType, obj.sharedSecret).update(obj.stringToSign).digest(obj.encBase);
            return sign;
        },
        generateAuthHeader: function(obj) {
            let authHeader = 'FOLIOWS FOLIOWS_API_KEY=';
            authHeader += obj.apiKey;

            if (obj.memberId != null) {
                /*
                FOLLOWS_MEMBER_ID logged in users loginid (i.e. the advisor loginid in the case of FAFN robo)
                FOLLOWS_SELECTED_MEMBER_ID member id of the user whose accounts are currently selected in the robo app (i.e. the client memberid).
                 */
                authHeader += ',FOLIOWS_MEMBER_ID=';
                authHeader += encodeURIComponent(obj.memberId);
                authHeader += ',FOLIOWS_SELECTED_MEMBER_ID=';
                authHeader += encodeURIComponent(obj.selectedMemberId ? obj.selectedMemberId : obj.apiLoginId);
            }

            authHeader += ',FOLIOWS_SIGNATURE=';
            authHeader += encodeURIComponent(obj.signature);
            authHeader += ',FOLIOWS_TIMESTAMP=';
            authHeader += encodeURIComponent(obj.timestamp);

            return authHeader;
        },
        generateHeaders: function(authHeader, config) {

            let headers = {
                'Authorization':authHeader,
                'X-Associated-Member-Id':config.authenticatedLoginId || '',
                'content-type':'application/json',
            };
            if (config.remoteAddress) {
                headers['X-Forwarded-For'] = config.remoteAddress || '';
            }

            return headers;
        }
    };

    let api = {};
    api.httpVerb = obj.method || 'GET';
    api.path = folioApiPrivate.generatePath({
        pathPrefix: config.https_options.pathPrefix,
        pathSuffix: obj.path
    });
    api.queryStringData = obj.queryStringData || {};
    api.queryString = folioApiPrivate.generateQueryString(api.queryStringData);
    api.body = folioApiPrivate.generatePostBody(event.body);
    const hostname = isDocumentApiHostname ? config.https_options.documentAPIHostName :
        config.https_options.hostname || 'testapi.foliofn.com';

    api.uri = folioApiPrivate.generateURI({
        hostname: hostname,
        path: api.path,
        qsData: api.queryString,
        isDocumentApiHostname
    });
    api.timestamp = folioApiPrivate.generateTimeStamp();
    api.md5Body = folioApiPrivate.generateMD5Body(_.isEmpty(api.body) ? '' : api.body);
    api.stringToSign = folioApiPrivate.generateStringToSign({
        httpVerb: api.httpVerb,
        uri: api.uri,
        timestamp: api.timestamp,
        md5Body: api.md5Body
    });
    api.signature =
        folioApiPrivate.generateSignature({
            encType: config.encryption.type || 'sha256',
            encBase: config.encryption.base || 'base64',
            sharedSecret: config.keys.sharedSecret || '',
            stringToSign: api.stringToSign
        });

    api.authHeader =
            folioApiPrivate.generateAuthHeader({
            apiKey: config.keys.apiKey || '',
            apiLoginId: config.keys.apiLoginId || '',
            signature: api.signature,
            timestamp: api.timestamp,
            memberId: config.authenticatedLoginId || '',
            selectedMemberId: config.selectedMemberId || ''
        });

    let authHeader = folioApiPrivate.generateHeaders(
        api.authHeader,
        config,
    );

    let encryptedPayloadAndBody = {
        authHeader: authHeader
    };

    console.log('authHeader ----', encryptedPayloadAndBody);

    let getPathForPassThroughURL = function() {
        let apiURL = '';
        if (event.queryStringParameters !== null) {
            Object.entries(event.queryStringParameters).forEach(([key, value]) => {
                queryStringKey = key;
                queryStringValue = value;
            });
            apiURL = 'https://'+process.env.apiHostName+'/'+event.pathParameters.proxy+'?'+queryStringKey+'='+queryStringValue;
        } else {
            apiURL = 'https://'+process.env.apiHostName+'/'+event.pathParameters.proxy;
        }
        return apiURL;
    };

    var configForPassthrough = {
      method: event.requestContext.httpMethod,
      url: getPathForPassThroughURL(),
      headers: encryptedPayloadAndBody.authHeader,
      data: JSON.stringify(event.body)
    };

    console.log('config --', configForPassthrough);

    try {
      let responseFromApi = await axios(configForPassthrough);
      console.log('responseFromApi ---', responseFromApi);
      response = {
            statusCode: responseFromApi.status,
            body: JSON.stringify(responseFromApi.data)
        };
    } catch (error) {
        console.log('error.reponse --- ', error.response);
        response = {
            statusCode: error.response.status,
            body: error.response.statusText,
        };
    }
    return response;
};
