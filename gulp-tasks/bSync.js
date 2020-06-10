const browserSync = require('browser-sync');
const configPath = require('../config.entrypoint');

const { reload } = browserSync;

const bSync = () => {
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

module.exports = bSync;
