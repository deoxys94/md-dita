const path = require('path');

module.exports = {
    mode: 'production',
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    entry: [
        './src/md-dita.ts'
    ],
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: 'md-dita.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'MdDita'
    },
};
