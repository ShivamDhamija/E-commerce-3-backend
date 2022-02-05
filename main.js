const express=require("express");
const fs=require("fs");

const multer=require("multer");

const session=require("express-session");

const checkAuth=require("./middlewres/checkAuth");
const sendEmail=require("./methods/sendEmail");
const passwordEmail=require("./methods/psswordEmail");
const { use } = require("express/lib/application");

const upload =multer({dest:"uploads"});

const app=express();
const port=3000

app.use(express.static("public"));
app.use(express.static("uploads"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))

app.set("view engine","ejs");

app.get("/",function(req,res){
    res.render("root");
})

app.route("/logIn")
.get(function(req,res){
    res.render("login",{err:""});
})
.post(function(req,res){

    let {userName,password}=req.body;

    if(userName===""||password==="")
    {
        res.render("login",{err:"pleas enter write detailss"});
          return;
    }

    fs.readFile("./db.txt","utf-8",function(err,data)
    {
        if(err)
        {
            res.render("login",{err:err});
            return;
        }
        
        let users=[];
        
        if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
        users=JSON.parse(data);
        else
        {
            res.render("signup",{err:"no user sign-upd , first sign-up"});
            return;
        }

        for( let i = 0; i< users.length; i++ )
          {
              let user = users[i];
              
              if(user.userName === userName&&user.password===password)
              {
                req.session.is_logged_in = true;
                req.session.user = user;//
    
                res.redirect("/home");
                  return;
              }
          }
          
          res.render("signup",{err:"NO user find with same crudential."});
          return;
          
    });

})

app.route("/signUp")
.get(function(req,res){
    res.render("signup",{err:""});
})
.post(function(req,res){
  let {name,userName,gmail,phoneNo,password}=req.body;

    if(name===""||userName===""||gmail===""||phoneNo===""||password==="")
    {
        res.render("signup",{err:"pleas enter write detailss"});
          return;
    }

  fs.readFile("./db.txt","utf-8",function(err,data)
  {
      if(err)
      {
          res.render("signup",{err:err});
          return;
      }
      
      let users=[];
      
      if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
      users=JSON.parse(data);

      for( let i = 0; i< users.length; i++ )
		{
			let user = users[i];

			if(user.userName === userName)
			{
				res.render("signup",{ err: "User already exisits" })
				return
			}
		}

		let user = {
			name: name,
			userName: userName,
			password : password,
			gmail: gmail,
			phoneNo : phoneNo,
      isVarified:false,
      mailToken:Date.now(),//mail se check karne ke liya ->wapise ma 
      products:""
    }

		users.push(user);

        fs.writeFile("./db.txt", JSON.stringify(users), function(err)
		{
			if(err)
			{
				res.render("signup", { err: "something went wrong" })
				return
			}

      sendEmail(gmail, user.mailToken ,function(err, data)
			{
				if(err)
				{
					res.render("signup", { error: "something went wrong" })
					return
				}

				req.session.is_logged_in = true;
			  req.session.user = user;//

			  res.redirect("/home");
			})
			
		})
  });
})

app.route("/addProduct")
.get(function(req,res){
    res.render("addProduct");
})
.post(upload.single("pImage"),function(req,res){
   
    let {pName,pPrice,description}=req.body;
    let product={pName,pPrice,description};
    product.pImage=req.file.filename;
    
     fs.readFile("./product.txt","utf-8",function(err,data)
  {
    let products=[];
      
    if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
      products=JSON.parse(data);

    products.push(product);
    fs.writeFile("product.txt",JSON.stringify(products),function(){
        res.redirect("/addProduct")
      })
  });


})

app.get("/home", checkAuth ,function(req, res)
{
    fs.readFile("./product.txt","utf-8",function(err,data)
    {
        let products="";
      
        if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
          products=JSON.parse(data);
        if(products.length>5)
          m=5;
        else
          m=products.length;
        res.render("home", { user: req.session.user.userName ,isDiv:products, m:m});

    })
	
})

app.post("/loadmore",function(req,res){
    const {value}=req.body;
    
    
    fs.readFile("./product.txt","utf-8",function(err,data)
    {
        let products="";
      
        if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
          products=JSON.parse(data);
       
          m=JSON.parse(value)+5;
        res.render("home", { user: req.session.user.userName ,isDiv:products, m:m});

    })
})

