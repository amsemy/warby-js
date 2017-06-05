const path = require('path');
const webpack = require('webpack');

const src = [
    './View.js',
    './Form.js',
    './Service.js',
    './restyProvider.js'
];

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: {
        'warby': src,
        'warby.min': src
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'Warby'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            include: /\.min\.js$/,
            sourceMap: true
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
