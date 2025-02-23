if(process.env.NODE_ENV !== 'production'){
  require("dotenv").config();
}

console.log(process.env.SECRET);

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const app = express();
const uri = process.env.ATLASDB_URL;
const path = require("path");
const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
const listings= require("./Routes/listing.js")
const reviews= require("./Routes/Reviews.js")
const users = require("./Routes/user.js");
const session = require("express-session"); 
const MONGOSTORE = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => console.error("Error connecting to MongoDB", error));
async function main() {
  await mongoose.connect(uri);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const store = MONGOSTORE.create({
  mongoUrl: uri,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SECRET,
  },  
});

store.on("error", () =>{
  console.log("Error in MONGO SESSION STORE", err);
});


const sessionOptions={
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now()+7*24*60*60*1000,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true // it is use to protect from cross scripting attack 
  }
}

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const ExpressError = require("./utils/ExpressError");
app.use((req,res,next)=>{
  res.locals.success= req.flash("success");
  res.locals.error= req.flash("error");
  res.locals.currentUser= req.user;
  next();
})

//User Routes
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "student",
//   })
//   let newUser = await User.register(fakeUser, "helloworld"); //username, password
//   res.send(newUser);
// })
app.use("/", users);
//Listings
app.use('/', listings);
//Reviews
app.use('/', reviews);
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.render("./listings/err.ejs", { message });
  // res.status(statusCode).send(message);
});
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
