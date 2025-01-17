const IncomingForm = require('formidable').IncomingForm

module.exports = function upload(req, res) {
  let form = new IncomingForm()

  form.on('file', (field, file) => {
    // Do something with the file
    // e.g. save it to the database
    // you can access it using file.path
  })
  form.on('end', () => {
    res.status(200).json({
      message: "file uploaded"
    })
  })
  form.parse(req)
}