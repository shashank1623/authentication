//jshint esversion:6

//level up our security we are adding level-5 in which we are going to add passport to introduce the login
//session

//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
//in order to create user database we need to install mongoose and mongodb
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true }
  })
);
app.use(passport.initialize());
app.use(passport.session());

//in order to connect our backend server to datbase server we need to connect it with our mongodb database server
//in our local to global database server

mongoose.connect("mongodb://localhost:27017/userDB2", {
  useNewUrlParser: true,
});
//mongoose.set("useCreateIndex", true);
//in order to setup the user database we need to create the schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  name: String,
  displayName: String,
  birthday: String,
  relationship: String,
  isPerson: String,
  isPlusUser: String,
  placesLived: String,
  language: String,
  emails: String,
  gender: String,
  picture: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//we can use our user schema to setup our new user model
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/test",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },

    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      console.log(profile.emails[0].value);
      User.findOrCreate({ username: profile.emails[0].value, googleId: profile.id}, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/auth/google")

  .get(
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })
  );
app.get(
  "/auth/google/test",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("sucessfull");
    res.redirect("/test");
  }
);
app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/test", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("test");
  } else {
    res.redirect("/login");
  }
});
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});
app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/test");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/test");
      });
    }
  });
});

app.listen(3000, function () {
  console.log("server running on port:3000");
});
