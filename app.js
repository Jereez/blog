var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var localStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var Nexmo             =             require('nexmo');
var methodOverride = require('method-override');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport({
	service:'gmail',
	host:'smtp.gmail.com',
	auth:{
		user: 'ajereez@gmail.com',
		pass: 'sollamudiyathu'
	}
});
var nexmo = new Nexmo({
  apiKey: 'cb3798fb',
  apiSecret: 'qB9aFXkx8KZ7PiI7'
});


//app configuration
var app = express();
mongoose.connect("mongodb://localhost/restful_blog_app");
app.use(require("express-session")({
 		secret:"i know you will dead one day",
 		resave: false,
 		saveUninitialized: false
 	}));

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(passport.initialize());
  app.use(passport.session());

  


//mongoose model schema

var blogSchema = new mongoose.Schema({
   title : String,
   image : String,
   body : String,
   created : {
   	type:Date, 
   	default:Date.now
   }
	});

var usedSchema = new mongoose.Schema({
	name: String,
	username: {type: String,
	 required: true,
	unique:true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true
 		},
	phone: Number,
	password: String
});

usedSchema.plugin(passportLocalMongoose);
var Blog = mongoose.model("Blog",blogSchema);
var User = mongoose.model("User",usedSchema);

  passport.use(new localStrategy(User.authenticate()));
 	passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
//restful routes

    app.get("/",isLoggedIn,function(req,res){
    	res.redirect("/login");
    });

	app.get("/blogs",isLoggedIn,function(req,res){
		  Blog.find({},function(err,blog)
		  {
		  	if(err){
		  		console.log("error");
		  	}
		  	else{
		  		 res.render("index",{blogs:blog});
		  	 	}
		  })
          
	});



//register

app.get("/register",function(req,res){
	res.render("register");
})
app.post("/register",function(req,res){
	req.body.username
	req.body.password
	User.register(new User({name:req.body.name,
		username: req.body.username,
		email: req.body.email,
		phone:req.body.phone}),
	req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render('register');
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/blogs");
			var mailOptions = {
				from: 'ajereez@gmail.com',
				to: req.body.email,
				subject: 'successfully registered to blog',
				text: 'hi '+req.body.name+' thanks for register to blog...,now u can view blog'
			}
			console.log(mailOptions);
			smtpTransport.sendMail(mailOptions,function(err,info){
				if(err){
					console.log(err);
				}else{
					console.log(info.message);
				}
			}) 
//  			var nexmo = new Nexmo({
//   apiKey: 'cb3798fb',
//   apiSecret: 'qB9aFXkx8KZ7PiI7'
// });
//  			var from = "jereez";
//  			to = '91'+req.body.phone;
//  			var text = "you are successfully register to the blog"
// console.log(to);
// console.log(from);
//  			nexmo.message.sendSms(from,to,text,function(error,response){
//  				if(error){
//  					console.log(error.message);
//  				}else if(response.messages[0].status != '0') {
//     console.error(response);
//     throw 'Nexmo returned back a non-zero status';
// }
//  				else{
//  					console.log(response);
//  				}
//  			})
		});
	});
})

//login

app.get("/login",function(req,res){
	res.render("login");
})
app.post("/login",passport.authenticate("local",{
successRedirect: "/blogs",
failureRedirect: "/login"
}),function(req,res){

})
//logout


function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect("/login");
	}
}

app.get("/logout",isLoggedIn,function(req,res){
	req.logout();
	res.redirect("/login");
})

//new blog

app.get("/blogs/new",isLoggedIn,function(req,res){
	res.render("new");
})

app.post("/blogs",isLoggedIn,function(req,res){
Blog.create(req.body.blog,function(err,newBlog){
if(err){
	res.render("new");
}
else{
	res.redirect("/blogs")
}
});
})


//show route


app.get("/blogs/:id",isLoggedIn,function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
         if(err){
         	res.redirect("/blogs");
         }
         else{
         	res.render("show",{blog:foundBlog});
         }

	})
})



// edit


app.get("/blogs/:id/edit",isLoggedIn,function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.render("/blogs")
		}else{
			res.render("edit",{blog: foundBlog})
		}
	});
})


//update

app.put("/blogs/:id",isLoggedIn,function(req,res){
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err){
			res.render("/blogs/:id/edit")
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	})
})


//delete

app.delete("/blogs/:id",isLoggedIn,function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
					}
					else{
						res.redirect("/blogs");
					}
	})
})


//server configure

app.listen(3000,()=>{
	console.log('server start')
});