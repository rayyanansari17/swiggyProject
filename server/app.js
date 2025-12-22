import express from "express"
import dotenv from "dotenv"
import "./utils/dbconnect.js"
import userRouter from "./controllers/public/customers/index.js"
import restaurantRouter from "./controllers/public/restraunts/index.js"
import riderRouter from "./controllers/public/riders/index.js"
import auth from "./auth/auth.js"
import restaurantPrivateRouter from "./controllers/private/restraunts/index.js"
import userPrivateRouter from "./controllers/private/customers/index.js"
dotenv.config()


const port = process.env.PORT 
const app = express();
app.use(express.json())

app.get("/",(req,res)=>{
    try {
        res.status(200).json({msg:"Welcome"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:error})
    }
})

app.use("/user",userRouter)
app.use("/restaurant",restaurantRouter)
app.use("/rider",riderRouter)
app.use(auth)
app.use("/customerPrivate",userPrivateRouter)
app.use("/restaurantPrivate",restaurantPrivateRouter)

app.listen(port,()=>console.log(`Server is running at http://localhost:${port}`))