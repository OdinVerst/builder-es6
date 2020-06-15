const { src, dest, series, watch, parallel } = require('gulp');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
// Graphic
const svgSprite = require('gulp-svg-sprite');
const svgo = require('gulp-svgo');
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
const sortCSSmq = require('sort-css-media-queries');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const prefixer = require('gulp-autoprefixer');

// Entrypoint
const configPath = require('./config.entrypoint');

const bSyncTask = () => {
	browserSync.init({
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
};

const htmlTask = () => {
	const plugins = [include({ encoding: 'utf8' })];
	return src(configPath.html.entry)
		.pipe(posthtml(plugins))
		.pipe(dest(configPath.html.output))
		.pipe(browserSync.stream());
};

const cleanTask = () => del([configPath.dir]);

const jsTask = async () => {
	const bundle = await rollup.rollup({
		input: configPath.js.entry,
		plugins: [
			resolve(),
			commonjs({
				include: 'node_modules/**'
			}),
			babel({
				babelrc: true,
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
};

const faviTask = () => src('./src/*.ico').pipe(dest(configPath.dir));

const fontTask = () => {
	return src(configPath.font.entry).pipe(dest(configPath.font.output));
};

const imgTask = () => {
	return src(configPath.img.entry)
		.pipe(rename({ dirname: '' }))
		.pipe(dest(configPath.img.output));
};

const copyTask = async () => {
	await faviTask();
	await fontTask();
	await imgTask();
};

const sassTask = () => {
	const plugins = [
		cssmqpacker({
			sort: sortCSSmq
		})
	];
	return src(configPath.css.entry)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat(configPath.css.nameFile))
		.pipe(postcss(plugins))
		.pipe(dest(configPath.css.output))
		.pipe(browserSync.stream());
};

const svgTask = () => {
	return src(configPath.svg.entry)
		.pipe(svgo())
		.pipe(
			svgSprite({
				mode: {
					symbol: {
						sprite: `../${configPath.svg.nameFile}`
					}
				}
			})
		)
		.pipe(dest(configPath.svg.output));
};

const watchTask = () => {
	watch(configPath.html.watch, series(htmlTask));
	watch(configPath.js.watch, series(jsTask));
	watch(configPath.font.watch, series(fontTask));
	watch(configPath.img.watch, series(imgTask));
	watch(configPath.svg.watch, series(svgTask));
	watch(configPath.css.watch, series(sassTask));
};

exports.prod = series(
	cleanTask,
	parallel(htmlTask, jsTask, copyTask, sassTask, svgTask)
);

exports.default = series(
	cleanTask,
	parallel(htmlTask, jsTask, copyTask, sassTask, svgTask),
	parallel(watchTask, bSyncTask)
);
