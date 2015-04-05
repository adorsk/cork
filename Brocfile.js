var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var browserify = require('broccoli-fast-browserify');
var babelify = require('babelify');


var jsTree = pickFiles('public/', {
    srcDir: '/',
    files: ['**/*.js',],
    destDir: '/'
});

jsTree = browserify(jsTree, {
    bundles: {
        'cork.js': {
            entryPoints: ['**/*.browserify.js'],
            transform: [babelify]
        }
    }
});

module.exports = mergeTrees(['public/', jsTree], {overwrite: true});
