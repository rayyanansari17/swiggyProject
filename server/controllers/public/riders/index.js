import express from "express"
import riderModel from "../../../models/Riders/Riders.js";
import bcrypt from "bcrypt"
import sendMail from "../../../utils/mailsender.js";
import sendSMS from "../../../utils/smssender.js";
import dotenv from "dotenv"
dotenv.config()
import generateToken from "../../../utils/tokengen.js";
import {v4 as uuid} from "uuid"


const router = express.Router();

router.post("/register", async (req, res)=>{
    try {
        let {name, email, phone, password, location} = req.body;
        password = await bcrypt.hash(password, 10);

        let ifExists = await riderModel.findOne({$or: [{email: email},{phone: phone}]});
        // if(!ifExists.isActive)
        // {
        //     await riderModel.updateOne({email: email},{$set: {isActive: true}});
        //     return res.status(201).json({msg: `Hello there ${name}! Welcome aboard!!`})
        // }
        if(ifExists)
        {
            return res.status(400).json({msg: "Rider already exists"});
        }

        let emailToken = Math.random().toString(36).slice(2, 10);
        let phoneToken = Math.random().toString(36).slice(2, 10);

        let rider = {
            _id: uuid(),
            name,
            email,
            phone,
            password,
            verificationToken: {
                email: emailToken,
                phone: phoneToken
            }
        }
        
        // console.log(`${emailToken}\n${phoneToken}`);


        let emailLink = `http://localhost:${process.env.PORT}/public/customer/verify-email/${emailToken}`;
        let phoneLink = `http://localhost:${process.env.PORT}/public/customer/verify-phone/${phoneToken}`;

        console.log(rider);
        await riderModel.insertOne(rider);

        await sendMail(email, name, emailLink);
        await sendSMS(phone, name, phoneLink);
        res.status(201).json({msg: `Hello there ${name}! Welcome aboard!!`});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message});
    }
});

router.get("/verify-email/:email_token", async (req, res)=>{
    try {
        let emailToken = req.params.email_token;
        let rider = await riderModel.findOne({ "verificationToken.email": emailToken});
        if(!rider)
        {
            return res.status(404).json({msg: "Rider not found. Please register!!"});
        }
        await riderModel.updateOne({"verificationToken.email": emailToken}, {$set: {"isVerified.email": true, "verificationToken.email": null}});
        res.status(201).json({msg: "Email verified successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message});
    }
});

router.get("/verify-phone/:phone_token", async (req, res)=>{
    try {
        let phoneToken = req.params.phone_token;
        let rider = await riderModel.findOne({ "verificationToken.phone": phoneToken});
        if(!rider)
        {
            return res.status(404).json({msg: "Rider not found. Please register!!"});
        }
        rider.isVerified.phone = true;
        rider.verificationToken.phone = null;
        await riderModel.updateOne({"verificationToken.phone": phoneToken}, {$set: {"isVerified.phone": true, "verificationToken.phone": null}});
        res.status(201).json({msg: "Phone verified successfully"})
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: error.message});
    }
});

router.post("/login", async (req, res)=>{
    try {
        let {email, password} = req.body;
        let rider = await riderModel.findOne({email: email});
        if(!rider)
        {
            return res.status(404).json({msg: "Rider not found"});
        }
        if(!rider.isVerified.email || !rider.isVerified.phone)
        {
            return res.status(401).json({msg: "You have not verified your phone or Email. Please verify before logging in!"});
        }
        let passCheck = await bcrypt.compare(password, rider.password);
        if(!passCheck)
        {
            return res.status(401).json({msg: "Invalid credentials"});
        }
        let payload = {
            id: rider._id,
            email: rider.email,
            phone: rider.phone,
            isActive: rider.isActive
        };
        const token = await generateToken(payload);
        res.status(200).json({msg: "Logged In successfully!", Token: token});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: error.message});
    }
});

export default router;