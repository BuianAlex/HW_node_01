function RenderDir() {
  this.render = (params, url, host) => {
    const items = '';
    const typeIcon = ['&#128193;', '&#128196;'];
    let files = '';
    let folders = '';
    params.forEach(file => {
      if (file.isFile) {
        files += `<li><a href="${url}/${
          file.name
        }"class="file-str"><span> ${`${typeIcon[1] + file.name}</span> <span>${
          file.about.size
        }byte</span><span>${file.about.mtime}`}</span> </a></li>`;
      } else {
        folders += `<li><a href="${url}/${
          file.name
        }"class="file-str"><span> ${`${typeIcon[0] +
          file.name}</span> <span></span><span>${
          file.about.mtime
        }`}</span> </a></li>`;
      }
    });
    return `
    <!DOCTYPE html>
        <html lang="en">
          <head>
          <link rel="stylesheet" type="text/css" href="/files/css/main.css">
        </head>
      <body>
    <a href="/">Main page</a>  
    <ul>${folders + files}</ul>
    </body>
    </html>
    `;
  };
}
module.exports = RenderDir;
