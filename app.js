var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require("mongoose");
var Post = require("./models/posts");
var bodyParser = require("body-parser");
var User = require("./models/user");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var flash = require("connect-flash");
var methodOverride = require("method-override");







var url = process.env.MONGODBURL || "mongodb://localhost/photosByMia"
mongoose.connect(url, {
    useNewUrlParser: true

});
console.log(url);




app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));

app.use(flash());



// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "molle är bäst",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/", function (req, res) {
    res.render("landing");
});


app.get("/gallery", function (req, res) {
    // Get all Posts from DB
    Post.find({}, function (err, allPosts) {
        if (err) {
            console.log(err);
            console.log("nothing to show ");
        } else {
            res.render("posts/gallery", { posts: allPosts });
        }
    });
});

app.get("/new", function (req, res) {
    res.render("posts/new");
});

app.post("/new", function (req, res) {
    var image = req.body.image;
    var description = req.body.description;


    var newPost = { description: description, image: image }

    Post.create(newPost, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            console.log(newlyCreated);
            res.redirect("/gallery");
        }
    });
});

app.get("/about", function (req, res) {
    res.render("about");
});



// SHOW - shows more info about one posts
app.get("/posts/:id", function (req, res) {
    Post.findById(req.params.id, function (err, foundPost) {
        if (err) {
            res.redirect("/posts");
        } else {
            res.render("posts/show", { posts: foundPost });

        }
    });
});

//EDIT ROUTE 
app.get("/posts/:id/edit", function (req, res) {
    Post.findById(req.params.id, function (err, foundPost) {
        if (err) {
            res.redirect("/posts");
        } else {
            res.render("posts/edit", { posts: foundPost });
        }
    });
});

//UPDATE ROUTE
app.put("/posts/:id", function (req, res) {
    Post.findByIdAndUpdate(req.params.id, req.body.posts, function (err, updatedBlog) {
        if (err) {
            res.redirect("/gallery");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});

//DELETE ROUTE 
app.delete("/posts/:id", function(req, res){
    Post.findByIdAndRemove(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        } else {
            res.redirect("/gallery");
        }
    }); 
 });

//  ===========
// AUTH ROUTES
//  ===========

//show register form 

app.get("/register", function (req, res) {
    res.render("register");
});

//handle sign up logic
app.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            //   req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            //   req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/gallery");
        });
    });
});



// show login form
app.get("/login", function (req, res) {
    res.render("login");
});
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/gallery",
        failureRedirect: "/login"
    }), function (req, res) {
    });

//logout route 
app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged you out !");
    res.redirect("/gallery");
});

function dropHandler(ev) {
    console.log('File(s) dropped');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
    }
  }

app.listen(port, function () {
    console.log("listening on port " + port);
});