const dirName = './dist';

module.exports = {
	js: {
		entry: './src/js/main.js',
		output: `${dirName}/js/main.js`,
		outputProd: `${dirName}/js`,
		watch: './src/js/**/*.js'
	},
	html: {
		entry: './src/*.html',
		output: `${dirName}`,
		watch: './src/**/*.html'
	},
	css: {
		entry: './src/scss/main.scss',
		output: `${dirName}/css`,
		outputProd: `${dirName}/css`,
		watch: './src/**/*.scss',
		nameFile: 'style.css'
	},
	svg: {
		entry: './src/**/svg/*.svg',
		output: `${dirName}/img`,
		watch: './src/**/svg/*.svg',
		nameFile: 'sprite-vector.svg'
	},
	font: {
		entry: './src/fonts/**/*.*',
		output: `${dirName}/fonts/`,
		watch: './src/fonts/**/*.*'
	},
	img: {
		entry: './src/**/img/*.*',
		output: `${dirName}/img/`,
		watch: './src/**/img/*.*'
	},
	dir: `${dirName}`
};
