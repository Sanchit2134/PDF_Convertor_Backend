const express = require('express');
const multer = require('multer');
const cors = require('cors');
const docxToPdf = require('docx-pdf');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(cors());
//Storage create kar rahai hain

const dirPath = path.join('/tmp', 'uploads');

if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dirPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })
  app.post('/convertor', upload.single('file'), (req, res, next)=> {
    try{
        if(!req.file){
            return res.status(400).json({
                message: 'Please upload a file'
            })
        }
        //defining output file path
        let outputFilePath = path.join(__dirname,"files",`${req.file.originalname}.pdf`)

        //converting docx to pdf
        docxToPdf(req.file.path , outputFilePath , (err,result)=>{
            if(err){
              console.log(err);
              return res.status(500).json({
                message: 'Error in converting file'
              })
            }
            res.download(outputFilePath, ()=>{
                console.log('File downloaded successfully');
            })
          });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: 'Internal server error',
        
        })
    }
  })
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
