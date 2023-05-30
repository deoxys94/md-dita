const path = require('path');

module.exports = {
    mode: 'production',
    resolve: {
        extensions: ['.js']
    },
    entry: [
        './dist/md-dita.js'
    ],
    output: {
        filename: 'mdDita.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'MdDita'
    },
};