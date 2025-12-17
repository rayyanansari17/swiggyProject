import mailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

async function sendMail(to, body, text){
    try {
        let user = process.env.EMAIL
        let pass = process.env.PASS

        let send = mailer.createTransport({
            service:"gmail",
            auth:{
                user,
                pass,
            }
        })

        let sender = await send.sendMail({
            from:user,
            to,
            body,
            text,
        })

        console.log("the mail has been sent to", to, sender.response);
    } catch (error) {
        console.log(error);
    }
}

export default sendMail