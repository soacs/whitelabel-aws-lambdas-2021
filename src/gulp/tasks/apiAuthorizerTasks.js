var gulp = require('gulp');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
runSequence.options.ignoreUndefinedTasks = true;
var gnf = require('gulp-npm-files');
var exec = require('child_process').exec;



gulp.task('build_apiAuthorizer', function() {
    var apiAuthorizerLambda = gulp.src('lambdas/apiAuthorizer.js').pipe(gulp.dest('build'));
    return apiAuthorizerLambda;
});

gulp.task('zipIt_apiAuthorizer', function() {
    var zipIt = gulp.src('./build/**').pipe(zip('apiAuthorizer.zip')).pipe(gulp.dest('deploys'));
    return zipIt;
});

gulp.task('updateApiAuthorizer', function (cb) {
    exec('aws lambda update-function-code --function-name apiAuthorizer --zip-file fileb:///Users/buonincontris/WebstormProjects/whitelabel-aws-lambdas/src/deploys/apiAuthorizer.zip', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('createApiAuthorizer', function (cb) {
    exec('aws lambda create-function --function-name apiAuthorizer --runtime nodejs8.10 --role arn:aws:iam::772387772726:role/FolioLambdaRole --zip-file fileb:/Users/buonincontris/WebstormProjects/whitelabel-aws/deploys/apiAuthorizer.zip --description AWSLambdaFunction --handler apiAuthorizer.handler', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('apiAuthorizerAll',
    gulp.series('build_apiAuthorizer', 'zipIt_apiAuthorizer', 'updateApiAuthorizer')
);

