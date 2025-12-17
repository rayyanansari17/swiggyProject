import jwt from "jsonwebtoken"

async function auth(req,res,next){
    try {
        let token = req.headers.authorization;
        if(!token){
            return res.status(401).json({msg:"unauthorized no token"})
        }
        token = token.split(" ")[1]
        let decoded = jwt.verify(token, "rayyan")
        req.user = decoded
        next()
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
}

export default auth;