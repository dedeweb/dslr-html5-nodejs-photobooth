var fs = require('fs-extra');

fs.removeSync('../dist/fake_gphoto.sh');
fs.copySync('fake_gphoto.sh', '../dist/fake_gphoto.sh');
fs.removeSync('../dist/fake_gphoto_files');
fs.copySync('fake_gphoto_files', '../dist/fake_gphoto_files');