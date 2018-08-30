var gulp = require('gulp'),
    babel = require('gulp-babel'),
    tape = require('gulp-tape'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    concat = require('gulp-concat');

var path = {
    nodeModules: "node_modules/",
    src: "src/",
    dist: "dist/",
    router: "sp-router",
    css: "css/",
    js: "js/",
    scss: "scss/"
};

var files = {
    routerFile: "sp-router.js"
};

var config = {
    routerPath: path.src + "router/" + files.routerFile,
    routerDist: path.dist + path.js + path.router,
    jsDist: path.dist + path.js,
    cssDist: path.dist + path.css,
    sassPath: path.src + path.scss
};

var dependenciesConfig = {
    bootstrap: path.nodeModules + "bootstrap/dist/",
    jquery: path.nodeModules + "jquery/dist/"
};

gulp.task("es6", function(){
    return gulp.src([
            config.routerPath
        ])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(tape())
        .pipe(gulp.dest(config.routerDist)); 
});

gulp.task("page", function(){
    return gulp.src([
        path.src + "/views/**/*"
    ])
    .pipe(gulp.dest(path.dist + "/views")); 
});

gulp.task("index", function(){
    return gulp.src([
        path.src + "index.html"
    ])
    .pipe(gulp.dest(path.dist)); 
});

gulp.task("js", function(){
    gulp.src([
        dependenciesConfig.jquery + "jquery.min.js",
        dependenciesConfig.bootstrap + "js/bootstrap.bundle.js",
    ])
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(config.jsDist))
    .pipe(browserSync.stream());
});

gulp.task("customJs", function(){
    gulp.src([
        path.src + path.js + "routerConfig.js",
    ])
    .pipe(gulp.dest(config.jsDist))
    .pipe(browserSync.stream());
});

gulp.task('sass', function () {
    return gulp.src([
            config.sassPath + "bundle.scss"
      ])
      .pipe(sass())
      .pipe(gulp.dest(config.cssDist))
      .pipe(browserSync.stream());
  });

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: path.dist  
    });

    gulp.watch(path.src + "**/*.html").on('change', browserSync.reload);
});

gulp.task("watch", function(){
    gulp.watch(
        config.routerPath,
        ["es6"]
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
            path.src + path.js + "routerConfig.js",
        ], 
        ['customJs']
    ).on('change', browserSync.reload);
});

gulp.task('default', ["serve", "sass", "es6", "page", "js", "customJs", "index", "watch"]);