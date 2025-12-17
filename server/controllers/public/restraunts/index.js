import express from "express";
import restaurantModel from "../../../models/Restraunts/Restraunts.js";
import bcrypt from "bcrypt"
import sendMail from "../../../utils/mailsender.js";
import sendSMS from "../../../utils/smssender.js";
import dotenv from "dotenv";
dotenv.config();
import generateToken from "../../../utils/tokengen.js";
import {v4 as uuid} from "uuid";

const router = express.Router();

router.post("/register", async (req, res)=>{
    try {
        let {name, email, phone, password, location} = req.body;
        password = await bcrypt.hash(password, 10);

        let ifExists = await restaurantModel.findOne({$or: [{email: email}, {phone: phone}]});
        // if(!ifExists.isActive)
        // {
        //     await restaurantModel.updateOne({email: email},{$set: {isActive: true}});
        //     return res.status(201).json({msg: `Hello there ${name}! Welcome aboard!!`})
        // }
        if(ifExists)
        {
            return res.status(400).json({msg: "Restaurant already registered"});
        }

        let emailToken = Math.random().toString(36).slice(2, 10);
        let phoneToken = Math.random().toString(36).slice(2, 10);

        let restaurant = {
            _id: uuid(),
            name,
            email,
            phone,
            password,
            location,
            verificationToken: {
                email: emailToken,
                phone: phoneToken
            }
        }
        
        // console.log(`${emailToken}\n${phoneToken}`);


        let emailLink = `http://localhost:${process.env.PORT}/public/customer/verify-email/${emailToken}`;
        let phoneLink = `http://localhost:${process.env.PORT}/public/customer/verify-phone/${phoneToken}`;

        console.log(restaurant);
        await restaurantModel.insertOne(restaurant);

        await sendMail(email, name, emailLink);
        await sendSMS(phone, name, phoneLink);
        res.status(201).json({msg: `Hello there ${name}! Welcome aboard!!`});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: error.message});
    }
});

router.get("/verify-email/:email_token", async (req, res)=>{
    try {
        let emailToken = req.params.email_token;
        let restaurant = await restaurantModel.findOne({ "verificationToken.email": emailToken});
        if(!restaurant)
        {
            return res.status(404).json({msg: "User not found. Please register!!"});
        }
        await restaurantModel.updateOne({"verificationToken.email": emailToken}, {$set: {"isVerified.email": true, "verificationToken.email": null}});
        res.status(201).json({msg: "Email verified successfully"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: error.message});
    }
});

router.get("/verify-phone/:phone_token", async (req, res)=>{
    try {
        let phoneToken = req.params.phone_token;
        let restaurant = await restaurantModel.findOne({ "verificationToken.phone": phoneToken});
        if(!restaurant)
        {
            return res.status(404).json({msg: "User not found. Please register!!"});
        }
        restaurant.isVerified.phone = true;
        restaurant.verificationToken.phone = null;
        await restaurantModel.updateOne({"verificationToken.phone": phoneToken}, {$set: {"isVerified.phone": true, "verificationToken.phone": null}});
        res.status(201).json({msg: "Phone verified successfully"})
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: error.message});
    }
});

router.post("/login", async (req, res)=>{
    try {
        let {email, password} = req.body;
        let restaurant = await restaurantModel.findOne({email: email});
        if(!restaurant)
        {
            return res.status(404).json({msg: "User not found"});
        }
        if(!restaurant.isVerified.email || !restaurant.isVerified.phone)
        {
            return res.status(401).json({msg: "You have not verified your phone or Email. Please verify before logging in!"});
        }
        let passCheck = await bcrypt.compare(password, restaurant.password);
        if(!passCheck)
        {
            return res.status(401).json({msg: "Invalid credentials"});
        }
        let payload = {
            id: restaurant._id,
            email: restaurant.email,
            phone: restaurant.phone,
            isActive: restaurant.isActive
        };
        const token = await generateToken(payload);
        res.status(200).json({msg: "Logged In successfully!", Token: token});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: error.message});
    }
});

export default router;