var gulp = require('gulp');
var pkg = require('./package.json');

var $ = {
  pump: require('pump'), // used for error details etc.
  rename: require('gulp-rename'),
  header: require('gulp-header'),
  // watch: require('gulp-watch'),
  // crypto: require('crypto-js'),
  runSequence: require('run-sequence'),
  
  /* CSS */
  less: require('gulp-less'),
  lessPluginFunctions: require('less-plugin-functions'),
  minifyCss: require('gulp-clean-css'),
  autoprefixer: require('gulp-autoprefixer'),
  
  /* JS */
  babel: require("gulp-babel"),
  uglifyjs: require('gulp-uglify'),
  stripDebug: require('gulp-strip-debug'),
};

var paths = {
  src: {
    css: 'src/css/',
    js: 'src/js/',
    img: 'src/img/',
    libs: 'src/libs/'
  },
  dist: {
    css: 'public/css/',
    js: 'public/js/',
    img: 'public/img/',
    libs: 'public/libs/'
  }
};

var sources = {
  js: paths.src.js + '**/*.js',
  css: [
    paths.src.css + '**/*.less',
    '!' + paths.src.css + '_*/*' // ignore dir started by '_'
  ],
  img: paths.src.img + '**/*',
  libs: paths.src.libs + '**/*'
};

var config = {
  less: {
    options: {
      browsers: [
        // 'ie >= 10',
        // 'ff >= 30',
        'chrome >= 30',
        // 'safari >= 7',
        'ios >= 7',
        'android >= 4.4'
      ]
    }
  }
};

var banner = [
  '/*!',
  ' * <%= pkg.title %>',
  ' * ',
  ' * Version: <%= pkg.version %>',
  ' * ',
  ' * Copyright (c) ' + getDateStamp().year + ' Serifx Xiao',
  ' * http://blog.tiy.xyz',
  ' * ',
  ' * Released on: ' + getDateStamp().timespan,
  ' */',
  ''].join('\n');


/* Tasks
   ========================================================================== */

/* CSS */
gulp.task('dist:css', function () {
  return gulp.src(sources.css)
    .pipe($.less({
      plugins: [
        new $.lessPluginFunctions, // require 'new' example
      ],
    }))
    .pipe($.autoprefixer(config.less.options))
    .pipe($.header(banner, {pkg: pkg}))
    .pipe(gulp.dest(paths.dist.css)) /* output source */
    
    .pipe($.minifyCss(config.less.options))
    //.pipe($.header(banner, {pkg: pkg}))
    .pipe($.rename(function (path) {
      path.basename = path.basename + '.min'
    }))
    .pipe(gulp.dest(paths.dist.css));
});

/* JS */
gulp.task('js', function (cb) {
  $.pump([gulp.src(sources.js),
      $.babel(),
      $.stripDebug(),
      $.uglifyjs({
        warnings: false,
        compress: {
          // compress options
          sequences: 20,
          drop_debugger: true
        },
        mangle: false,
        output: {
          // output options
          ascii_only: true,
          comments: false
        }
      }),
      $.header(banner, {pkg: pkg}),
      $.rename(function (path) {
        path.basename = path.basename + '.min'
      }),
      gulp.dest(paths.dist.js)
    ],
    cb);
});
gulp.task('js-src', function () {
  return gulp.src(sources.js)
    .pipe($.babel())
    .pipe($.header(banner, {pkg: pkg}))
    .pipe(gulp.dest(paths.dist.js));
});
gulp.task('dist:js', function () {
  return $.runSequence([
    'js',
    'js-src'
  ]);
});

/* Images */
gulp.task('dist:img', function () {
  return gulp.src(sources.img)
    .pipe(gulp.dest(paths.dist.img));
});

/* Libs */
gulp.task('copy:libs', function () {
  return gulp.src(sources.libs)
    .pipe(gulp.dest(paths.dist.libs));
});

/* Watch */
gulp.task('watch:css', function () {
  return gulp.watch(sources.css[0], [
    'dist:css'
  ]);
});
gulp.task('watch:js', function () {
  return gulp.watch(sources.js, [
    'dist:js'
  ]);
});


/* Default */
gulp.task('default', function () {
  $.runSequence([
    'dist:css',
    'dist:js',
    'dist:img',
    'copy:libs'
  ]);
});


/* Utils
   ========================================================================== */
function getDateStamp() {
  var d = new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDay(),
    hours: d.getHours(),
    minutes: d.getMinutes(),
    normal: [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('/'),
    timespan: [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('/') + ' ' + [d.getHours(), d.getMinutes()].join(':')
  }
}

function getMd5(input, key) {
  return $.crypto.MD5(input, key).toString().toUpperCase();
}
