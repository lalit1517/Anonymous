require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const MemoryStore = require('memorystore')(session)
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy=require("passport-google-oauth20").Strategy;
const findOrCreate=require("mongoose-findorcreate")

const app=express();

app.use(express.static("public"));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    secret: 'keyboard cat'
}))

// app.use(session({
//     secret: "Our little secret",
//     resave: false,
//     saveUninitialized: false
// }));

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://lalitchauhan__:Password00@todolist.akglz1b.mongodb.net/anonymousDB", {useNewUrlParser: true});

const userSchema=new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User=new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    /* Use below : "http://localhost:3000/auth/google/anonymous/" only when deploying locally */
    callbackURL: "https://anonymous-vhve.onrender.com/auth/google/anonymous"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
    res.render("home");
});

app.get("/auth/google", passport.authenticate("google", {scope:["profile"]}));

app.get("/auth/google/anonymous", passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
     res.redirect("/secrets");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){

    User.find({"secret": {$ne: null}}).then(function(foundUsers){
        if(foundUsers){
            res.render("secrets", {usersWithSecrets: foundUsers});
        }
    }).catch(function(err){
        console.log(err);
    });

});

app.get("/submit", function(req, res){
    if(req.isAuthenticated()){
        res.render("submit");
    }
    else{
        res.redirect("/login");
    }
})

app.post("/submit", function(req, res){
    const submittedSecret=req.body.secret;

    User.findOne({_id: req.user.id}).then(function(foundUser){
        if(foundUser)
            {
                foundUser.secret=submittedSecret;
                foundUser.save().then(function(){
                    res.redirect("/secrets");
                });
            }
    }).catch(function(err){
        console.log(err);
    });
    
});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
});

app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });

});

app.post("/login", function(req, res){

    const user=new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            res.render("login");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })

});

app.listen(3000, function(req, res){
    console.log("Server started on port 3000");
});