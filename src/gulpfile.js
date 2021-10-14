var gulp = require('gulp');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
var gnf = require('gulp-npm-files');
var exec = require('child_process').exec;
var log = require('fancy-log');
var requireDir = require('require-dir');

requireDir( './gulp/tasks', { recurse: true } );
var print = require('gulp-print');

gulp.task('log', function(){
  console.log('testing log function for GULP script');
  exec('ls', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
});

gulp.task('clean_build', function () {
  var build = gulp.src('build/*', {read: false}).pipe(clean()).on('finish', function(){ log('Done!'); });;
  return merge(build);
});

gulp.task('clean_deploys', function () {
  var zipClean = gulp.src('deploys/*', {read: false}).pipe(clean());
  return merge(zipClean);
});

gulp.task('clean', 
  gulp.series('clean_build', 'clean_deploys')
);

// Copy dependencies to build/node_modules/ 
gulp.task('copyNpmDependenciesOnly', function() {
  gulp.src(gnf(), {base:'./'}).pipe(gulp.dest('./build'));
});


