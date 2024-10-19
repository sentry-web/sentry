require('dotenv').config();

const config = require('./config.json');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const jwt  = require('jsonwebtoken');
const {authenticationToken} = require('./utils')

const User = require('./models/userModels')
const TravelStory = require('./models/travelStoryModels');
const upload = require('./multer');
const fs = require("fs")
const path = require("path")


mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());
app.use(cors({origin: '*'}));

//test api 
app.get("/hello",async (req,res) => {
    return res.status(200).json({message: "hello"});
});

//create account
app.post("/create-account",async (req,res) => {
    const {fullname,email,password} = req.body

    if(!fullname || !email || !password)
    {
        return res 
        .status(400)
        .json({
            success:false,
            message:'All fields are required'
        })
    }

    const isUser = await User.findOne({email});
    if(isUser)
        {
            return res 
            .status(400)
            .json({
                success:false,
                message:'User already exists'
            })
        }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({
        fullname,
        email,
        password:hashedPassword,
    });

    await user.save()

    const acccesToken = jwt.sign({
        userId: user.id},
        process.env.ACCESS_SECRET_TOKEN,
        {
            expiresIn:'72h',
    })
   
    return res.status(201).json({
        success:true,
        user: {fullname: user.fullname,email: user.email},
        acccesToken,
        message: 'Registration Successful',
    })
})

//login
app.post("/login",async (req,res) => {
    const {email,password} = req.body

    if(!email || !password)
    {
        return res 
        .status(400)
        .json({
            success:false,
            message:'All fields are required'
        })
    }

    const isUser = await User.findOne({email});
    if(!isUser)
        {
            return res 
            .status(400)
            .json({
                success:false,
                message:'User not found'
            })
        }

    const isPassword = await bcrypt.compare(password,isUser.password)
    if(!isPassword)
        {
            return res 
            .status(400)
            .json({
                success:false,
                message:'Invalid credentials'
            })
        }

    
    const acccesToken = jwt.sign({
        userId: isUser.id},
        process.env.ACCESS_SECRET_TOKEN,
        {
            expiresIn:'72h',
    })
    
    return res.status(201).json({
        success:true,
        user: {fullname: isUser.fullname,email: isUser.email},
        acccesToken,
        message: 'Login Successful',
    })
})


//get user
app.get('/get-user',authenticationToken , async(req,res) => {
    const {userId} = req.user
    const isUser = await User.findOne({_id: userId});
    if(!isUser)
        {
            return res 
            .status(401)
            .json({
                success:false,
                message:'',
                user:[]
            })
        }
    return res 
    .status(200)
    .json({
        success:true,
        message:'',
        user:isUser
    })
})

//ruote ti handle image upload
app.post('/upload-image',upload.single("image") , async(req,res) => {

    try {
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"No image upload"
            })
        }

        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`
        return res.status(200).json({
            imageUrl
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
})


//ruote ti handle image delete
app.delete('/delete-image', async(req,res) => {
    const {imageUrl} = req.query

    if(!imageUrl){
        return res.status(400).json({
            success:false,
            message:"imageurl parameter is required"
        })
    }
    try {
        //extract the filename from the imageurl
        const filename = path.basename(imageUrl)

        //define the file path
        const filepath = path.join(__dirname,"uploads",filename)

        //ckecking if the file exists
        if(fs.existsSync(filepath)){
            //delete the file from the uploads folder
            fs.unlinkSync(filepath)
            return res.status(200).json({
                success:true,
                message:"Image deleted successfully"
            })
        }
        else{
            return res.status(200).json({
                success:false,
                message:"Image not found"
            })
        }
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

})

app.use("/uploads",express.static(path.join(__dirname,"uploads")))
app.use("/assets",express.static(path.join(__dirname,"assets")))

//add travel story
app.post('/add-travel-story',authenticationToken , async(req,res) => {
    const {title ,story,visitedLocation,imageUrl,visitedDate,isFavourite} = req.body
    const {userId} = req.user

    //validate required fields
    if(!title || !story || !visitedLocation || !imageUrl || !visitedDate ){
        return res.status(400).json({
            success:false,
            message:'All fields al required'
        })
    }

    //convert visitedate from milliseconds to date object
    const parsedVisitedDate = new Date(parseInt(visitedDate))

    try {
    const travelStory = new TravelStory({
        title,
        story,
        visitedLocation,
        userId,
        imageUrl,
        visitedDate:parsedVisitedDate,
        isFavourite
    })

    await travelStory.save()

    return res.status(201).json({
        success:true,
        message:'add travel successfully',
        data:travelStory
    })

    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }

})

//get all travel stories
app.get('/get-travel-stories',authenticationToken , async(req,res) => {
    const {userId} = req.user

    try{
        const travelStory = await TravelStory.find({userId: userId}).sort({isFavourite: -1})
        return res.status(200).json({
            success:true,
            message:'Get all stories',
            stories:travelStory
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            stories:[]
        }) 
    }
})

//update travel stories
app.put('/update-travel-stories/:id',authenticationToken , async(req,res) => {
    const {id} = req.params
    const {title ,story,visitedLocation,imageUrl,visitedDate} = req.body
    const {userId} = req.user

    //validate required fields
    if(!title || !story || !visitedLocation || !visitedDate ){
        return res.status(400).json({
            success:false,
            message:'All fields al required'
        })
    }

    //convert visitedate from milliseconds to date object
    const parsedVisitedDate = new Date(parseInt(visitedDate))

    try{
        ///find the travel story by Id it belongs  to the authenticated user
        const travelStory = await TravelStory.findOne({_id:id,userId:userId})

        if(!travelStory){
            return res.status(404).json({
                success:true,
                message:"travel story not found"
            })
        }

        const placeholderImgUrl = `http://localhost:8000/assets/placeholder.png`

        travelStory.title = title
        travelStory.story = story
        travelStory.visitedLocation = visitedLocation
        travelStory.imageUrl = imageUrl
        travelStory.visitedDate = parsedVisitedDate

        await travelStory.save()
        return res.status(200).json({
            success:true,
            message:'travel story updated successfully',
            stories:travelStory
        }) 
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            stories:[]
        }) 
    }
})

