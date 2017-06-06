const webpackConfig = require('./webpack.config');
const webpackTestConfig = require('./webpack.test.config');

module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ['dist/*'],
            test: ['build', '_SpecRunner.html']
        },

        webpack: {
            dist: webpackConfig,
            test: webpackTestConfig
        },

        jasmine: {
            all: {
                options: {
                    helpers: 'build/helpers.js',
                    specs: 'build/specs.js',
                    vendor: 'build/vendor.js'
                },
                src: 'build/src.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks("grunt-webpack");

    grunt.registerTask('dist', ['clean:dist', 'webpack:dist']);
    grunt.registerTask('test', ['clean:test', 'webpack:test', 'jasmine']);
    grunt.registerTask('spec', ['clean:test', 'webpack:test', 'jasmine:all:build']);

    grunt.registerTask('default', ['dist']);

};
