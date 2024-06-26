const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/user.model");

exports.user_signup = (req, res, next)=>{ //409 for confilct or 422 for unaccessible entity
    console.log(req.body)

    User.find({email: req.body.email})
        .then( user =>{
            if(user.length>=1){
                res.status(409).json({
                    message: `Email already registered!`
                });
            }else{
                bcrypt.hash(req.body.password, 10, (err, hashedPassword)=>{ //Hashing a password
                    if(err){
                        return res.status(500).json({
                            error: err
                        })
                    }else{
                        const newUser = new User({
                            email: req.body.email,
                            password: hashedPassword
                        });
                        console.log(newUser)
                        newUser.save()
                            .then(user =>{
                                console.log(user);
                                const token =jwt.sign({ email: user.email, userId: user._id},"secret",{expiresIn: "1h"})

                                res.status(201).json({
                                    message: `${user.email} registered successfully.`,
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
        .catch(err =>{
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.user_login = (req, res, next)=>{
    User.findOne({email: req.body.email})
        .then( user =>{
            if(user){
                //Matching the password from user with the bcrpted one in database
                bcrypt.compare(req.body.password, user.password, (err, result)=>{
                    if(err){
                        res.status(401).json({
                            message: "Authorization failed"
                        });
                    }else if(result){
                        const token =jwt.sign({ email: user.email, userId: user._id},"secret",{expiresIn: "1h"})
                        
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
        .catch(err =>{
            res.status(500).json({
                error: err
            })
        })
}

exports.user_delete = (req, res, next)=>{
    User.findByIdAndDelete({_id: req.params.userId})
        .then( user =>{
            if(user){
                console.log(user);
                res.status(200).json({
                    message: `${user.email} deleted successfully!`
                })
            }
            else{
                res.status(404).json({
                    error: "Email address not found"
                })
            }
            
        })
        .catch( err =>{
            res.status(500).json({
                error: err
            })
        });
}