app.get("/verifymail/:token", function(req, res)
{
	const { token } = req.params;
  
	fs.readFile("./db.txt","utf-8", function(err, data)
	{
		if(data.length > 0)
		{
			data = JSON.parse(data);
		}

		for(let i=0;  i< data.length; i++)
		{
			let user = data[i];

			//console.log(user.mailToken === parseInt(token))

			if(user.mailToken === parseInt(token))
			{
				if(req.session.user)
				{

					req.session.user.isVarified = true;
          data[i].isVarified=true;
					fs.writeFile("./db.txt",JSON.stringify(data),function(){
            res.redirect("/home")
           
          });
          return;
				}
				else
				{
					req.session.is_logged_in = true;
					req.session.user = user;
					req.session.user.isVarified = true;

          data[i].isVarified=true;

          fs.writeFile("./db.txt",JSON.stringify(data),function(){
            res.redirect("/home");
          });
        return;
        	// save in file as well
				}
      }
		}
    res.send("user not found")
	})
})

app.post("/modalsData",function(req,res){
  //console.log(req.body.img)
  const img=req.body.img;
  fs.readFile("./product.txt","utf-8",function(err,data)
    {
        let products="";
        products=JSON.parse(data);
        for( let i=0;i<products.length;i++)
        {
          if(products[i].pImage===img)
          {
            res.send(JSON.stringify(products[i]));
            break;
          }
        }
    })  
})

app.route("/forgotPassword")
.get(function(req,res){
  res.render("forgotPassword");
})
.post(function(req,res){
  let {gmail}=req.body;

  fs.readFile("db.txt","utf-8",function(err,data){
   
    let users=[];
    
    if(data.length>0)
    users=JSON.parse(data);
   let done=true;

    for( let i=0;i<users.length;i++)
    {
      if(users[i].gmail===gmail)
      {
        passwordEmail(gmail, users[i].mailToken ,function(err, data)
			{
				if(err)
				{
					res.render("signup", { error: "something went wrong" })
					return
				}
        done=false;
			  res.redirect("/home");
			})
        break;
      }
    }
  if(done)
    res.send("No User of this Mail exist")
  })
})


app.get("/verifyPasswordMail/:token", function(req, res)
{
	const { token } = req.params;
  
	fs.readFile("./db.txt","utf-8", function(err, data)
	{
		if(data.length > 0)
		{
			data = JSON.parse(data);
		}

		for(let i=0;  i< data.length; i++)
		{
			let user = data[i];

			if(user.mailToken === parseInt(token))
			{
        req.session.is_logged_in = true;
				req.session.user = user;
				req.session.user.isVarified = true;
        res.redirect("/changePassword")
        return;
      }
      
		}
    })
})

app.post("/addToCart",function(req,res){
  imageName=req.body.imageName;
  //get product
  
  fs.readFile("product.txt","utf-8",function(err,data){
    data =JSON.parse(data);
    var productDetails="";
    for(i=0;i<data.length;i++)
    {
      if(data[i].pImage===imageName)
      {
        productDetails=data[i];
        break;
      }
    }
   
    //get user and update it

    fs.readFile("db.txt","utf-8",function(err,data){
      data=JSON.parse(data);
      user=req.session.user;
      for( i=0;i<data.length;i++)
      {
       if(data[i].userName===user.userName&&data[i].password===user.password)
        {
          if(data[i].products.length>0)
          {
            product=data[i].products;
            product.push(productDetails);
           // data[i].products=JSON.parse(data[i].products)
            data[i].products=product;
            data[i].quantitiy=0;
          }
         else
         {
          data[i].products=[productDetails]
          data[i].quantitiy=0;
         }
         break;
        }
       }
      fs.writeFile("./db.txt",JSON.stringify(data),function()
      {
        res.redirect("/home");
      });
    })
  })
})

app.route("/goToCart")
.get(function(req,res){
  res.render("cartPage",{user:req.session.user.userName,products:req.session.user.products})
})


app.route("/changePassword")
.get(function(req,res){
  
  res.render("changePassword",{user:req.session.user.userName});
})
.post(function(req,res){
  let {newPass}=req.body;
 
  fs.readFile("db.txt","utf-8",function(err,data){
    data=JSON.parse(data);
    for(i=0;i<data.length;i++)
    { 

      if(data[i].userName===req.session.user.userName&&data[i].gmail===req.session.user.gmail)
     { 
       data[i].password=newPass;
      
      fs.writeFile("./db.txt",JSON.stringify(data),function(){
        res.send(200);
        })
        break;
    } 
    } 
  })
})

app.get("/logout", function(req, res)
{
	req.session.destroy();
	res.redirect("/")
})

app.get("*",function(req,res){
    res.send(404);
})

app.listen(port,function(){
    console.log("running on 3000")
})