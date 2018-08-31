var gulp = require('gulp'),
    babel = require('gulp-babel'),
    tape = require('gulp-tape'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify'),
    rename = require('gulp-rename'),
    removeFiles = require('gulp-remove-files');

// basic paths
var path = {
    nodeModules: "node_modules/",
    src: "src/",
    test: "test/",
    dist: "dist/",
    router: "sp-router",
    css: "css/",
    js: "js/",
    scss: "scss/",
    views: "views/"
};

// files 
var files = {
    routerFile: "sp-router.js",
    routerFileMinRemove: "sp-router-min.js",
    routerFileMin: "sp-router.min.js",
    index: "index.html",
    jquery: "jquery.min.js",
    bootstrapJs: "bootstrap.bundle.js",
    bundelCss: "bundle.scss",
    bundleJs: "bundle.js",
    routerFileConfig: "routerConfig.js"
};

// path with files configuration
var config = {
    routerPath: path.src + "router/" + files.routerFile,
    routerDist: path.test + path.js + path.router,
    jsDist: path.test + path.js,
    cssDist: path.test + path.css,
    sassPath: path.src + path.scss
};

// dependencies paths confiuration
var dependenciesConfig = {
    bootstrap: path.nodeModules + "bootstrap/dist/",
    jquery: path.nodeModules + "jquery/dist/"
};

// compile es6 to es2015
gulp.task("es6", function(){
    return gulp.src([
            config.routerPath
        ])
        .pipe(babel())
        .pipe(tape())
        .pipe(gulp.dest(config.routerDist)); 
});

// move all html files
gulp.task("page", function(){
    gulp.src([
        path.src + path.views + "**/*"
    ])
        .pipe(gulp.dest(path.test + path.views));

    gulp.src([
        path.src + files.index
    ])
        .pipe(gulp.dest(path.test));
});

// move dependencies js files and make bundle
gulp.task("js", function(){
    gulp.src([
        dependenciesConfig.jquery + files.jquery,
        dependenciesConfig.bootstrap + path.js + files.bootstrapJs,
    ])
    .pipe(concat(files.bundleJs))
    .pipe(gulp.dest(config.jsDist))
    .pipe(browserSync.stream());
});

// move all custom js files
gulp.task("moveJs", function(){
    gulp.src([
        path.src + path.js + files.routerFileConfig,
    ])
    .pipe(gulp.dest(config.jsDist))
    .pipe(browserSync.stream());
});

// compile sass and make bundle css
gulp.task('sass', function () {
    return gulp.src([
            config.sassPath + files.bundelCss
      ])
      .pipe(sass())
      .pipe(gulp.dest(config.cssDist))
      .pipe(browserSync.stream());
  });

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: path.test  
    });

    gulp.watch(path.src + "**/*.html").on('change', browserSync.reload);
});

// make minified file and move directly to dist
gulp.task("build", function(){
    gulp.src(config.routerPath)
        .pipe(gulp.dest(path.dist));

    gulp.src(config.routerPath)
        .pipe(minify())
        .pipe(gulp.dest(path.dist));

    gulp.src(path.dist + files.routerFileMinRemove)
        .pipe(rename(files.routerFileMin))
        .pipe(gulp.dest(path.dist));

    gulp.src(path.dist + files.routerFileMinRemove)
        .pipe(removeFiles());
});

// watch tasks
gulp.task("watch", function(){
    gulp.watch(
        config.routerPath,
        ["es6", "build"]
    );
    gulp.watch(
        [
            path.src + "**/*.html"
        ]
        ["page"]
    );
    gulp.watch(
        [
            path.src.scss + '**/*.scss',
        ], 
        ['sass']
    ).on('change', browserSync.reload);
    gulp.watch(
        [
            path.src + path.js + "**/*.js",
        ], 
        ['moveJs']
    ).on('change', browserSync.reload);
});

// default task
gulp.task(
    'default', 
    [
        "serve", 
        "sass", 
        "es6", 
        "page", 
        "js", 
        "moveJs", 
        "watch"
    ]
);