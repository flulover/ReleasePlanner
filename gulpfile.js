/**
 *
 * Created by yzzhou on 5/12/16.
 */
var gulp = require('gulp');
var browserify = require("browserify");
var path =require('path');
var fs = require('fs');
var source = require('vinyl-source-stream');

gulp.task('default', function () {
});

gulp.task('watch', function () {
    return gulp.watch('src/**/*.js', ['build']);
});

gulp.task('build', function () {
    browserify("./src/components/ReleasePlan.js")
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .pipe(source('App.js'))
        .pipe(gulp.dest('./src/'));
        // .pipe(fs.createWriteStream('./src/App.js));
        // .pipe(gulp.dest(path.resolve(__dirname, './src/App.js')));
});

