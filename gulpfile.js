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
    reload = browserSync.reload;

//Таск browser-sync
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
});

//Перенос Html в build
gulp.task('html:build', function () {
    return gulp.src('./src/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('./build'))
        .pipe(reload({stream: true}));
});

//Очистка build
gulp.task('clean', function() {
    return del(['build']);
});
//Js rollup
gulp.task('js:rollup', function(){
    return gulp.src('src/js/main.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rollup({}, 'iife'))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('build/js'));
});
//Перенос библиотек JS
gulp.task('js-common:build', function () {
    return gulp.src('./src/js-common/**/*.js')
        .pipe(gulp.dest('./build/js/'));
});

//Таск по стилям
gulp.task('sass', function () {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(prefixer({
            browsers: ['last 3 version', '> 1%', 'ie 8', 'ie 9', 'Opera 12.1','Firefox >= 2'],
            cascade: false
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(minify({
            ext:{
                src:'',
                min:'.min.css'
            },
            noSource: false}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css'));
});

//Отслеживание изменений
gulp.task('watch', function() {
    gulp.watch('./src/**/*.html', gulp.series('html:build'));
    gulp.watch('./src/js/*.js', gulp.series('js:rollup'));
    gulp.watch('./src/js-common/*.js', gulp.series('js-common:build'));
    gulp.watch('./src/scss/*.scss', gulp.series('sass'));
});


//Дефолтный таск
gulp.task('default', gulp.series(
    'clean',
    gulp.parallel(
        'html:build',
        'js:rollup',
        'js-common:build',
        'sass'
    ),
    gulp.parallel(
        'watch',
        'browser-sync'
    )
));