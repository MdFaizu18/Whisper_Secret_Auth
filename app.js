require('dotenv').config();

const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();
const port = 4000;


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));

// to connect with the mongodb database with mongoose 
async function connecttoMongo(){
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
        console.log("connected to MongoDB");
    }catch(err){
        console.log("Error connecting:" ,err);
    }
}
connecttoMongo();

// to create the schema in mongoose for users --REGISTER 
const userSchema =  new mongoose.Schema({
    email:String,
    password:String
});

// to encrypt the password -- done only before creating model 
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret:secret, encryptedFields: ["password"] });



// to create the mongoose model for users 
const User = new mongoose.model("User",userSchema);


// routes for rendering the --GET REQUEST 
app.get("/",(req,res)=>{
    res.render("home.ejs")
})
app.get("/login",(req,res)=>{
    res.render("login.ejs")
})
app.get("/register",(req,res)=>{
    res.render("register.ejs")
})



// routes for new user for regisration --- POST REQUEST 
app.post("/register",async (req,res)=>{
    // creating document for mongoose to store data in DB 
    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    });
    // newUser.save() <-- instead of this line ------> if error occurs 
    try {
        const savedUser = await newUser.save();
        console.log("User saved successfully:", savedUser);
        res.render("secrets.ejs");  //it will navigate you to corresponding page 
        // res.status(200).send("User registered successfully");
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).send("Error registering user");
    }
});


// routes for already existing user to login --- POST REQUEST 
app.post("/login", async (req, res) => {
    const Ousername = req.body.username;
    const Opassword = req.body.password;

    try { //collect the one user which matches in db
        const foundUser = await User.findOne({ email: Ousername });
        // if it fetched then it would check the password too
        if (foundUser) {
            if (foundUser.password === Opassword) {
                res.render("secrets.ejs");
            } else {
                console.log("Incorrect password");
                res.status(401).send("Incorrect password");
            }
        } else {
            console.log("User not found");
            res.status(404).send("User not found");
        }
    } catch (err) {
        console.error("Error finding user:", err);
        res.status(500).send("Error during login");
    }
});




app.listen(port,()=>{
    console.log(`server is running on the port ${port}`)
})
