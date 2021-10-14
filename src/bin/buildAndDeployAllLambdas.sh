
#!/usr/bin/env bash

echo 'Build and Deploy all Lambda Functions for stash to SBX'

gulp lambdaFunctionAll --lambdaFunctionName apiAuthorizer
gulp lambdaFunctionAll --lambdaFunctionName getAllFirmsConfig
gulp lambdaFunctionAll --lambdaFunctionName getAllowedOrigins
gulp lambdaFunctionAll --lambdaFunctionName getApiKeys
gulp lambdaFunctionAll --lambdaFunctionName getDateTimestamp
gulp lambdaFunctionAll --lambdaFunctionName getSecurity
gulp lambdaFunctionAll --lambdaFunctionName getFeatureFlags
gulp lambdaFunctionAll --lambdaFunctionName getContentstackEntry
gulp lambdaFunctionAll --lambdaFunctionName generateHmacHeader
gulp lambdaFunctionAll --lambdaFunctionName generatePayloadForHmacHeader
gulp lambdaFunctionAll --lambdaFunctionName stepFunctionInvocation
gulp lambdaFunctionAll --lambdaFunctionName apiPassthrough
gulp lambdaFunctionAll --lambdaFunctionName apiAuthorizer-v2

