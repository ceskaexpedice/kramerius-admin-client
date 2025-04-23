
console.log("!!!! ARCHIVING ....");
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');


const zipDir = path.join(__dirname, 'dist-zip');
const outputPath = path.join(zipDir, 'kramerius-admin.zip');
const inputDir = path.join(__dirname, 'dist/kramerius-admin-client/browser');

console.log("Checking if zipDirExists " +zipDir);
if (!fs.existsSync(zipDir)) {
    fs.mkdirSync(zipDir, { recursive: true }); 
}

function listFilesRecursive(dir, indent = '') {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            console.log(`${indent}[DIR]  ${file}`);
            listFilesRecursive(fullPath, indent + '  ');
        } else {
            console.log(`${indent}[FILE] ${file}`);
        }
    });
}



const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
    zlib: { level: 9 }
});


output.on('close', function() {
	console.log(`${archive.pointer()} total bytes`);
    console.log('Archiving complete. File descriptor closed.');
});

archive.on('error', function(err) {
    throw err;
});

console.log(`📂 Packing ${inputDir}:`);
listFilesRecursive(inputDir);

archive.pipe(output);


archive.directory(inputDir, 'kramerius-admin', entry => {
	const relPath = entry.name;
    if (relPath.includes('assets/shared')) {
        console.log(`⏭️ Excluding: ${relPath}`);
        return false;
    }
    return entry;
});

archive.finalize();
