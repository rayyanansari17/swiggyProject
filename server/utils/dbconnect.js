import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()


async function dbConnect(){
    try {
        const DBURI = process.env.URI
        await mongoose.connect(DBURI)
    } catch (error) {
        console.log(error);
    }
}

dbConnect()