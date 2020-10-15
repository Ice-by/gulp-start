// Переменнной gulp присваиваем всю "мощь" плагина 'gulp':
//  и т.д. с другими плагинами:
let gulp = require('gulp'),
    sass = require('gulp-sass'),
    // плагин как Live Reload:
    browserSync = require('browser-sync'),
    // Для минификации (сжатия) файлов js:
    uglify = require('gulp-uglify'),
    // Для объединения файлов:
    concat = require('gulp-concat'),
    // Для переименовывания файлов:
    rename = require('gulp-rename'),
    // Для плагина, который очищает папку 'dist' перед новым рендингом (перезаливом) файлов
    del = require('del'),
    // Для плагина автопрефиксера, используется чтоб адаптировать все свойства под все браузеры
    autoprefixer = require('gulp-autoprefixer');


    // Таск на очистку (удаление) папки dist:
    gulp.task('clean', async function(){
        del.sync('dist')
    })

    // Некое задание, которое будет выполнять gulp (через метод task это делает): ('scss' - это имя таска, придумываем сами, но чтоб понимать что делается),
    // чтоб выполнить именно этот таск в консоле пишем gulp scss (чтоб завершить выполнение жмем CTRL+C)
gulp.task('scss', function () {
    // Находим все scss файлы в папке scss и в ее подпапках **, чтоб работать с ними:
    return gulp.src('app/scss/**/*.scss')
        // Если нужно выводить css в красивом виде(не минифицированным)
        // .pipe(sass({outputStyle: 'expanded'}))     , тогда следующий pipe убрать:
        // Выводим css в минифицированном виде(образно загоняем в "трубу(через метод .pipe)" файлы, в котором нужно выполнить sass = плагин 'gulp-sass'), с настройкой outputStyle :
        .pipe(sass({ outputStyle: 'compressed' }))
        // Прогоняем через автопрефиксер, чтоб проставить вендорные префиксы
        .pipe(autoprefixer({
            overRideBrowsers: ['last 10 version']
        }))
        // Переименовываем путем добавления в конце суффикса .min:
        .pipe(rename({ suffix: '.min' })) 
        // Указываем куда положить обработанные файлы:
        .pipe(gulp.dest('app/css'))
        // Прописывается когда создаем сервер с помощью плагина browser-synch
        .pipe(browserSync.reload({ stream: true }))
});

// Если нужно заюзать какую-то библиотеку, то вписываем сюда
gulp.task('css', function () {
    return gulp.src([
        'node_modules/normalize.css/normalize.css',
        // Если что-то не нужно, то закомментировать (или удалить), и не забыть убрать их в package.json:
        'node_modules/slick-carousel/slick/slick.css',
        'node_modules/magnific-popup/dist/magnific-popup.css'
    ])
    // Собираем файлы подключаемых библиотек в один (объединяем(конкатенируем) в файл с именем libs.scss):
    .pipe(concat('_libs.scss'))
    // Выкинет получившийся файл в app/scss
    .pipe(gulp.dest('app/scss'))
        // Прописывается когда создаем сервер с помощью плагина browser-synch
    .pipe(browserSync.reload({ stream: true }))
})

// Ищем файлы html и при изменениях обновляем браузер (если используем препроцессоры для html, то это прописывается в таске для них(как выше для scss)):
// Обязательно прописать в watch ниже отслеживание за html, т.к. пока изменения в браузере никто не отображает:
gulp.task('html', function () {
    return gulp.src('app/*.html')
        .pipe(browserSync.reload({ stream: true }))
});

// Отслеживаем файлы main.js и др. и при их изменениях обновляем браузер:
gulp.task('script', function () {
    return gulp.src('app/js/*.js')
        .pipe(browserSync.reload({ stream: true }))
});

// Добавляем обновления, когда добавляются какие-нибудь библиотеки:
gulp.task('js', function () {
    return gulp.src([
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/magnific-popup/dist/jquery.magnific-popup.js'
    ])
        // Собираем файлы выше в один (объединяем(конкатенируем) в файл с именем libs.min.js):
        .pipe(concat('libs.min.js'))
        // Минифицируем (сжимаем) собранный файл:
        .pipe(uglify())
        // Выкидываем полученный файл в папку js:
        .pipe(gulp.dest('app/js'))
        // Обновляем браузер:
        .pipe(browserSync.reload({ stream: true }))
});

// Таск используя плагин browser-sync ('browser-sync' в таске это имя, можно и другое вписать) создается сервер для директории app:
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
});

// Таск 'export' (сами так назвали, чтоб понимать, что этот таск экспортируется в другой таск) Создаем папку dist, в которую будет перемещаться из app только то, что нужно для размещения на хостинге:
gulp.task('export', function(){
    // Переменная для переноса html
    let buildHtml = gulp.src('app/**/*.html')
    // Все найденное закидываем в папку dist:
        .pipe(gulp.dest('dist'));
    // То же для переноса css:
    let buildCss = gulp.src('app/css/**/*.css')
        .pipe(gulp.dest('dist/css'));
    // То же для переноса js:
    let buildJs = gulp.src('app/js/**/*.js')
        .pipe(gulp.dest('dist/js'));
    // То же для шрифтов. Т.к. у шрифтов могут быть всякие разные расширения, то ищем все файлы со всеми расширениями:
    let buildFonts = gulp.src('app/fonts/**/*.*')
        .pipe(gulp.dest('dist/fonts'));
    // То же для картинок:
    let buildImg = gulp.src('app/img/**/*.*')
        .pipe(gulp.dest('dist/img'));    
});

// Отслеживаем изменения в файлах gulp.watch и если изменения есть выполняем таск gulp scss, html и js(он же таск script) 
// Для запуска этого таска прописываем в консоле gulp watch
gulp.task('watch', function () {
    gulp.watch('app/scss/**/*.scss', gulp.parallel('scss'))

    gulp.watch('app/*.html', gulp.parallel('html'))
    // Следим за файлами JS в папке app/ и если изменения есть то выполняет js:
    gulp.watch('app/js/*.js', gulp.parallel('script'))
    
});

// До этого создали таск ('clean'), который удаляет папку dist и таск('export'), который перекидывает только то, что нам надо в эту папку dist, а теперь
// создаем таск, который делает эти действия последовательно, сначала чистит, потом закидывает файлы
gulp.task('build', gulp.series('clean', 'export'));

// Дефолтный таск, который выполняется при написании gulp в консоле
// Вначале выполняется таск css, scss, потом js, чтобы перед тем как загрузится картинка знать, что они выполнились, а потом уже запускаем сервер и делаем watch:
gulp.task('default', gulp.parallel('css', 'scss', 'js', 'browser-sync', 'watch'));