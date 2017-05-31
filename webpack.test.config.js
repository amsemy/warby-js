const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        'warby.spec': glob.sync('./spec/**/*.js')
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'WarbySpec'
    },
    resolve: {
        alias: {
            warby: path.resolve(__dirname, 'src')
        }
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map'
        })
    ]
};
