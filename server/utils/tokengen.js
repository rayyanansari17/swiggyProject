import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

async function generateToken(userObj)
{
    try {
        const token = await jwt.sign(userObj, process.env.JWT_SECRET, {expiresIn: "1D"});
        return token;
    } catch (error) {
        console.log(error.message);
    }
}

export default generateToken;