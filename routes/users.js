const router = require("express").Router();
const User = require("../models/User");
const Order = require("../models/Order");
const Event = require("../models/Event")
const CryptoJS = require("crypto-js");
const verify = require("../verifyToken")

router.put("/:id", verify, async (req,res) =>{
  if(req.user.id === req.params.id || req.user.role == "admin"){
    if(req.body.password){
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password, process.env.SECRET_KEY).toString();
    }
    try{
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      },{new:true})
      res.status(200).json(updatedUser);
    }catch(err){
      res.status(500).json(err)
    }
  } else {
    res.status(403).json("Vous ne pouvez mettre à jour que votre compte")
  }
})

router.delete("/:id", verify, async (req,res) =>{
  if(req.user.id === req.params.id || req.user.role == "admin"){
    try{
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted...");
    }catch(err){
      res.status(500).json(err)
    }
  } else {
    res.status(403).json("Vous ne pouvez supprimer que votre compte")
  }
})

router.get("/find/:id", verify, async (req,res) =>{
  try{
    const user = await User.findById(req.params.id);
    const {password, ...info} = user._doc
    res.status(200).json(info);
  }catch(err){
    res.status(500).json(err)
  }
})

router.get("/", verify, async (req,res) =>{
  const query = req.query.new;
  if(req.user.role == "admin"){
    try{
      const users = query ? await User.find().sort({_id:-1}).limit(10) : await User.find();
      res.status(200).json(users);
    }catch(err){
      res.status(500).json(err)
    }
  } else {
    res.status(403).json("Vous n'êtes pas autorisé à voir tous les utilisateurs")
  }
})

router.post("/participate", verify, async (req,res) => {
  const eventId = req.body.eventId;
  const userId = req.user.id
  const infos = new Order({
    eventId, userId
  })
  const ifExist = await Order.find({eventId:eventId,userId:userId})
  if(ifExist.length <= 0){
    try{
      const participate = await infos.save()
      const inventory = await Event.findById(eventId)
      inventory.inventory -= 1
      await inventory.save();
      res.status(201).json(participate)
    }catch(err){
      res.status(500).json(err)
    }
  } else {
    return res.status(400).json("Vous participez déjà à cet évènement")
  }
})

module.exports = router
