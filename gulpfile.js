const gulp = require('gulp'),
    rigger = require('gulp-rigger'),
    del = require('del'),
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
//Отслеживание изменений
gulp.task('watch', function() {
    gulp.watch('./src/**/*.html', gulp.series('html:build'));
    gulp.watch('./src/js/*.js', gulp.series('js:rollup'));
});

//Дефолтный таск
gulp.task('default', gulp.series(
    'clean',
    gulp.parallel(
        'html:build',
        'js:rollup'
    ),
    gulp.parallel(
        'watch',
        'browser-sync'
    )
));