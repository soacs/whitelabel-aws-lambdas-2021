var gulp = require('gulp');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
runSequence.options.ignoreUndefinedTasks = true;
var gnf = require('gulp-npm-files');
var exec = require('child_process').exec;
var argv = require('yargs').argv;
var lambdaFunctionName = argv.lambdaFunctionName;
console.log('lambdaFunctionName: ' + lambdaFunctionName);

gulp.task('build_lambdaFunction', function() {
    var apiAuthorizerLambda = gulp.src('lambdas/' + lambdaFunctionName + '.js').pipe(gulp.dest('build'));
    return apiAuthorizerLambda;
});

gulp.task('zip_lambdaFunction', function() {
    var zipIt = gulp.src('./build/**').pipe(zip(lambdaFunctionName + '.zip')).pipe(gulp.dest('deploys'));
    return zipIt;
});

gulp.task('deploy_lambdaFunction', function (cb) {
    exec('aws lambda update-function-code --function-name ' + lambdaFunctionName + ' --zip-file fileb:///Users/buonincontris/WebstormProjects/whitelabel-aws-lambdas/src/deploys/' + lambdaFunctionName + '.zip', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('updateFunctionConfiguration', function (cb) {
    console.log('update configuration of lambda: ' + lambdaFunctionName);
    exec('aws lambda update-function-configuration --function-name  ' + lambdaFunctionName + ' --runtime nodejs12.x --handler ' + lambdaFunctionName+'.handler --layers arn:aws:lambda:us-east-1:772387772726:layer:folio_node_modules_v12:10 --role arn:aws:iam::772387772726:role/FolioLambdaRole --memory-size 128' +
        ' --environment \"Variables = {\"ENVIRONMENT\"=\"sbx\"}\"', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('create_lambdaFunction', function (cb) {
    exec('aws lambda create-function --function-name ' + lambdaFunctionName + ' --runtime nodejs12.x --handler ' + lambdaFunctionName+'.handler --role arn:aws:iam::772387772726:role/FolioLambdaRole --zip-file fileb:///Users/buonincontris/WebstormProjects/whitelabel-aws-lambdas/src/deploys/' + lambdaFunctionName + '.zip --description AWSLambdaFunction --layers arn:aws:lambda:us-east-1:772387772726:layer:folio_node_modules_v12:1 --role arn:aws:iam::772387772726:role/FolioLambdaRole --memory-size 128' +
        ' --environment \"Variables = {\"ENVIRONMENT\"=\"sbx\"}\"', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('deleteLambda', function (cb) {
    console.log("process.argv = " + process.argv);
    exec('aws lambda delete-function --function-name '+ lambdaFunctionName + '', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('cleanBuildDir', function () {
    var build = gulp.src('build/*', {read: false}).pipe(clean());
    return merge(build);
});

gulp.task('lambdaFunctionAll',
    gulp.series('build_lambdaFunction', 'zip_lambdaFunction', 'deploy_lambdaFunction', 'updateFunctionConfiguration', 'cleanBuildDir')
);

gulp.task('createAndDeploy',
    gulp.series('build_lambdaFunction', 'zip_lambdaFunction', 'create_lambdaFunction', 'updateFunctionConfiguration', 'cleanBuildDir')
);


function defaultTask(cb) {
    // place code for your default task here
    cb();
}

exports.default = defaultTask
