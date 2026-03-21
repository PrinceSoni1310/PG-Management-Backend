const foodSchema = require("../models/FoodMenuModel")
const uploadtoCloudinary = require("../utils/CloudinaryUtils")

const manageFood = async(req , res) => {

    try{

        const cloudinaryResponse = await uploadtoCloudinary(req.file.path)
        console.log("cloudinary response => ",cloudinaryResponse);

        const food = await foodSchema.create({...req.body,imagePath:cloudinaryResponse.secure_url})
        res.json({
            message : "Food-menu updated",
            data : food
        })

    }catch(err){
        res.status(500).json({
            message : "Error while managing food-menu",
            err : err
        })
    }
}

const getAllFoodDetails = async (req, res) => {

    try{

        const getFoodDetails = await foodSchema.find()
        res.status(200).json({
            message : "food-menu fetched...",
            data : getFoodDetails
        })

    }catch(err){
        res.status(500).json({
            message : "error while getting food-menu",
            err : err
        })
    }
}

const updateFoodMenu = async(req ,res)=> {

    try{

        const updateFood = await foodSchema.findByIdAndUpdate(req.params.id,req.body)
        res.status(500).json({
            message:"Food-menu updated successfully",
            data : updateFood
        })

    }catch(err){
        res.status(500).json({
            message : "Error while updating food-menu",
            err : err
        })
    }
}

const deleteFoodMenu = async (req ,res) => {

    try{

        const deleteMenu = await foodSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message : "Food-menu deleted food-menu",
            data : deleteMenu
        })

    }catch(err){
        res.status(500).json({
            message :"Error while deleting food-menu"
        })
    }

}

module.exports = {
    manageFood,
    getAllFoodDetails,
    updateFoodMenu,
    deleteFoodMenu
}