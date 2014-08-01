module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        bower: {
            install: {
                options: {
                    cleanBowerDir: true
                }
            }
        },

        gumup: {
            all: {
                options: {
                    onResolve: 'concat.all.files',
                    unitPath: ['src']
                },
                files: {
                    'warby.js': [
                        'src/com/github/amsemy/warby/unit/View.js',
                        'src/com/github/amsemy/warby/Service.js',
                        'src/com/github/amsemy/warby/Form.js'
                    ]
                }
            }
        },

        concat: {
            all: {}
        },

        uglify: {
            all: {
                files: {
                    'warby.min.js': 'warby.js'
                }
            },
            options: {
                sourceMap: true
            }
        },

        jasmine: {
            all: {
                src: [

                    // Библиотеки приложения
                    'lib/jquery/jquery.js',
                    'lib/underscore/underscore.js',
                    'lib/backbone/backbone.js',
                    'lib/gumup/gumup.js',

                    // Приложение
                    'src/**/*.js'
                ],
                options: {
                    specs: [

                        // Библиотеки тестирования
                        'lib/sinon-1.10.3/index.js',

                        // Тесты
                        'spec/**/*.js',

                        // Запускалка тестов
                        'config/test.js'
                    ],
                    version: '1.3.1'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-gumup');

    grunt.registerTask('prepare', ['bower:install']);
    grunt.registerTask('make', ['gumup', 'concat', 'uglify']);
    grunt.registerTask('test', ['make', 'jasmine']);
    grunt.registerTask('spec', ['jasmine:all:build']);

    grunt.registerTask('default', ['test']);

};
