const webpackConfig = require('./webpack.config');
const webpackTestConfig = require('./webpack.test.config');

module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        webpack: {
            dist: webpackConfig,
            test: webpackTestConfig
        },

        jasmine: {
            all: {
                src: [
                    'build/warby.spec.js'
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks("grunt-webpack");

    grunt.registerTask('dist', ['webpack:dist']);
    grunt.registerTask('test', ['webpack:test', 'jasmine']);
    grunt.registerTask('spec', ['webpack:test', 'jasmine:all:build']);

    grunt.registerTask('default', ['dist']);

};
