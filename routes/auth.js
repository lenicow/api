const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken")

router.post("/register", async (req,res) =>{
  const newUser = new User ({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
    
  })

  try{
    const user = await newUser.save();
    res.status(201).json(user)
  }catch(err){
    res.status(500).json(err);
  }
})

router.post("/login", async (req,res)=>{
  try{
    const user = await User.findOne({email: req.body.email})
    if(!user){
      return res.status(401).json("Mauvais mot de passe ou nom d'utilisateur")
    }

    const bytes  = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if(originalPassword !== req.body.password){
      return res.status(401).json("Mauvais mot de passe ou nom d'utilisateur")
    } else {
      const accessToken = jwt.sign({
        id: user._id, role: user.role
      }, process.env.SECRET_KEY,{expiresIn: "5d"})

      const {password, ...info} = user._doc;
      res.status(200).json({...info, accessToken});
    }

  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = router;