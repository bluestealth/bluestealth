'use strict';

let gulp = require('gulp');
let sass = require('gulp-sass');
let rename = require("gulp-rename");
let sourcemaps = require('gulp-sourcemaps');
let autoprefixer = require('gulp-autoprefixer');
let cleancss = require('gulp-clean-css');
let file = require('gulp-file');
let pug = require('gulp-pug');
let sitemap = require('gulp-sitemap');
let responsive = require('gulp-responsive');
let realFavicon = require('gulp-real-favicon');
let YAML = require('yamljs');
let fs = require('fs');

let config = YAML.load('site.config') || {};

if (!config.GOOGLE_SITE_VERIFICATION)
  config.GOOGLE_SITE_VERIFICATION = 'google*c.html';

let faviconConfig = {
  masterPicture: config.FAVICON_IMG,
  dest: config.DIST_DIR,
  iconsPath: '/',
  design: {
    ios: {
      pictureAspect: 'noChange',
      assets: {
        ios6AndPriorIcons: false,
        ios7AndLaterIcons: false,
        precomposedIcons: false,
        declareOnlyDefaultIcon: true
      }
    },
    desktopBrowser: {},
    windows: {
      pictureAspect: 'noChange',
      backgroundColor: '#2b5797',
      onConflict: 'override',
      assets: {
        windows80Ie10Tile: false,
        windows10Ie11EdgeTiles: {
          small: true,
          medium: true,
          big: true,
          rectangle: true
        }
      }
    },
    androidChrome: {
      pictureAspect: 'noChange',
      themeColor: '#ffffff',
      manifest: {
        name: config.SITE_BASE_URL.replace(/^(http|https):\/\/www\./, ''),
        display: 'standalone',
        orientation: 'notSet',
        onConflict: 'override',
        declared: true
      },
      assets: {
        legacyIcon: false,
        lowResolutionIcons: false
      }
    },
    safariPinnedTab: {
      pictureAspect: 'blackAndWhite',
      threshold: 21.25,
      themeColor: '#5bbad5'
    }
  },
  settings: {
    compression: 1,
    scalingAlgorithm: 'Mitchell',
    errorOnImageTooSmall: false
  },
  markupFile: 'faviconData.json'
};

gulp.task('google_site', () => {
  if (config.GOOGLE_SITE_VERIFICATION !== 'google*c.html')
    return file(config.GOOGLE_SITE_VERIFICATION, "google-site-verification: " + config.GOOGLE_SITE_VERIFICATION, {
        src: true
      })
      .pipe(gulp.dest(config.DIST_DIR));
  return true;

});

gulp.task('robots_txt', () => {
  if (config.ROBOTS)
    file("robots.txt", config.ROBOTS.join('\n'), {
      src: true
    })
    .pipe(gulp.dest(config.DIST_DIR));
  return true;
});

gulp.task('pug', () => {
  return gulp.src(['./src/templates/index.pug'])
    .pipe(pug({
        pretty: true
    }))
    .pipe(gulp.dest(config.DIST_DIR));
});

gulp.task('css', () => {
  return gulp.src('./src/sass/site.scss')
    .pipe(sass({
      includePaths: [config.BOOTSTRAP_DIR + '/scss']
    }))
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['ie >= 10', 'last 2 versions']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.DIST_DIR + '/css'));
});

gulp.task('minifycss', ['css'], () => {
  return gulp.src(config.DIST_DIR + '/css/site.css')
    .pipe(sourcemaps.init())
    .pipe(cleancss({sourceMap: true}))
    .pipe(rename({extname: '.min.css'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.DIST_DIR + '/css'));
});

gulp.task('generate-favicon', () => {
  return realFavicon.generateFavicon(faviconConfig);
});

gulp.task('inject-favicon-markups', ['pug'], () => {
  let html = JSON.parse(fs.readFileSync(faviconConfig.markupFile)).favicon.html_code;
  return gulp.src(['dist/*.html', '!dist/' + config.GOOGLE_SITE_VERIFICATION])
    .pipe(realFavicon.injectFaviconMarkups(html))
    .pipe(gulp.dest(config.DIST_DIR));
});

gulp.task('check-for-favicon-update', () => {
  let currentVersion = JSON.parse(fs.readFileSync(faviconConfig.markupFile)).version;
  return realFavicon.checkForUpdates(currentVersion, (err) => {
    if (err) {
      throw err;
    }
  });
});

gulp.task('images', () => {
  return gulp.src('static/img/*.org.jpg')
    .pipe(responsive({
      '*.jpg': [{
        width: 480,
        rename: (path) => { path.basename = path.basename.replace(/\.org$/,'') + '-sm'; return path},
      }, {
        width: 640,
        rename: (path) => { path.basename = path.basename.replace(/\.org$/,'') + '-md'; return path},
      }, {
        width: 1024,
        rename: (path) => { path.basename = path.basename.replace(/\.org$/,'') + '-lg'; return path},
      }, {
        width: 2048,
        rename: (path) => { path.basename = path.basename.replace(/\.org$/,'') + '-xl'; return path},
      }]
    }, {
      quality: 100,
      progressive: true,
      withMetadata: false,
    }))
    .pipe(gulp.dest(config.DIST_DIR + '/img'));
});

gulp.task('sitemap', ['pug'], () => {
    gulp.src([config.DIST_DIR + '/*.html', '!' + config.DIST_DIR + '/' + config.GOOGLE_SITE_VERIFICATION], { read: false })
  .pipe(sitemap({
    siteUrl: config.SITE_BASE_URL,
    mappings:[{
      pages: ['*.html', '!' + config.GOOGLE_SITE_VERIFICATION],
      changefreq: 'monthly',
      priority: 0.8,
      lastmod: Date.now(),
      getLoc(siteUrl, loc, entry) {
        console.log(loc);
        return loc.replace(/\.html$/, '');
      }
    }]
  }))
  .pipe(gulp.dest(config.DIST_DIR));
});

gulp.task('copy', () => {
  gulp.src([
    config.BOOTSTRAP_DIR + '/dist/js/bootstrap{.js,.min.js}',
    config.JQUERY_DIR + '/dist/jquery{.js,.min.js,.min.map}',
    config.TETHER_DIR + '/dist/js/tether{.js,.min.js}',
    './static/js/*{.js,min.js}'
  ]).pipe(gulp.dest(config.DIST_DIR + '/js'));

  gulp.src([
    config.FONTAWESOME_DIR + '/css/font-awesome{.css,.min.css,.css.map}'
  ]).pipe(gulp.dest(config.DIST_DIR + '/css'));

  gulp.src([
    config.FONTAWESOME_DIR + '/fonts/FontAwesome.otf',
    config.FONTAWESOME_DIR + '/fonts/fontawesome-webfont{.eot,.svg,.ttf,.woff,.woff2}'
  ]).pipe(gulp.dest(config.DIST_DIR + '/fonts'));

  gulp.src(config.DOC_DIR + '/*{.docx,.pdf,.odt}').pipe(gulp.dest(config.DIST_DIR + '/doc'));
});

gulp.task('default', ['copy', 'css', 'minifycss', 'images', 'pug', 'inject-favicon-markups', 'sitemap']);
