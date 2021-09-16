const express = require ("express");
const app = express();
const mongoose = require('mongoose');
const dotenv = require("dotenv")
const authRoute = require("./routes/auth")
const usersRoute = require("./routes/users")
const eventsRoute = require("./routes/events")

dotenv.config();


main().catch(err => console.log(err));

async function main() {
  await mongoose
  .connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(()=>console.log("DB Connection Succcessfull"))
  .catch(err => console.log(err));
}

app.use(express.json())

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/events", eventsRoute)

app.listen(8800, ()=>{
  console.log("Backend server is running")
})

