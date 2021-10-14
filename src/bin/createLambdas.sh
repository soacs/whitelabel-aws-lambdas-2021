
#!/usr/bin/env bash

echo 'Build and Deploy in Creation mode for Lambda'

gulp build_lambdaFunction --lambdaFunctionName updateAuthorizer
gulp zip_lambdaFunction --lambdaFunctionName updateAuthorizer
gulp create_lambdaFunction --lambdaFunctionName updateAuthorizer
gulp updateFunctionConfiguration --lambdaFunctionName updateAuthorizer

gulp createAndDeploy --lambdaFunctionName updateAuthorizer


