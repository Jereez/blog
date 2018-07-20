
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var express = require('express');
// var expressSanitizer = require('express-sanitizer');
var app = express();
var methodOverride = require('method-override');


//app configuration

mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
// app.use(expressSanitizer());
app.use(methodOverride("_method"));

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
	username: String,
	email: String,
	password: String,
	phone: Number
});


var Blog = mongoose.model("Blog",blogSchema);
var User = mongoose.model("User",usedSchema);


 
//restful routes

    app.get("/",function(req,res){
    	res.redirect("/login");
    });

	app.get("/blogs",function(req,res){
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

//login

app.get("/login",function(req,res){
	res.render("login");
})


app.post("/login",function(req,res){
	User.find(username:req.body.user.username,password:req.body.user.password,function(err,userBlog){
		console.log(req.body.user.username + req.body.user.password);
		if(err){
			res.render("login");
		}else{
			res.redirect("/blogs");

		}
	})
})

//register

app.get("/register",function(req,res){
	res.render("register");	
})

app.post("/register",function(req,res){
	User.create({req.body.user,function(err,addUser){
		if(err){
			res.render("register");
		}else{
			res.render("login");
			console.log(req.body.user);
		}
	})
	
})


//new blog

app.get("/blogs/new",function(req,res){
	res.render("new");
})

app.post("/blogs",function(req,res){
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


app.get("/blogs/:id",function(req,res){
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


app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.render("/blogs")
		}else{
			res.render("edit",{blog: foundBlog})
		}
	});
})


//update

app.put("/blogs/:id",function(req,res){
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err){
			res.render("/blogs/:id/edit")
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	})
})


//delete

app.delete("/blogs/:id",function(req,res){
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