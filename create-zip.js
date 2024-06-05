
console.log("!!!! ARCHIVING ....");
const fs = require('fs');
const archiver = require('archiver');

if (!fs.existsSync(__dirname + '/dist-zip')) {
    fs.mkdirSync(__dirname + '/dist-zip');
}

const output = fs.createWriteStream(__dirname + '/dist-zip/kramerius-admin.zip');
const archive = archiver('zip', {
    zlib: { level: 9 }
});


output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
    throw err;
});

archive.pipe(output);

archive.directory(__dirname + '/dist/kramerius-admin', 'kramerius-admin');

archive.finalize();
