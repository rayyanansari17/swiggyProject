import express from "express"
import customerModel from "../../../models/Customers/Customer.js"

const router = express.Router()

router.get("/getprofile", async(req,res)=>{
    try {
        let isActive = await customerModel.find({_id:req.user.id},{
            _id:0,
            isActive:1,
        })
        if(!isActive[0].isActive){
            return res.status(400).json({msg:"user does not exist!"})
        }

        let user = await customerModel.findOne({_id:req.user.id},{name:1, email: 1, phone: 1, _id:0, location:1, orderHistory:1, currentOrder:1, isVerified:1})
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
})


router.put("/updateprofile", async(req,res)=>{
    try {
        let updatedData = req.body;
        await customerModel.updateOne({_id: req.user.id},{
            $set: updatedData
        })
        res.status(200).json({msg: "your data was updated successfully!"}) 
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
})


router.delete("/deleteprofile", async(req,res)=>{
    try {
        await customerModel.updateOne({_id:req.user.id},{$set:{isActive:false}})
        res.status(200).json({msg:"your account was deleted successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
})


export default router 