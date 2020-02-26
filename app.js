/* eslint-disable no-case-declarations */
/* eslint-disable func-names */
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const zlib = require('zlib');
const formidable = require('formidable');
const fileSys = require('./app_modules/fileSys');
const helper = require('./app_modules/helpers');
const Treker = require('./app_modules/treker');
const RenderDir = require('./views/renderDir');
const RenderStat = require('./views/renderStat');
const UploadForm = require('./views/upload-form');

const trek = new Treker();
const hostname = '127.0.0.1';
const port = 1111;

const server = http.createServer(async (req, res) => {
  const q = url.parse(req.url, true);

  const reqUrl = q.pathname.split('/');

  // GET REQ
  if (req.method === 'GET') {
    switch (reqUrl[1]) {
      case 'ping':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html, charset=utf-8');
        res.end('pong');
        break;

      case 'locale':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end('Приіт світ');
        break;

      case 'echo-query':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const rest = reqUrl.splice(2);
        res.end(rest.join('/'));
        break;
      case 'echo-data':
        fileSys.sendFile(res, '../views/post-form.html');
        break;

      case 'address':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(server.address().address);
        break;

      case 'error':
        res.statusCode = 500;
        res.end('Server Error Status: 500');
        break;

      case 'files':
        reqUrl.splice(0, 2);
        const filePath = path.join(__dirname, 'data', ...reqUrl);
        const file = path.parse(filePath);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          fs.readdir(filePath, (err, files) => {
            if (err) {
              res.statusCode = 404;
              res.end(`Not Found`);
              console.error(`files${err}`);
            } else {
              const filesStat = files.map(item => {
                const fstat = fs.statSync(path.join(filePath, item));
                return {
                  about: fstat,
                  isFile: fstat.isFile(),
                  name: item
                };
              });
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.write(
                new RenderDir().render(
                  filesStat,
                  q.href,
                  server.address().address
                )
              );
            }
            res.end();
          });
        } else {
          const streamFile = fs.createReadStream(filePath);

          streamFile.on('error', err => {
            trek.saveEvent({
              evType: 'download',
              fileName: file.base,
              successful: false,
              err
            });
            res.statusCode = 404;
            res.end('Not Found');
          });

          streamFile.on('open', () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', helper.setContentType(file.ext));
            res.setHeader('Content-Length', stat.size);
            if (helper.hasKey(q.query, 'download')) {
              res.setHeader(
                'Content-Disposition',
                `attachment;filename="${helper.setFileName(
                  q.query,
                  file.base
                )}"`
              );
            }
            if (helper.hasKey(q.query, 'compress')) {
              res.setHeader('Content-Encoding', 'gzip');
              streamFile.pipe(zlib.createGzip()).pipe(res);
            } else {
              streamFile.pipe(res);
            }
          });
          streamFile.on('close', () => {
            trek.saveEvent({
              evType: 'download',
              fileName: file.base,
              successful: true,
              err: ''
            });
          });
        }
        break;

      case 'stats':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const trekerData = await trek.readEvents();
        res.end(new RenderStat().render(trekerData));
        break;

      case 'upload':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(new UploadForm().render());
        break;

      case '':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        fileSys.sendFile(res, '../views/index.html');
        // res.end('hello world');
        break;

      default:
        res.statusCode = 404;
        res.end('404 Not Found');
        break;
    }
  }

  // POST REQ
  if (req.method === 'POST') {
    if (reqUrl[1] === 'upload') {
      const form = new formidable.IncomingForm();
      form.uploadDir = path.join(__dirname, 'data/temp');
      form.parse(req, function(err, fields, files) {
        if (files.filetoupload.size === 0) {
          trek.saveEvent({
            evType: 'upload',
            fileName: '',
            successful: false,
            err: 'empty form'
          });
          res.statusCode = 403;
          res.end(
            new UploadForm({
              text: `Form is empty`,
              error: true
            }).render()
          );
        } else if (
          fs.existsSync(
            path.join(__dirname, 'data', files.filetoupload.name)
          ) &&
          !fields.force
        ) {
          trek.saveEvent({
            evType: 'upload',
            fileName: files.filetoupload.name,
            successful: false,
            err: 'overriding'
          });
          res.statusCode = 403;
          res.end(
            new UploadForm({
              text: `File whith name ${files.filetoupload.name}  is already stored.\nOverriding files is prohibited by default`,
              error: true
            }).render()
          );
        } else {
          const source = fs.createReadStream(files.filetoupload.path);
          const dest = fs.createWriteStream(
            path.join(__dirname, 'data', files.filetoupload.name)
          );
          source.pipe(dest);
          source.on('end', function() {
            trek.saveEvent({
              evType: 'upload',
              fileName: files.filetoupload.name,
              successful: true,
              err: ''
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(
              new UploadForm({
                text: `File uploaded successfully`
              }).render()
            );
          });
          source.on('error', function(error) {
            trek.saveEvent({
              evType: 'upload',
              fileName: files.filetoupload.name,
              successful: false,
              err: error
            });
            console.error(error);
          });
        }
        form.on('aborted', () => {
          trek.saveEvent({
            evType: 'upload',
            fileName: files.filetoupload.name,
            successful: false,
            err: 'aborted'
          });
        });
        form.on('error', e => {
          trek.saveEvent({
            evType: 'upload',
            fileName: files.filetoupload.name,
            successful: false,
            err: e
          });
        });
      });
    } else if (reqUrl[1] === 'echo-data') {
      let body = [];
      req.on('data', chunk => {
        body.push(chunk);
      });
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        body = Buffer.concat(body).toString();
        res.end(`You have sent: ${body}`);
      });
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }
  // res.statusCode = 404;
  // res.end('Not Found');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
