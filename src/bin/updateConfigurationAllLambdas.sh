
#!/usr/bin/env bash

echo 'Update all Lambda Function Configurations'

gulp updateFunctionConfiguration --lambdaFunctionName apiAuthorizer
gulp updateFunctionConfiguration --lambdaFunctionName getAllFirmsConfig
gulp updateFunctionConfiguration --lambdaFunctionName getAllowedOrigins
gulp updateFunctionConfiguration --lambdaFunctionName getApiKeys
gulp updateFunctionConfiguration --lambdaFunctionName getDateTimestamp
gulp updateFunctionConfiguration --lambdaFunctionName updateAuthorizer
gulp updateFunctionConfiguration --lambdaFunctionName getFeatureFlags
gulp updateFunctionConfiguration --lambdaFunctionName getContentstackEntry
gulp updateFunctionConfiguration --lambdaFunctionName generateHmacHeader
gulp updateFunctionConfiguration --lambdaFunctionName generatePayloadForHmacHeader
gulp updateFunctionConfiguration --lambdaFunctionName stepFunctionsInvocation
gulp updateFunctionConfiguration --lambdaFunctionName apiPassthrough
gulp updateFunctionConfiguration --lambdaFunctionName apiAuthorizer-v2
