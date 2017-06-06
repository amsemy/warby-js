const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        'warby': './src/main.js',
        'warby.min': './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'Warby'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
            exclude: /\.min\.js$/
        })
    ],
    externals: {
        backbone: {
            commonjs: 'backbone',
            commonjs2: 'backbone',
            amd: 'backbone',
            root: 'Backbone'
        },
        jquery: {
            commonjs: 'jquery',
            commonjs2: 'jquery',
            amd: 'jquery',
            root: 'jQuery'
        },
        underscore: {
            commonjs: 'underscore',
            commonjs2: 'underscore',
            amd: 'underscore',
            root: '_'
        }
    }
};
