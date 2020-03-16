//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose"); 

// const encrypt = require("mongoose-encryption");  // level 1 encryption

// const md5 = require("md5"); // level 2 encryption

// const bcrypt = require('bcrypt');  // level 3
// const saltRounds = 10;

const session = require("express-session"); //level-4
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.use(session({
  secret: 'Our little secret',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

app.use(passport.initialize()); //level-4
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true}); //setting up connection 
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({   // create a new schema 
	email: String,
	password: String
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ["password"] });  //level-1 encryption

const User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){

 res.render("home");

})

app.get("/login", function(req,res){

 res.render("login");

})

app.get("/register", function(req,res){

 res.render("register");

})


app.get("/secrets", function(req,res){

	if(req.isAuthenticated())
	{
		res.render("secrets");
	}
	else
	{
        res.redirect("/login");
	}
});

app.post("/register", function(req,res){

/*

// level-3

bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
   
const userItem = new User({

	email: req.body.username,
	password: hash

});

userItem.save(function(err){
	if(err)
	{
		console.log(err);
	}
	else
	{
		res.render("secrets");
	}
}); 

});

*/

User.register({username: req.body.username}, req.body.password, function(err, user){
	
	if(err)
	{
		console.log(err);
		res.redirect("/register");
	}
	else
	{
		passport.authenticate("local")(req,res, function()
		{
			res.redirect("/secrets");
		})
	}
})

});

app.post("/login", function(req,res){

const user = new User({

	username: req.body.username,
	password: req.body.password

});

req.login(user, function(err){
	if(err)
	{
		console.log(err);
	}
	else
	{
		passport.authenticate("local")(req,res, function()
		{
			res.redirect("/secrets");
		})
	}
})

/*

// level-3

 const name = req.body.username;
 const pass = req.body.password;

 User.findOne({email: name}, function(err, foundUser){

 if(!err)
 {
 	if(foundUser)
 	{
 		bcrypt.compare(pass, foundUser.password, function(err, result) 
 	    {
 	    	if(result === true){
             res.render("secrets");
 	    	}
        });
 	}
 	
 }
 else
 {
 	console.log(err);
 }

 });

 */

});

app.get("/logout", function(req, res){

 req.logout();
 res.redirect("/");

})


app.listen(3000);

// mongoose-encryption npm package
// AES algorithm is used in this package