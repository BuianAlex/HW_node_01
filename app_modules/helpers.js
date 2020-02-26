function hasKey(object, value) {
  return Object.keys(object).indexOf(value) !== -1;
}

function setFileName(query, curentName) {
  let newName = curentName;
  if (hasKey(query, 'filename')) {
    newName = query.filename;
  }
  if (hasKey(query, 'compress')) {
    newName += '.gz';
  }
  return newName;
}

function setContentType(ext) {
  let type = 'text/plain';
  switch (ext) {
    case '.mp3':
      type = 'audio/mpeg';
      break;
    case '.mp4':
      type = 'video/mp4';
      break;
    case '.txt':
      type = 'text/html';
      break;
    case '.css':
      type = 'text/css';
      break;
    default:
      break;
  }
  return type;
}

function toDate(time) {
  let datastring = '';
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  if (time) {
    const d = new Date(time);
    datastring = `${d.getHours()}:${d.getMinutes()} ${d.getDate()} ${
      months[d.getMonth()]
    } ${d.getFullYear()}`;
  }
  return datastring;
}

function parsEventData(buf) {
  const dataJson = [];
  let start = false;
  let end = false;
  let temp = '';

  for (let i = 0; i < buf.length; i++) {
    if (/{/.test(buf[i])) {
      start = true;
    }
    if (/}/.test(buf[i])) {
      end = true;
    }
    if (start) {
      temp += buf[i];
    }
    if (end) {
      dataJson.push(JSON.parse(temp));
      temp = '';
      start = false;
      end = false;
    }
  }
  return dataJson;
}

module.exports = { hasKey, setFileName, setContentType, toDate, parsEventData };
