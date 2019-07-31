const gulp = require('gulp');
const prefixer = require('gulp-autoprefixer');
const del = require('del');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const clearSCC = require('gulp-clean-css');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const resolve = require('rollup-plugin-node-resolve');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const rollup = require('rollup');
const postcss = require('gulp-postcss');
const cssmqpacker = require('css-mqpacker');

const { reload } = browserSync;

gulp.task('browser-sync', () => {
	browserSync.init({
		ghostMode: {
			clicks: true,
			forms: true,
			scroll: false
		},
		server: {
			baseDir: './build'
		}
	});
});

gulp.task('html:build', function() {
	return gulp
		.src('./src/*.html')
		.pipe(posthtml([include({ encoding: 'utf8' })]))
		.pipe(gulp.dest('./build'))
		.pipe(reload({ stream: true }));
});

gulp.task('clean', function() {
	return del(['build']);
});

gulp.task('js:rollup', async function() {
	const bundle = await rollup.rollup({
		input: 'src/js/main.js',
		plugins: [resolve()]
	});
	await bundle.write({
		file: 'build/js/main.js',
		format: 'iife',
		name: 'library',
		sourcemap: true
	});
});

gulp.task('js-common:build', function() {
	return gulp.src('./src/js-common/**/*.js').pipe(gulp.dest('./build/js/'));
});

gulp.task('favicon', function() {
	return gulp.src('./src/*.ico').pipe(gulp.dest('./build/'));
});

gulp.task('sass', function() {
	const plugins = [cssmqpacker()];

	return gulp
		.src('./src/scss/main.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(replace(/^[ \t]*\@charset[ \t]+\"UTF\-8\"[ \t]*;/gim, ''))
		.pipe(concat('style.css'))
		.pipe(
			prefixer({
				overrideBrowserslist: [
					'last 3 version',
					'> 1%',
					'ie 10',
					'maintained node versions'
				],
				cascade: false
			})
		)
		.pipe(postcss(plugins))
		.pipe(gulp.dest('./build/css'))
		.pipe(reload({ stream: true }));
});

gulp.task('fonts:build', function() {
	return gulp.src('./src/fonts/**/*.*').pipe(gulp.dest('./build/fonts/'));
});

gulp.task('img:build', function() {
	return gulp.src('./src/img/other/*.*').pipe(gulp.dest('./build/images/'));
});

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

gulp.task('watch', () => {
	gulp.watch('./src/**/*.html', gulp.series('html:build'));
	gulp.watch('./src/js/**/*.js', gulp.series('js:rollup'));
	gulp.watch('./src/js-common/**/*.js', gulp.series('js-common:build'));
	gulp.watch('./src/**/*.scss', gulp.series('sass'));
	gulp.watch('./src/img/other/*.*', gulp.series('img:build'));
	gulp.watch('./src/img/svg/*.*', gulp.series('img:build'));
});

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
			'sprite:svg',
			'favicon'
		),
		gulp.parallel('watch', 'browser-sync')
	)
);
