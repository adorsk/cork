var esTranspiler = require('broccoli-babel-transpiler');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');


var jsTree = pickFiles('public/', {
  srcDir: '/',
  files: ['**/*.js',],
  destDir: '/'
});

jsTree = esTranspiler(jsTree);

module.exports = mergeTrees(['public/', jsTree], {overwrite: true});
