const helper = require('../app_modules/helpers');

function RenderStat() {
  this.render = params => {
    let dwTable = '';
    Object.keys(params.dw).forEach(key => {
      dwTable += `
        <tr>
          <td>${key}</td>
          <td>${params.dw[key].dw}</td>
          <td>${params.dw[key].time}</td>
        <tr>
      `;
    });
    let allEvents = '';
    params.all.forEach(item => {
      allEvents += `
        <tr>
        <td>${item.evType}</td>
        <td>${helper.toDate(item.time)}</td>
        <td>${item.fileName}</td>
        <td>${item.err || ' '}</td>
        <tr>
      `;
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
      <link rel="stylesheet" type="text/css" href="files/css/main.css">
    </head>
    <body>
    <a href="/">Main padge</a> 
    <h2>Downloads stat</h2>
      <table>
        <tr>
          <th>Filename</th>
          <th>Calc downloads</th>
          <th>Time last dodnload</th>
        </tr>
        ${dwTable}
      <table>
    <h2> All event log</h2>
      <table>
        <tr>
          <th>Event Type</th>
          <th>Event Time</th>
          <th>File name</th>
          <th>Error</th>
        </tr>
        ${allEvents}
      </table>
    </body>
    </html>
    `;
  };
}
module.exports = RenderStat;
