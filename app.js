const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const userRoutes = require("./router/user");





app.use(morgan('dev')); //To log something to the console showing the path and action after a request have been made
// app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); //for us to make the uploads folder static and accessible


//preventing cors errors
app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    // res.header("Access-Control-Allow-Headers", '*');    
    res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if(res.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({});
    }
    next();
});


//Routes Middlewar
app.use("/users", userRoutes);


//Handling errors
app.use((req, res, next)=>{
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    });
})




module.exports = app;