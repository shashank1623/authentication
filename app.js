//jshint esversion:6


//level up our security we are adding level-5 in which we are going to add passport to introduce the login 
//session 

//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
//in order to create user database we need to install mongoose and mongodb
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');




const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: 'Our little secret',
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true }
  }));
app.use(passport.initialize());
app.use(passport.session());

//in order to connect our backend server to datbase server we need to connect it with our mongodb database server
//in our local to global database server

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
//mongoose.set("useCreateIndex", true);
//in order to setup the user database we need to create the schema
const userSchema = new mongoose.Schema({
    email: String,
    password:String
});

userSchema.plugin(passportLocalMongoose);


//we can use our user schema to setup our new user model 
const User = new mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});
app.post("/register",function(req,res){
    
    User.register({username: req.body.username},req.body.password,function(err,user)
    {
        if(err)
        {
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
                
            });
        }
    });
});

app.post("/login",function(req,res){


    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user , function(err)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
                    
                });
        }
    });
});


app.listen(3000,function()
{
    console.log("server running on port:3000");
});