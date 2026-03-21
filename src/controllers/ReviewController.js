const reviewSchema = require("../models/ReviewModel")

const manageReview = async(req ,res) => {

    try{

        const addReview = await reviewSchema.create(req.body)
        res.status(201).json({
            message : "review added sucessfully",
            data : addReview
        })

    }catch(err){
        res.status(500).json ({
            message : "Error while adding Review",
            err : err
        })
    }
}

const getAllReview = async (req ,res)=> {

    try{

        const getReview = await reviewSchema.find()
        res.status(200).json({
            message : "Get Review Successfully",
            data : getReview
        })

    }catch(err){
        res.status(500).json({
            message : "Error while fetching the review",
            err : err
        })
    }
}

const updateReviewDetails = async (req,res)=> {

    try{

        const updateReview = await reviewSchema.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).json({
            message : "Notice updated successfully",
            data : updateReview
        })

    }catch(err){
        res.status(500).json({
            message : "Error while updating review",
            err : err
        })
    }
}

const deleteReviewDetails = async(req , res) => {

    try{

        const deleteReview = await reviewSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message  :"Review deleted successfully",
            data  :deleteReview
        })

    }catch(err){
        res.status(500).json({
            message : "Error while deleting review",
            err : err
        })
    }

}

module.exports = {
    manageReview,
    getAllReview,
    updateReviewDetails,
    deleteReviewDetails
}