const { gitDescribeSync } = require('git-describe');
const { writeFileSync } = require('fs');

const info = gitDescribeSync();
const versionInfoJson = JSON.stringify(info, null, 2);

writeFileSync('git-info.json', versionInfoJson);