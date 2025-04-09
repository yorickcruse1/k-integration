const path = require('path');

module.exports = {
    entry: './src/app.js', // Your entry file
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
    target: 'web', // Ensures compatibility with browsers
};