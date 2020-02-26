const fs = require('fs');
const { Transform } = require('stream');
const helper = require('../app_modules/helpers');

function Treker() {
  this.saveEvent = event => {
    const { evType, fileName, succeful, err } = event;
    const time = Date.now();

    const file = fs.createWriteStream('./data/event.db', { flags: 'a+' });
    file.write(
      `${JSON.stringify({ evType, fileName, succeful, err, time })}\r\n`
    );
    file.on(`error`, err => {
      console.error(`saveEvent${err}`);
    });
  };

  this.readEvents = () => {
    const readFile = fs.createReadStream('./data/event.db');

    return new Promise((resolve, reject) => {
      let data = '';
      readFile.on('data', chunk => (data += chunk));
      readFile.on('end', () => {
        const allData = helper.parsEventData(data);
        const statDW = {};
        allData.forEach(item => {
          if (item.evType === 'download') {
            if (!statDW[item.fileName]) {
              statDW[item.fileName] = {
                dw: 1,
                time: item.time
              };
            }
            statDW[item.fileName] = {
              dw: statDW[item.fileName].dw + 1,
              time:
                item.time > statDW[item.fileName].time
                  ? item.time
                  : statDW[item.fileName].time
            };
          }
        });
        resolve({ all: allData, dw: statDW });
      });
      readFile.on('error', error => {
        console.error(`readEvents${error}`);
        reject(error);
      });
    });
  };
}

module.exports = Treker;
