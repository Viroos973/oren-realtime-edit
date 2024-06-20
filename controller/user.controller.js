const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid")
const User = require("../Model/user.model");
const Expired_Token = require("../Model/expired_token.model");

exports.user_signup = (req, res)=>{
    console.log(req.body)

    User.find({email: req.body.email})
        .then( user => {
            if(user.length >= 1){
                res.status(409).json({
                    message: `Email already registered!`
                });
            }else{
                bcrypt.hash(req.body.password, 10, (err, hashedPassword)=>{
                    if(err){
                        return res.status(500).json({
                            error: err
                        })
                    }else{
                        const newUser = new User({
                            _id: uuid.v4(),
                            email: req.body.email,
                            username: req.body.username,
                            password: hashedPassword
                        });
                        console.log(newUser)
                        newUser.save()
                            .then(user => {
                                console.log(user);
                                const token = jwt.sign({ email: user.email, userId: user._id},"secret",{expiresIn: "1h"})

                                res.status(201).json({
                                    message: `${user.username} registered successfully.`,
                                    token
                                })
                            })
                            .catch(err =>{
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.user_login = (req, res)=> {
    User.findOne({email: req.body.email})
        .then( user => {
            if(user){
                bcrypt.compare(req.body.password, user.password, (err, result)=>{
                    if(err){
                        res.status(401).json({
                            message: "Authorization failed"
                        });
                    }else if(result){
                        const token = jwt.sign({ email: user.email, userId: user._id},"secret",{expiresIn: "1h"})
                        
                        res.status(200).json({
                            message: "Authorization successful",
                            token
                        })
                    }else{
                        res.status(401).json({
                            message: "Authorization failed"
                        });
                    }
                    
                })
            }else{
                res.status(404).json({
                    message: "Email address doesn't exist"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.user_logout = (req, res) => {
    const token = req.headers.authorization.split(" ")[1]

    Expired_Token.create({expired_token: token})
        .then(
            res.status(200).json({
                message: "ok"
            })
        )
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.get_profile = (req, res) => {
    User.findOne({_id: req.userData.userId})
        .then( user => {
            if(user){
                res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    email: user.email
                })
            }else{
                res.status(404).json({
                    message: "User doesn't exist"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.user_delete = (req, res) => {
    User.findByIdAndDelete({_id: req.userData.userId})
        .then( user => {
            if(user){
                console.log(user);
                res.status(200).json({
                    message: `${user.username} deleted successfully!`
                })
            }
            else{
                res.status(404).json({
                    error: "Email address not found"
                })
            }
            
        })
        .catch( err => {
            res.status(500).json({
                error: err
            })
        });
}