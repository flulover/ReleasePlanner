/**
 *
 * Created by yzzhou on 5/12/16.
 */
var gulp = require('gulp');
var gutil = require("gulp-util");
var browserify = require("browserify");
var path =require('path');
var fs = require('fs');
var source = require('vinyl-source-stream');

gulp.task('default', function () {
});

gulp.task('watch', function () {
    return gulp.watch(['src/**/*.js', '!src/App.js'], ['build']);
});

gulp.task('build', function () {
    browserify("./src/components/ReleasePlan.js")
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .pipe(source('App.js'))
        .on('error', onError)
        .pipe(gulp.dest('./src/'));
        // .pipe(fs.createWriteStream('./src/App.js));
        // .pipe(gulp.dest(path.resolve(__dirname, './src/App.js')));
});

function onError() {
    gutil.log(gutil.colors.red("ERROR", taskName), err);
    gutil.log(new gutil.PluginError(taskName, err, { showStack: true }));
    this.emit("end");
}

