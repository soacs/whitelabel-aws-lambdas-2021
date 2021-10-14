var gulp = require('gulp');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
var gnf = require('gulp-npm-files');
var exec = require('child_process').exec;
var argv = require('yargs').argv;
var lambdaFunctionName = argv.lambdaFunctionName;
console.log('lambdaFunctionName 1: ' + lambdaFunctionName);

gulp.task('updateFunctionConfiguration', function (cb) {
        console.log('update configuration of lambda: ' + lambdaFunctionName);
        exec('aws lambda update-function-configuration --function-name  ' + lambdaFunctionName + ' --runtime nodejs12.x --handler ' + lambdaFunctionName+'.handler --layers arn:aws:lambda:us-east-1:772387772726:layer:folio_node_modules_v12:1 --role arn:aws:iam::772387772726:role/FolioLambdaRole --memory-size 128' +
        ' --environment \"Variables = {\"ENVIRONMENT\"=\"sbx\"}\"', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

function defaultTask(cb) {pwd
  // place code for your default task here
  cb();
}

exports.default = defaultTask
