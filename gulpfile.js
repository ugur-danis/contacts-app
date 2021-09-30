const del = require('del'),
    gulp = require('gulp'),
    bump = require('gulp-bump'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    prettydata = require('gulp-pretty-data'),
    minifyJS = require('gulp-uglify-es').default,
    minifyCSS = require('gulp-uglifycss'),
    cachebuster = require('gulp-ui5-cachebuster'),
    ui5preload = require('gulp-ui5-preload'),
    jsonfile = require("jsonfile"),
    argv = require('yargs')
        .option('type', {
            alias: 't',
            choices: ['major', 'minor', 'patch']
        }).argv;

const TIMESTAMP = new Date().getTime(); //ie, 1495521267770

gulp.task('del_build', () => del(['build/**']));

gulp.task('ui5preload', () => {
    return gulp.src([
        'Application/**/**.+(js|xml)',
        'Provider/**.+(js)',
        'Resources/components/**.+(js)',
        'Resources/utils/**.+(js)',
        'Service/**.+(js)',
        'Component.js'
    ])
        .pipe(gulpif('**/*.js', minifyJS())) //only pass .js files to uglify
        .pipe(gulpif('**/*.xml', prettydata({ type: 'minify' }))) // only pass .xml to prettydata
        .pipe(ui5preload({
            base: './',
            namespace: 'com.ContactsApp',
            fileName: 'Component-preload.js'
        }))
        .pipe(gulp.dest('build/~' + TIMESTAMP + '~'))
});

gulp.task('i18n', () => {
    return gulp.src('i18n/*.**')
        .pipe(gulp.dest('build/i18n'))
});

gulp.task('css', () => {
    return gulp.src('Resources/css/**')
        .pipe(gulp.dest('build/Resources/css'))
});

gulp.task('images', () => {
    return gulp.src('Resources/images/*.**')
        .pipe(gulp.dest('build/Resources/images'))
});

gulp.task('mockdata', () => {
    return gulp.src('Resources/mockdata/*.**')
        .pipe(prettydata({ type: 'minify' }))
        .pipe(gulp.dest('build/Resources/mockdata'))
});

gulp.task('plugins', () => {
    return gulp.src('Resources/plugins/*.**')
        .pipe(gulp.dest('build/Resources/plugins'))
});

const rootjs = ['Config.js', 'Customize.js']
gulp.task('rootjs', () => {
    return gulp.src(rootjs)
        .pipe(minifyJS())
        .pipe(gulp.dest('build'))
});

gulp.task('index', () => {
    return gulp.src(['index.html', 'version.json'])
        .pipe(gulp.dest('build'))
});

const version = 'build/version.json'
gulp.task('check:versioning', async () => {
    await new Promise(resolve => {
        jsonfile.readFile(version).then(resolve)
            .catch(err => {
                jsonfile.writeFile(version, { version: '1.0.0' })
                resolve()
            })
    })
})

gulp.task('bump:versioning', () => {
    return gulp.src(version)
        .pipe(bump({
            type: argv.type || 'patch'
        }))
        .pipe(gulp.dest('./build'))
})

gulp.task('cachebuster', () => {
    process.chdir('build')

    return gulp.src(['~' + TIMESTAMP + '~/**/*'])
        .pipe(cachebuster(TIMESTAMP, ''))
});


gulp.task('build',
    gulp.series(
        'del_build',
        'ui5preload',
        'i18n',
        'mockdata',
        'css',
        'images',
        'plugins',
        'rootjs',
        'index',
        'bump:versioning',
        'cachebuster'
    )
);

//$ node node_modules/gulp/bin/gulp.js --t [major, minor, patch] || build