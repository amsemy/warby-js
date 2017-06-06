const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        helpers: ['sinon'],
        specs: glob.sync('./spec/**/*.js'),
        src: glob.sync('./src/**/*.js'),
        vendor: ['jquery', 'underscore', 'backbone']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    resolve: {
        alias: {
            Src: path.resolve(__dirname, 'src')
        }
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ['helpers', 'src', 'vendor'],
            filename: '[name].js'
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map'
        })
    ]
};
