const AWS = require('aws-sdk');

exports.handler = async (event,context) => {

        
        return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'welcome to bondnav'
                })
            };
        
};