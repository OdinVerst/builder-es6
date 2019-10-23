const gulp = require('gulp');
const bSync = require('browser-sync');
const del = require('del');

// Html
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
// JS
const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const { uglify } = require('rollup-plugin-uglify');

// Entrypoint
const configPath = require('./config.entrypoint');

// const prefixer = require('gulp-autoprefixer');
//
// const sass = require('gulp-sass');
// const concat = require('gulp-concat');
// const browserSync = require('browser-sync');
// const sourcemaps = require('gulp-sourcemaps');
// const svgSprite = require('gulp-svg-sprite');
// const svgmin = require('gulp-svgmin');
// const cheerio = require('gulp-cheerio');
// const replace = require('gulp-replace');
// const resolve = require('rollup-plugin-node-resolve');
// const postcss = require('gulp-postcss');
// const cssmqpacker = require('css-mqpacker');

const { reload } = bSync;

gulp.task('bSync', () => {
	bSync.init({
		open: false,
		ghostMode: {
			clicks: true,
			forms: true,
			scroll: false
		},
		server: {
			baseDir: configPath.dir
		}
	});
});

gulp.task('html', () => {
	return gulp
		.src(configPath.html.entry)
		.pipe(posthtml([include({ encoding: 'utf8' })]))
		.pipe(gulp.dest(configPath.html.output))
		.pipe(reload({ stream: true }));
});

gulp.task('clean', () => {
	return del(['build']);
});

gulp.task('js', async () => {
	const bundle = await rollup.rollup({
		input: configPath.js.entry,
		plugins: [
			resolve(),
			commonjs({
				include: 'node_modules/**'
			}),
			babel({
				babelrc: true,
				runtimeHelpers: true,
				exclude: 'node_modules/**'
			}),
			uglify()
		]
	});
	await bundle.write({
		file: configPath.js.output,
		format: 'iife',
		name: 'library',
		compact: true,
		sourcemap: true
	});
});

// gulp.task('js-common:build', function() {
// 	return gulp.src('./src/js-common/**/*.js').pipe(gulp.dest('./build/js/'));
// });

// gulp.task('favicon', function() {
// 	return gulp.src('./src/*.ico').pipe(gulp.dest('./build/'));
// });

// gulp.task('sass', function() {
// 	const plugins = [cssmqpacker()];

// 	return gulp
// 		.src('./src/scss/main.scss')
// 		.pipe(sourcemaps.init())
// 		.pipe(sass().on('error', sass.logError))
// 		.pipe(replace(/^[ \t]*\@charset[ \t]+\"UTF\-8\"[ \t]*;/gim, ''))
// 		.pipe(concat('style.css'))
// 		.pipe(
// 			prefixer({
// 				overrideBrowserslist: [
// 					'last 3 version',
// 					'> 1%',
// 					'ie 10',
// 					'maintained node versions'
// 				],
// 				cascade: false
// 			})
// 		)
// 		.pipe(postcss(plugins))
// 		.pipe(gulp.dest('./build/css'))
// 		.pipe(reload({ stream: true }));
// });

// gulp.task('fonts:build', function() {
// 	return gulp.src('./src/fonts/**/*.*').pipe(gulp.dest('./build/fonts/'));
// });

// gulp.task('img:build', function() {
// 	return gulp.src('./src/img/other/*.*').pipe(gulp.dest('./build/images/'));
// });

// gulp.task('sprite:svg', function() {
// 	return gulp
// 		.src('./src/img/svg/*.svg')
// 		.pipe(
// 			svgmin({
// 				js2svg: {
// 					pretty: true
// 				}
// 			})
// 		)
// 		.pipe(
// 			cheerio({
// 				run: function($) {
// 					$('[fill]').removeAttr('fill');
// 					$('[stroke]').removeAttr('stroke');
// 					$('[style]').removeAttr('style');
// 				},
// 				parserOptions: { xmlMode: true }
// 			})
// 		)
// 		.pipe(replace('&gt;', '>'))
// 		.pipe(
// 			svgSprite({
// 				mode: {
// 					symbol: {
// 						sprite: '../sprite-vector.svg'
// 					}
// 				}
// 			})
// 		)
// 		.pipe(gulp.dest('./build/images/'));
// });

gulp.task('watch', () => {
	gulp.watch(configPath.html.watch, gulp.series('html'));
	gulp.watch(configPath.js.watch, gulp.series('js'));
	// gulp.watch('./src/js-common/**/*.js', gulp.series('js-common:build'));
	// gulp.watch('./src/**/*.scss', gulp.series('sass'));
	// gulp.watch('./src/img/other/*.*', gulp.series('img:build'));
	// gulp.watch('./src/img/svg/*.*', gulp.series('img:build'));
});

gulp.task(
	'default',
	gulp.series(
		'clean',
		gulp.parallel('html', 'js'),
		gulp.parallel('watch', 'bSync')
	)
);
