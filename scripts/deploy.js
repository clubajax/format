const path = require('path');
const files = require('@clubajax/node-file-managment');

console.log('PWD', __dirname);
const deployDir = './build';
files.mkdir(deployDir);

files.copyFile('./index.js', path.resolve(deployDir, 'index.js'));
files.copyFile('./README.md', path.resolve(deployDir, 'README.md'));
files.updateBuildPackage();