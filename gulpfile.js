var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourceMap = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var debug = require('gulp-debug');

var scripts = {
	src: ['./src/**/*.module.js', './src/**/*.js'],
	dest: './dist/',
	maps: './maps'
};

gulp.task('default', function () {
	gulp.watch(scripts.src, ['build']);
});

gulp.task('build', function() {
	gulp
		.src(scripts.src)
		.pipe(sourceMap.init())
		.pipe(concat('ng-crashreport.js'))
		.pipe(gulp.dest(scripts.dest))
		.pipe(uglify())
		.pipe(rename('ng-crashreport.min.js'))
		.pipe(sourceMap.write(scripts.maps))
		.pipe(gulp.dest(scripts.dest));
});