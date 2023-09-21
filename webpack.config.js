const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


module.exports = {
    entry: './src/index.ts',  // Your main TypeScript entry file
    mode: 'production',  // Set mode to production for minification
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
    },
    output: {
        filename: 'phylojs.min.js',
        path: path.resolve(__dirname, './lib/dist/'),
        library: 'phylojs',  // Name you want for the global variable when included in a browser
        libraryTarget: 'umd',  // Universal module definition
    },
    optimization: {
        minimize: true,
    }
};
