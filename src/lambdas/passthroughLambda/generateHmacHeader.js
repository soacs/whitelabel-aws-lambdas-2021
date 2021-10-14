const moment = require('moment'); 
const crypto = require('crypto'); 
const _ = require('lodash'); 

const generateHmacHeader = {
    hmacHeader : async (req) => {
        console.log("BEGIN: GENERATE HMAC HEADER FUNCTION");
        log('Received event:', JSON.stringify(req, null, 2));
    
        let obj = req.obj, config = req.config, apiPayload = req.apiPayload;
        
        let isDocumentApiHostname = false;
    
        const folioApiPrivate = {
            generatePath: function(obj) {
                let path = obj.pathSuffix;
                log('obj.path ---', path);
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
                log('qsData ---- ', qsData);
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
                log('body in generateMD5Body ----', body);
                body = crypto.createHash('md5').update(body).digest('hex'); // MD5 hash request body
                return body;
            },
            generateStringToSign: function(obj) {
                log('objext in generateStringToSign ----', obj);
                let sts = Buffer.from(obj.httpVerb + '\n' + obj.uri + '\n' + obj.timestamp + '\n' + obj.md5Body).toString(); // UTF-8 encoding
                return sts;
            },
            generateSignature: function(obj) {
                log("The object for the signature passsed is", obj);
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
                    'content-type':'application/json'
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
        api.body = folioApiPrivate.generatePostBody(apiPayload.body);
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
        
        let encryptedPayloadAndBody = authHeader;
        
        log('authHeader ----', encryptedPayloadAndBody);
        
        console.log("END: GENERATE HMAC HEADER FUNCTION");
    
        return encryptedPayloadAndBody;
    }
};

module.exports.generateHmacHeader =  generateHmacHeader;

function log(message, variable) {
  if (process.env.ENVIRONMENT !== 'prod' && process.env.ENVIRONMENT !== 'uat') { 
    console.log(message, variable);
  }
}
