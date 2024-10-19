const multer = require('multer')
const path = require('path')

//storege configuration
const storage = multer.diskStorage({
    destination: function(req,res,cb) {
        cb(null,"./uploads")
    },
    filename: function(req,file,cb){
        cb(null,Date.now() + path.extname(file.originalname))
    },
})


//file filter to accept only images
const fileFilter = (req,file,cb) => {
    if (file.mimetype.startsWith("image/")){
        cb(null,true)
    }
    else{
        cb(new Error("Onlye images are allowe"), false)
    }
}

//initialize multer instance
const upload = multer({storage,fileFilter})

module.exports = upload