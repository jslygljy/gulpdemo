/**
 * description: gulp任务配置
 * Created by xinchao.dou on 2016/3/25.
 * <xinchao.dou@smartac.co>
 */
(function () {
    "use strict";
    var gulp = require("gulp");
    //插件加载器
    var plugins = require("gulp-load-plugins")();
    //源码路径
    var srcPaths = {
        server: "dist",
        css: ["app/css/*.css"],
        es6:["app/js/es6.js"],
        js: [
            //["sst/modules/analysis/*.service.js", "sst/modules/analysis/analysis.js"],
            ["app/js/index.js"],
        ],
        index: ["app/index.html"],
        copy: ["sst/assets/lang/*.*", "sst/assets/imgs/*.*", "sst/weburl.js", "sst/assets/fonts/*.*", "sst/config.js"], //不参与编译的文件
    };

    //压缩之后的路径
    var destPaths = {
        base: "dist",
        css: "dist/styles",
        js: "dist/js",
        index: "dist",
        es6: "dist/js",
        assetsLibs: "dist/assets/libs",
        copy: "dist/",
        app: "dist/",
        templates: "templates", //模版
        //以下生成对应的map文件勿修改
        cssMap: "../sourcemaps/css",
        jsMap: "sourcemaps"
    };

    /**
     * 开启server
     */
    gulp.task("server", function () {
        gulp.src(srcPaths.server).pipe(plugins.webserver({
            host: "127.0.0.1",
            path:"/",
            port: "8000",
            livereload: {
                enable: true,
                filter: function (filename) {
                    if (filename.match(/dist/g)) {
                        return !(filename.match(/.map$/));
                    } else {
                        return false; //只更新dist目录下的变化
                    }
                }
            },
            directoryListing: false
        }));
    });

    //gulp es6处理
    gulp.task('es6',function(){
       return gulp.src(srcPaths.es6)
            .pipe(plugins.babel({
                presets: ['es2015']
            }))
            .pipe(gulp.dest(destPaths.es6));
    });
    /**
     * js文件处理
     */
    gulp.task("js", function () {
        srcPaths.js.forEach(function (path) {
            var _path = path[0];
            var name = "index.js";
            gulp.src(path)
                .pipe(plugins.sourcemaps.init())
                .pipe(plugins.concat(name))
                .pipe(plugins.uglify())
                .pipe(plugins.sourcemaps.write(destPaths.jsMap))
                .pipe(gulp.dest(destPaths.js));
        });
    });

    /**
     * css文件处理
     */
    gulp.task("css", function () {
        gulp.src(srcPaths.css)
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat("all.css"))
            .pipe(plugins.autoprefixer({
                browserslist: ['Android >=4.2', "IOS >7", ">5%", "IE8"]
            }))
            .pipe(plugins.cleanCss({
                compatibility: 'ie8'
            }))
            .pipe(plugins.sourcemaps.write(destPaths.cssMap))
            .pipe(gulp.dest(destPaths.css));
    });

    /**
     * html文件处理
     */
    gulp.task("html", function () {
        gulp.src(srcPaths.templates).pipe(plugins.htmlmin({
                collapseWhitespace: true
            }))
            .pipe(plugins.rename({
                dirname: destPaths.templates
            }))
            .pipe(gulp.dest(destPaths.base));
    });

    /**
     * index.html处理
     */
    gulp.task("index", function () {
        gulp.src(srcPaths.index).pipe(plugins.htmlmin({
            collapseWhitespace: true
        })).pipe(gulp.dest(destPaths.index));
    });

    /**
     * 监听文件变化
     */
    gulp.task("watch", function () {
        gulp.watch(srcPaths.css, ["css"]); //监听文件变化
        gulp.watch(srcPaths.js, ["js"]); //监听文件变化
        gulp.watch(srcPaths.index, ["index"]); //监听文件变化
        gulp.watch(srcPaths.templates, ["html"]); //监听文件变化
        gulp.watch(srcPaths.es6, ["es6"]); //监听文件变化
    });

    /**
     * 压缩assets libs里的文件
     */
    gulp.task("assets", function () {
        gulp.src(srcPaths.assetsLibs)
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat("libs.js"))
            .pipe(plugins.uglify())
            .pipe(plugins.sourcemaps.write("../../sourcemaps/modules"))
            .pipe(gulp.dest(destPaths.assetsLibs));
    });

    /**
     * 复制静态文件，如json，image
     */
    gulp.task("copy", function () {
        gulp.src(srcPaths.copy).pipe(plugins.copy(destPaths.copy, {
            prefix: 1
        }));
    });

    /**
     * 压缩app.js
     */
    gulp.task("app", function () {
        gulp.src(srcPaths.app)
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat("app.js"))
            .pipe(plugins.uglify())
            .pipe(plugins.sourcemaps.write("./sourcemaps/modules"))
            .pipe(gulp.dest(destPaths.app));
    });

    /**
     * 开启开发服务器
     */
    gulp.task("serve:dev", ["server", "watch"]);

    /**
     * 初始化或者json、libs文件变化使用
     */
    gulp.task("init", ["copy", "index", "css", "js", "es6", "html"]);
    /**
     * 新增或者修改静态共用配置时执行对应任务
     */
    gulp.task("addfiles", ["css", "js", "html"]);
})();
