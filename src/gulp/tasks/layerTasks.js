var gulp = require('gulp');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
runSequence.options.ignoreUndefinedTasks = true;
var gnf = require('gulp-npm-files');
var exec = require('child_process').exec;


gulp.task('zipNodeLayer', function() {
    var zipIt = gulp.src('./nodejs/node_modules/**').pipe(zip('nodejs.zip')).pipe(gulp.dest('deploys'));
    return zipIt;
});

gulp.task('updateNodeLayer', function (cb) {
    exec('aws  update-layer --zip-file fileb:///Users/dongarea/WebstormProjects/whitelabel-aws-lambdas/src/deploys/nodejs.zip', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('cleanNodeLayerZip', function() {
    return del("deploys/node_modules.zip");
});

gulp.task('nodeLayerAll',
    gulp.series('zipNodeLayer', 'updateNodeLayer', 'cleanNodeLayerZip')
);

