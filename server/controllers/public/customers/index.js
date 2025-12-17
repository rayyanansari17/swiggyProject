import express from "express"
import customerModel from "../../../models/Customers/Customer.js"
import bcrypt from "bcrypt"
import sendMail from "../../../utils/mailsender.js"
import sendSMS from "../../../utils/smssender.js"
import dotenv from "dotenv"
dotenv.config()
import generateToken from "../../../utils/tokengen.js"
import {v4 as uuid} from "uuid"
import restaurantModel from "../../../models/Restraunts/Restraunts.js"


const router = express.Router()

router.post("/register", async (req, res)=>{
    try {
        let {name, email, phone, password, location} = req.body;
        password = await bcrypt.hash(password, 10);

        let ifExists = await customerModel.findOne({$or: [{email: email},{phone: phone}]});
        // if(!ifExists.isActive)
        // {
        //     await customerModel.updateOne({email: email},{$set: {isActive: true}});
        //     return res.status(201).json({msg: `Hello there ${name}! Welcome aboard!!`})
        // }
        if(ifExists)
        {
            return res.status(400).json({msg: "User already exists"});
        }

        let emailToken = Math.random().toString(36).slice(2, 10);
        let phoneToken = Math.random().toString(36).slice(2, 10);

        let user = {
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

        console.log(user);
        await customerModel.insertOne(user);

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
        let user = await customerModel.findOne({ "verificationToken.email": emailToken});
        if(!user)
        {
            return res.status(404).json({msg: "User not found. Please register!!"});
        }
        await customerModel.updateOne({"verificationToken.email": emailToken}, {$set: {"isVerified.email": true, "verificationToken.email": null}});
        res.status(201).json({msg: "Email verified successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message});
    }
});

router.get("/verify-phone/:phone_token", async (req, res)=>{
    try {
        let phoneToken = req.params.phone_token;
        let user = await customerModel.findOne({ "verificationToken.phone": phoneToken});
        if(!user)
        {
            return res.status(404).json({msg: "User not found. Please register!!"});
        }
        user.isVerified.phone = true;
        user.verificationToken.phone = null;
        await customerModel.updateOne({"verificationToken.phone": phoneToken}, {$set: {"isVerified.phone": true, "verificationToken.phone": null}});
        res.status(201).json({msg: "Phone verified successfully"})
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: error.message});
    }
});

router.post("/login", async (req, res)=>{
    try {
        let {email, password} = req.body;
        let user = await customerModel.findOne({email: email});
        if(!user)
        {
            return res.status(404).json({msg: "User not found"});
        }
        if(!user.isVerified.email || !user.isVerified.phone)
        {
            return res.status(401).json({msg: "You have not verified your phone or Email. Please verify before logging in!"});
        }
        let passCheck = await bcrypt.compare(password, user.password);
        if(!passCheck)
        {
            return res.status(401).json({msg: "Invalid credentials"});
        }
        let payload = {
            id: user._id,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive
        };
        const token = await generateToken(payload);
        res.status(200).json({msg: "Logged In successfully!", Token: token});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message});
    }
});


router.get("/view-restraunts", async(req,res)=>{
    try {
        let restaurants = await restaurantModel.find({isActive:true}, {
            name: 1,
            location:l,
            isActive:1,
            _id:0,
            phone:1
        })
        if(restraunt.length == 0){
            return res.status(400).json({msg:"no restraunts available "})
        }
        res.status(200).json(restaurants)
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message});

    }
})

router.post("/view-menu", async (req, res)=>{
    try {
        let restaurantChoice = req.body.restaurant;
        let menu = await restaurantModel.find({name: restaurantChoice}, {
            menu: 1
        })
        res.status(200).json(restaurantChoice,menu)
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message});
    }
})


export default router;
