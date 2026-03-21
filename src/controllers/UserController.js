const userSchema = require("../models/UserModel")
const bcrypt = require("bcrypt")
const mailSend = require("../utils/MailUtil")
const jwt = require("jsonwebtoken")
const secret = "secret"

const registerUser = async (req,res)=> {

    try{

        const hashedPassword = await bcrypt.hash(req.body.password,10)

        // const savedUser = await userSchema.create(req.body)
        const savedUser = await userSchema.create({...req.body,password:hashedPassword})

        await mailSend(savedUser.email,"Welcome to our Website","Thank you registering in our website")
        res.status(201).json ({
            message : "user created...",
            data : savedUser
        })

    }catch(err){
        res.status(500).json({
            message : "error while creating user",
            err : err
        })
    }
}

const loginUser = async(req ,res) => {

    try{

        const {email , password} = req.body

        const foundUserFromEmail = await userSchema.findOne({email : email})
        console.log("user found",foundUserFromEmail);
        if(foundUserFromEmail){

            const isPasswordMatched =  await bcrypt.compare(password,foundUserFromEmail.password)
            if(isPasswordMatched){

                const token = jwt.sign(foundUserFromEmail.toObject(),secret,{expiresIn:60})

                res.status(200).json({
                    message : "login Successfull",
                    token : token,
                    // data : foundUserFromEmail,
                    role : foundUserFromEmail.role
                })
            }else{
                res.status(401).json({
                    message : "invalid credential"
                })
            }
        }else{
            res.status(404).json({
                message : "user not found"
            })
        }
        

    }catch(err){
        res.status(500).json({
            message : "Error while login ",
            err : err
        })
    }
}

const getUser = async (req,res) => {
    try { 

        const users = await userSchema.find()  // {status : "Active"}
        res.status(200).json ({
            message : "user found...",
            data : users
        })

    }catch(err){
        res.status(500).json ({
            message : "error while fetching user",
            err : err
        })
    }
}

const updateUser = async (req , res) => {

    try {

        const update = await userSchema.findByIdAndUpdate(req.params.id , req.body)
        res.status(200).json({
            message : "User updated",
            data : update
        })

    }catch(err){
        res.status(500).json({
            message : "Error while updating user",
            err : err
        })
    }
}

const deleteUser = async(req ,res) => {

    try{

        const deleteObj = await userSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message : "User deleted successfully",
            data : deleteObj
        })

    }catch(err){
        res.status(500).json({
            message : "Error while deleting user",
            err : err
        })
    }

}

module.exports = {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    deleteUser
}