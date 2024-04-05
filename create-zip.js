const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(__dirname + '/dist-zip/kramerius-admin.zip');
const archive = archiver('zip', {
    zlib: { level: 9 } 
});

archive.pipe(output);
archive.directory(__dirname +'/dist/kramerius-admin', false);
archive.finalize();

