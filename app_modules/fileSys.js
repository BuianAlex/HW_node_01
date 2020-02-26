const path = require('path');
const fs = require('fs');

function sendFile(res, filePath) {
  const stream = fs.createReadStream(path.join(__dirname, filePath));

  stream.on('error', e => {
    res.statusCode = 500;
    res.end(e);
    console.error(`sendFile${e}`);
  });

  stream.on('open', function() {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    stream.pipe(res);
  });

  stream.on('end', () => {
    res.end();
  });
}

module.exports = { sendFile };
