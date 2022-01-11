//jshint esversion:6


//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
//in order to create user database we need to install mongoose and mongodb
const mongoose = require("mongoose");

//encyption of data through mongoose encyption
const encrypt = require("mongoose-encryption")
const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

//in order to connect our backend server to datbase server we need to connect it with our mongodb database server
//in our local to global database server

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});

//in order to setup the user database we need to create the schema
const userSchema = new mongoose.Schema({
    email: String,
    password:String
});


//adding ecryption package to the schema

userSchema.plugin(encrypt,{secret:process.env.SECRET , encryptedFields:['password']});


//we can use our user schema to setup our new user model 
const User = new mongoose.model("User",userSchema);

//
app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res)
{
    res.render("login")
});

app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",function(req,res){
    
    const newUser = new User({
        email: req.body.username,
        password:req.body.password
    });

    newUser.save(function(err){   //.save field will encypt our data
        if(err)
        {
            console.log(err);
        }else{
            res.render("secrets");
        }
    })
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username},function(err,foundUser){      ///.find will decrypt the data 
        if(err)
        {
            console.log(err);
        }else{
            if(foundUser)
            {
                if(foundUser.password===password)
                {
                    res.render("secrets");
                }
            }
        }
    });
})


app.listen(3000,function()
{
    console.log("server running on port:3000");
});