const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    name:{type: String, required:true, unique:true},
    description:{type: String, required:true},
    genre:{type: String, required:true},
    img:{type:String, required:false},
    location:{type: String, required:true},
    startDate:{type:Date, required:true},
    endDate:{type:Date},
    inventory:{type:Number, required:true},
    organisateur:{type: String, required:true}
  },
  {timestamps: true}
);

module.exports = mongoose.model("Event", EventSchema)