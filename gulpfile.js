var gulp = require('gulp'),
    babel = require('gulp-babel'),
    tape = require('gulp-tape'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    handlebars = require('gulp-compile-handlebars'),
    pathDep = require('path');

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
    views: "views/",
    images: "images/",
    styles: "styles/",
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
    routerFileConfig: "routerConfig.js",
    highlightConfig: "highlight.js",
    atomOneDark: "atom-one-dark.css",
    agateCss: "agate.css",
    customJs: "custom.js",
    highlightPack: "highlight.pack.js",
};

// path with files configuration
var config = {
    routerPath: path.src + "router/" + files.routerFile,
    routerDist: path.test + path.js + path.router,
    jsDist: path.test + path.js,
    cssDist: path.test + path.css,
    sassPath: path.src + path.scss,
    views: path.src + path.test + path.views,
    routerDistFile: path.test + path.js + path.router + "/" + files.routerFile,
};

// dependencies paths confiuration
var dependenciesConfig = {
    bootstrap: path.nodeModules + "bootstrap/dist/",
    jquery: path.nodeModules + "jquery/dist/",
    highlightLib: path.nodeModules + "highlight.js/lib/",
    highlightStyle: path.nodeModules + "highlight.js/styles/",
};

// compile handlebars
gulp.task('handlebars', function() {
    var options = {
        batch: [path.src + path.test]
    };

    var files = [
        [path.src + path.test + 'index.hbs', path.test + 'index.html'],
        [config.views + 'home/home.hbs', path.test + path.views + 'home/home.html'],
        [config.views + 'products/products.hbs', path.test + path.views + 'products/products.html'],
        [config.views + 'products/product.hbs', path.test + path.views + 'products/product.html'],
        [config.views + 'installation/installation.hbs', path.test + path.views + 'installation/installation.html'],
        [config.views + 'usage/usage.hbs', path.test + path.views + 'usage/usage.html'],
        [config.views + 'hashtag/hashtag.hbs', path.test + path.views + 'hashtag/hashtag.html'],
        [config.views + 'additional/additional.hbs', path.test + path.views + 'additional/additional.html'],
        [config.views + 'parameters/parameters.hbs', path.test + path.views + 'parameters/parameters.html'],
    ];

    return files.forEach(function(filePair) {
        var src = filePair[0];
        var dist = filePair[1];
        var distDir = pathDep.dirname(dist);
        var distFileName = pathDep.basename(dist);

        return gulp.src(src)
            .pipe(handlebars({}, options))
            .pipe(rename(distFileName))
            .pipe(gulp.dest(distDir))
            .pipe(browserSync.stream());
    });
    
});

// compile es6 to es2015
gulp.task("es6", function(){
    return gulp.src([
            config.routerPath
        ])
        .pipe(babel())
        .pipe(tape())
        .pipe(gulp.dest(config.routerDist)); 
});

// move css
gulp.task("css", function(){
    return gulp.src([
            path.src + path.styles + "*.css"
        ])
        .pipe(gulp.dest(config.cssDist + path.styles));
});

// move dependencies js files and make bundle
gulp.task("js", function(){
    gulp.src([
        dependenciesConfig.jquery + files.jquery,
        dependenciesConfig.bootstrap + path.js + files.bootstrapJs
    ])
    .pipe(concat(files.bundleJs))
    .pipe(gulp.dest(config.jsDist))
    .pipe(browserSync.stream());

    gulp.src([
        path.src + path.js + files.highlightPack,
        path.src + path.js + files.routerFileConfig,
        path.src + path.js + files.customJs
    ])
    .pipe(gulp.dest(config.jsDist))
    .pipe(browserSync.stream());

    gulp.src([
        path.src + path.test + "**/*.js",
    ])
    .pipe(gulp.dest(path.test))
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

// pipe media images
gulp.task('images', function() {
    return gulp.src([
        path.src + path.test + path.images + '**/*',
    ])
        .pipe(gulp.dest(path.test + path.images))
        .pipe(browserSync.stream());
});

// watch tasks
gulp.task("watch", function(){
    gulp.watch(
        [
            path.src + path.test + '**/*.hbs'
        ], ['handlebars']
    ).on('change', browserSync.reload);
    gulp.watch(
        config.routerPath,
        ["es6", "build"]
    );
    gulp.watch(
        [
            path.src + '**/*.scss',
        ], 
        ['sass']
    ).on('change', browserSync.reload);
    gulp.watch(
        [
            path.src + path.js + "**/*.js",
            path.src + path.test + "**/*.js",
        ], 
        ['js']
    ).on('change', browserSync.reload);
});

// default task
gulp.task(
    'default', 
    [
        "serve", 
        "handlebars",
        "sass", 
        "es6", 
        "js",
        "css",
        "images",
        "watch"
    ]
);

gulp.task("build", function(){
    gulp.src([
        config.routerPath
    ])
        .pipe(babel())
        .pipe(tape())
        .pipe(gulp.dest(path.dist));

    gulp.src([path.dist + files.routerFile])
        .pipe(uglify())
        .pipe(rename(files.routerFileMin))
        .pipe(gulp.dest(path.dist));
});