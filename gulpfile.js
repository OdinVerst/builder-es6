const gulp = require('gulp');
const bSync = require('browser-sync');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
// Graphic
const rename = require('gulp-rename');
// Html
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
// JS
const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const { uglify } = require('rollup-plugin-uglify');
// CSS
const cssmqpacker = require('css-mqpacker');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const prefixer = require('gulp-autoprefixer');

// Entrypoint
const configPath = require('./config.entrypoint');

// const prefixer = require('gulp-autoprefixer');
//
// const concat = require('gulp-concat');
// const svgSprite = require('gulp-svg-sprite');
// const svgmin = require('gulp-svgmin');
// const cheerio = require('gulp-cheerio');
// const replace = require('gulp-replace');
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
	return del([configPath.dir]);
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

gulp.task('favicon', () =>
	gulp.src('./src/*.ico').pipe(gulp.dest(configPath.dir))
);

gulp.task('font', () => {
	return gulp
		.src(configPath.font.entry)
		.pipe(gulp.dest(configPath.font.output));
});

gulp.task('sass', () => {
	const plugins = [cssmqpacker()];
	return gulp
		.src(configPath.css.entry)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat(configPath.css.nameFile))
		.pipe(postcss(plugins))
		.pipe(gulp.dest(configPath.css.output))
		.pipe(reload({ stream: true }));
});

gulp.task('img', () => {
	return gulp
		.src(configPath.img.entry)
		.pipe(rename({ dirname: '' }))
		.pipe(gulp.dest(configPath.img.output));
});

gulp.task('watch', () => {
	gulp.watch(configPath.html.watch, gulp.series('html'));
	gulp.watch(configPath.js.watch, gulp.series('js'));
	gulp.watch(configPath.font.watch, gulp.series('font'));
	gulp.watch(configPath.img.watch, gulp.series('img'));
	gulp.watch(configPath.css.watch, gulp.series('sass'));
});

gulp.task(
	'default',
	gulp.series(
		'clean',
		gulp.parallel('html', 'js', 'favicon', 'font', 'img', 'sass'),
		gulp.parallel('watch', 'bSync')
	)
);
