const express = require('express')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const multer = require('multer');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      fileExt = file.mimetype.split('/')[1];
      cb(null, `${file.fieldname}-${Date.now()}.${fileExt}`);
    }
  })
})  

const app = express();

app.get('/', (req, res) => {  
  res.sendFile(path.resolve(__dirname, 'index.html'));
})

app.post('/upload', upload.single('videofile'), (req, res) => {
  const filetype = req.file.mimetype.split('/')[0];
  if (filetype === 'video') {
    
    // Generate video thumbnail
    ffmpeg(req.file.path)
      .screenshots({
        count: 1,
        folder: 'uploads/',
        filename: `thumb-${req.file.fieldname}`
      })

    // Generate 5 sec preview
    ffmpeg(req.file.path)
      .seekInput(5)
      .inputOptions('-t 5')
      .on('error', err => console.log(err))
      .on('end', () => console.log('processing finished'))
      .save(`uploads/preview-${req.file.filename}`)

  } else {
    console.log('not a video')
  }

  res.end('File uploaded');
})

app.listen(3000, () => {
  console.log('Listening on Port 3000')
})
