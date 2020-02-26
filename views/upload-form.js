function UpForm(param) {
  const message = {};
  if (param) {
    message.text = param.text;
    message.error = param.error;
  } else {
    message.text = '';
    message.error = false;
  }
  this.render = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" type="text/css" href="files/css/main.css" />
        </head>
        <body>
        
          <form action="/upload" method="post" enctype="multipart/form-data">
          <a href="/">Go to main page</a>
         <h3>File upload form</h3>
           <p> <input type="file" name="filetoupload" /></p>
            <p><lable for="chb">force</lable>
           <input type="checkbox" name="force" value="true"id="chb"/></p>
            <p><input type="submit" /></p>
            <span class="message ${(message.error && 'message_error') || ''}">${
      message.text
    }</span> 
    <a href="/files">Go to files</a>
          </form>
         
        </body>
      </html>
    `;
  };
}

module.exports = UpForm;
