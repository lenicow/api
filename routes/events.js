const router = require("express").Router();
const Event = require("../models/Event");
const verify = require("../verifyToken")

router.post("/", verify, async (req,res) =>{
  if(req.user.role == "admin" || req.user.role == "organisateur"){
    const {name, description, genre, location, startDate, endDate, inventory} = req.body
    const organisateur = req.user.id
    const newEvent = new Event({name, description, genre, location, startDate, endDate, inventory, organisateur});
    try{
      const createdEvent = await newEvent.save();
      res.status(201).json(createdEvent)
    }catch(err){
      if(err.code === 11000){
        return res.status(400).json("Le nom d'évènement existe déjà")
      }
      res.status(500).json(err)
    }
  } else {
    res.status(403).json("Vous n'êtes pas un organisateur")
  }
})

router.put("/:id", verify, async (req,res) =>{
  const event = await Event.findById(req.params.id)
  if(!event){
    return res.status(404).json("L'event n'existe pas")
  }
  if(req.user.role == "admin" || req.user.role == "organisateur" && event.organisateur == req.user.id){
    try{
      const {name, description, genre, location, startDate, endDate} = req.body
      const updatedEvent = await Event.findByIdAndUpdate(req.params.id,{
        $set:{name, description, genre, location, startDate, endDate},
      },{
        new:true
      });
      res.status(201).json(updatedEvent)
    }catch(err){
      if(err.code === 11000){
        return res.status(400).json("Le nom d'évènement existe déjà")
      }
      res.status(500).json(err)
    }
  } else {
    res.status(403).json("Vous ne pouvez modifier que vos évènements")
  }
})

router.delete("/:id", verify, async (req,res) =>{
  const event = await Event.findById(req.params.id)
  if(!event){
    return res.status(404).json("L'event n'existe pas")
  }
  if(req.user.role == "admin" || req.user.role == "organisateur" && event.organisateur == req.user.id){
    try{
      await Event.findByIdAndDelete(req.params.id)
      res.status(201).json("Event deleted")
    }catch(err){
      res.status(500).json(err)
    }
  } else {
    res.status(403).json("Vous ne pouvez supprimer que vos events")
  }
})

router.get("/find/:id", verify, async (req,res) =>{
    try{
      const event = await Event.findById(req.params.id)
      res.status(201).json(event)
    }catch(err){
      res.status(500).json(err)
    }
})

router.get("/random", verify, async (req,res) =>{
  const genre = req.query.genre;
    let event;
    try{
      if(genre){
        event = await Event.aggregate([
          {
            $match: {genre: genre}
          },
          {
            $sample: {size: 1}
          },
        ])
      } else {
        event = await Event.aggregate([
          {
            $sample: {size: 1}
          },
        ])
      }
      res.status(201).json(event)
    }catch(err){
      res.status(500).json(err)
    }
})

router.get("/", verify, async (req,res) =>{
  const genre = req.query.genre;
    try{
      if(genre){
        const event = await Event.find({genre:genre});
        res.status(201).json(event)
      } else {
        const event = await Event.find();
        res.status(201).json(event)
      }
    }catch(err){
      res.status(500).json(err)
    }
})

module.exports = router
