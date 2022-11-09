const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./User");
const dotenv= require("dotenv");
dotenv.config();
const PORT = process.env.PORT_ONE || 7070;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology:true},
 ()=> {
       console.log("Auth-service db connected");
});

//Register user
app.post("/auth/register", async(req, res) => {
    const { email, password, name } = req.body;

    const userExists = await User.findOne({ email });
    if(userExists){
        return res.json({ message: "User already exists" });
    }else {
        const newUser = new User({
            name,
            email,
            password
        });

        newUser.save();
        return res.json(newUser);
    }
}) 

//Login
app.post("/auth/login", async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if(!user){
        return res.json({ message: "User does not exist"});
    }else{

        //Check if password entered is correct
        if(password !== user.password){
            return res.json({ message: "Password is incorrect"});
        }
        
        const payload = {
            email,
            name: user.name
        };
        jwt.sign(payload, process.env.SECRET_KEY , (err, token) => {
            if(err){
                console.log(err);
            }else{
                return res.json({ token });
            }
        })
    }
})
app.listen(PORT, ()=> {
    console.log(`Auth service listening at port ${PORT}`);
});
