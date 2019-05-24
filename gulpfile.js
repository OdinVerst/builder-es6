const gulp = require('gulp'),
	rigger = require('gulp-rigger'),
	prefixer = require('gulp-autoprefixer'),
	del = require('del'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	minify = require('gulp-minify'),
	browserSync = require('browser-sync'),
	rollup = require('gulp-better-rollup'),
	sourcemaps = require('gulp-sourcemaps'),
	plumber = require('gulp-plumber'),
	reload = browserSync.reload,
	svgSprite = require('gulp-svg-sprite'),
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
	replace = require('gulp-replace');

//Таск browser-sync
gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: './build'
		}
	});
});

//Перенос Html в build
gulp.task('html:build', function() {
	return gulp
		.src('./src/*.html')
		.pipe(rigger())
		.pipe(gulp.dest('./build'))
		.pipe(reload({ stream: true }));
});

//Очистка build
gulp.task('clean', function() {
	return del(['build']);
});
//Js rollup
gulp.task('js:rollup', function() {
	return gulp
		.src('src/js/main.js')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(rollup({}, 'iife'))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('build/js'));
});
//Перенос библиотек JS
gulp.task('js-common:build', function() {
	return gulp.src('./src/js-common/**/*.js').pipe(gulp.dest('./build/js/'));
});

//Таск по стилям
gulp.task('sass', function() {
	return gulp
		.src('./src/scss/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(
			prefixer({
				browsers: [
					'last 3 version',
					'> 1%',
					'ie 8',
					'ie 9',
					'Opera 12.1',
					'Firefox >= 2'
				],
				cascade: false
			})
		)
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('style.css'))
		.pipe(
			minify({
				ext: {
					src: '',
					min: '.min.css'
				},
				noSource: false
			})
		)
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./build/css'));
});

//Шрифты
gulp.task('fonts:build', function() {
	return gulp.src('./src/fonts/**/*.*').pipe(gulp.dest('./build/fonts/'));
});

//Изображения растр
gulp.task('img:build', function() {
	return gulp.src('./src/img/other/*.*').pipe(gulp.dest('./build/images/'));
});
//Изображения SVG
gulp.task('sprite:svg', function() {
	return gulp
		.src('./src/img/svg/*.svg')
		.pipe(
			svgmin({
				js2svg: {
					pretty: true
				}
			})
		)
		.pipe(
			cheerio({
				run: function($) {
					$('[fill]').removeAttr('fill');
					$('[stroke]').removeAttr('stroke');
					$('[style]').removeAttr('style');
				},
				parserOptions: { xmlMode: true }
			})
		)
		.pipe(replace('&gt;', '>'))
		.pipe(
			svgSprite({
				mode: {
					symbol: {
						sprite: '../sprite-vector.svg'
					}
				}
			})
		)
		.pipe(gulp.dest('./build/images/'));
});

//Отслеживание изменений
gulp.task('watch', function() {
	gulp.watch('./src/**/*.html', gulp.series('html:build'));
	gulp.watch('./src/js/**/*.js', gulp.series('js:rollup'));
	gulp.watch('./src/js-common/**/*.js', gulp.series('js-common:build'));
	gulp.watch('./src/scss/**/*.scss', gulp.series('sass'));
	gulp.watch('./src/img/other/*.*', gulp.series('img:build'));
	gulp.watch('./src/img/svg/*.*', gulp.series('img:build'));
});

//Дефолтный таск
gulp.task(
	'default',
	gulp.series(
		'clean',
		gulp.parallel(
			'html:build',
			'js:rollup',
			'js-common:build',
			'sass',
			'fonts:build',
			'img:build',
			'sprite:svg'
		),
		gulp.parallel('watch', 'browser-sync')
	)
);