//delete travel stories
app.delete('/delete-travel-stories/:id',authenticationToken , async(req,res) => {
    const {id} = req.params
    const {userId} = req.user

    try{
        ///find the travel story by Id it belongs  to the authenticated user
        const travelStory = await TravelStory.findOne({_id:id,userId:userId})

        if(!travelStory){
            return res.status(404).json({
                success:true,
                message:"travel story not found"
            })
        }

        //delete the travel story from the database
        await travelStory.deleteOne({_id:id,userId:userId})

        const imgUrl = travelStory.imageUrl
        const filename = path.basename(imgUrl)


        //define the file path
        const filepath = path.join(__dirname,"uploads",filename)

        //delete the image file from the uploads folder
        fs.unlink(filepath,(err) => {
            if(err){
                console.log("failed to deleted image file",err)
            }
        })

        return res.status(200).json({
            success:true,
            message:"travel story was deleted successfully",
            stories:travelStory
        }) 
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            stories:[]
        }) 
    }

})


//update isFavourite
app.put('/update-is-favourite/:id',authenticationToken , async(req,res) => {
    const {id} = req.params
    const {userId} = req.user
    const {isFavourite} = req.body

    try{
        ///find the travel story by Id it belongs  to the authenticated user
        const travelStory = await TravelStory.findOne({_id:id,userId:userId})

        if(!travelStory){
            return res.status(404).json({
                success:true,
                message:"travel story not found"
            })
        }

        travelStory.isFavourite = isFavourite
        travelStory.save()

        return res.status(200).json({
            success:true,
            message:"travel story was update successfully",
            stories:travelStory
        }) 
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            stories:[]
        }) 
    } 

})

//search travel query
app.get('/search',authenticationToken , async(req,res) => {
    const {userId} = req.user
    const {query} = req.query

    if(!query)
    {
        return res.status(400).json({
            success:false,
            message:'query was required'
        })
    }

    try {

        const searchResults = await TravelStory.find({
            userId:userId,
            $or: [
                {title: {$regex: query,$options: "i"}},
                {story: {$regex: query,$options: "i"}},
                {visitedLocation: {$regex: query,$options: "i"}},
            ],
        }).sort({isFavourite: -1})

        return res.status(200).json({
            success:true,
            message:"search query",
            stories:searchResults
        }) 


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            stories:[]
        }) 
    }
})

//filter travel query
app.get('/travel-stories/filter',authenticationToken , async(req,res) => {
    const {userId} = req.user
    const {starTDate,endDate} = req.query

    try{
        //convert startDate and endDate from milliseconds to date objects
        const start = new Date(parseInt(starTDate))
        const end = new Date(parseInt(endDate))

        //find travel stories that belong to the authenticathed user and fall within teh date range
        const filterStories = await TravelStory.find({
            userId:userId,
            visitedDate: {$gte:start,$lte:end},
        }).sort({isFavourite: -1})

        return res.status(200).json({
            success:true,
            message:"filter stories",
            stories:filterStories
        }) 
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            stories:[]
        }) 
    }

})

app.listen(8000);
module.exports = app;
