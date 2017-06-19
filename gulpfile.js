'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var vinylPaths = require('vinyl-paths');
var globby = require('globby');
var mergeStream = require('merge-stream');
var path = require('path');
var runSequence = require('run-sequence');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var bs = require('browser-sync').create();
var del = require('del');
var data = require('gulp-data');
var stylus = require('gulp-stylus');
var plumber = require('gulp-plumber');
var jade = require('gulp-jade');
var sourcemaps = require('gulp-sourcemaps');

var browsers = [
  'last 2 versions',
  'Explorer >= 8',
  'Firefox ESR',
  'Android >= 4',
  'iOS >= 7'
];
var entries = [];

// Lint JavaScript
gulp.task('lint', function () {
  return gulp.src('src/js/**/*.js')
    // .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

// Build stylesheets for local development
gulp.task('css:dev', ['stylus'], function () {
  return gulp.src(['src/stylus/**.styl', 'src/stylus/**/*.styl'])
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/css'));
});

// Build stylesheets for local development
gulp.task('stylus', function () {
  return gulp.src('src/stylus/*.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest('.tmp/css/'));
});

// Build stylesheets for production
gulp.task('css', ['stylus', 'sprites', 'fonts'], function () {
  return gulp.src('.tmp/css/**/*.css')
    .pipe($.postcss([
      autoprefixer({browsers: browsers}),
      cssnano({
        safe: true,
        autoprefixer: true
      })
    ]))
    .pipe(gulp.dest('dist/css'));
});

// Generate CSS sprites from PNG files
gulp.task('sprites', function () {
  return gulp.src('src/img/_sprites/*.png')
    .pipe($.newer('src/img/sprites.png'))
    .pipe($.spritesmith({
      imgName: 'img/sprites.png',
      cssName: 'css/sprites.css',
      padding: 2,
      cssOpts: {
        cssSelector: function (item) {
          return '.sprite-' + item.name;
        }
      }
    }))
    .pipe(gulp.dest('src'));
});

// Generate icon fonts from SVG files
gulp.task('fonts', function () {
  return gulp.src('src/fonts/_glyphs/*.svg')
    .pipe($.newer('src/css/glyphs.css'))
    .pipe($.iconfontCss({
      fontName: 'glyphs',
      targetPath: '../css/glyphs.css',   // Relative path from gulp.dest()
      fontPath: '../fonts/',                // Base url(...) in CSS code
      cssClass: 'glyph'
    }))
    .pipe($.iconfont({
      fontName: 'glyphs',
      prependUnicode: true,
      formats: ['eot', 'woff2', 'woff', 'ttf', 'svg']
    }))
    .pipe(gulp.dest('src/fonts'));
});

// Build and watch scripts for local development
gulp.task('scripts:dev', function () {
  var stream = mergeStream();
  globby.sync(['src/js/*.js', 'src/js/**/*.js']).forEach(function (file) {
    if (entries.indexOf(file) !== -1) {
      return;
    }
    var bundler = browserify({
      entries: file,
      cache: {},
      packageCache: {},
      plugin: [watchify],
      debug: true
    });
    bundler
      .transform(babelify, {presets: ['es2015']})
      .on('log', $.util.log)
      .on('update', bundle);
    stream.add(bundle());
    entries.push(file);
    function bundle() {
      return bundler.bundle()
        .on('error', function (error) {
          $.util.log($.util.colors.red('Browserify error:') + '\n' + error.message);
          this.emit('end');
        })
        .pipe(source(path.relative('src/js', file)))
        .pipe(gulp.dest('.tmp/js'));
    }
  });
  return stream.isEmpty() ? null : stream;
});

// Build scripts for production
gulp.task('scripts', function () {
  var stream = mergeStream();
  globby.sync(['.tmp/js/*.js', '.tmp/js/**/*.js']).forEach(function (file) {
    var bundleStream = browserify(file).bundle()
      .on('error', function (error) {
        $.util.log($.util.colors.red('Browserify error:') + '\n' + error.message);
        this.emit('end');
      })
      .pipe(source(path.relative('.tmp/js', file)))
      .pipe(buffer())
      .pipe($.uglify())
      .pipe(gulp.dest('dist/js'));
    stream.add(bundleStream);
  });
  return stream.isEmpty() ? null : stream;
});

// Minify HTML
gulp.task('html', function () {
  return gulp.src('src/**/*.html')
    .pipe($.htmlmin({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      minifyCSS: true,
      minifyJS: true,
      preventAttributesEscaping: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeTagWhitespace: true,
      useShortDoctype: true
    }))
    .pipe(gulp.dest('dist'));
});

// Optimize images
gulp.task('img', ['sprites'], function () {
  return gulp.src([
    'src/img/*',
    '!src/img/_*{,/**}'
  ])
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/img'))
    .pipe(gulp.dest('src/img'));
});

// Copy all extra files like favicon, .htaccess
gulp.task('extras', function () {
  return gulp.src([
    'src/**',
    '!src/{css,js,img}/**',
    '!src/fonts/_*{,/**}',
    '!**/{*.html,.DS_Store}'
  ], {dot: true})
    .pipe(gulp.dest('dist'));
});

// Static asset revisioning: "main.css" -> "main-e90e18eef7.css"
gulp.task('filerev', function () {
  return gulp.src('dist/**/*.{css,js,png,jpg,gif,eot,svg,ttf,woff,woff2}')
    .pipe(vinylPaths(del))
    .pipe($.rev())
    .pipe(gulp.dest('dist'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('.tmp'));
});

gulp.task('rev', ['filerev'], function () {
  var manifest = gulp.src('.tmp/rev-manifest.json');
  return gulp.src('dist/**/*.{html,css}')
    .pipe($.revReplace({manifest: manifest}))
    .pipe(gulp.dest('dist'));
});

// Clean output directories
gulp.task('clean:tmp', del.bind(null, '.tmp'));
gulp.task('clean:dist', del.bind(null, 'dist'));

// Start browsersync development server
gulp.task('serve', ['pre:serve'], function () {
  bs.init({
    notify: false,
    server: {
      baseDir: ['.tmp', 'src']
    },
    files: ['src/**', '.tmp/**']
  });
  gulp.watch(['src/js/*.js', 'src/js/**/*.js'], function (event) {
    if (event.type === 'added' || event.type === 'renamed') {
      runSequence('scripts:dev');
    }
  });
  gulp.watch('src/*.html');
  gulp.watch('src/js/*.js', ['lint']);
  gulp.watch('src/css/**/*.scss', ['css:dev']);
  gulp.watch(['src/stylus/*.styl', 'src/stylus/**/*.styl'], ['stylus']);
  gulp.watch('src/img/*.png');
  gulp.watch('src/fonts/_glyphs/*.svg', ['css:dev']);
});

gulp.task('pre:serve', function (callback) {
  runSequence('clean:tmp', ['css:dev', 'scripts:dev'], callback);
});

// Start local server from the "dist" directory
gulp.task('serve:dist', function () {
  bs.init({
    notify: false,
    server: 'dist'
  });
});

// Build production files
gulp.task('build', function (callback) {
  runSequence('clean:dist', ['html', 'css', 'scripts', 'img', 'extras'], 'rev', callback);
});

// Push production files to "gh-pages" branch
gulp.task('deploy', ['default'], function () {
  return gulp.src('dist/**/*')
    .pipe($.ghPages());
});

// Default task: lint and build files
gulp.task('default', function (callback) {
  runSequence('lint', 'build', callback);
});
